// routes/buyer/authentication.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const CustomError = require('../../classes/custom-error');
const logger = require('../../classes/custom-logger');
const { setAuthCookie } = require('../../utilities/auth');
const authMiddleware = require('../../middlewares/authorization');
const role = require('../../middlewares/role');
const { requirePhone, normalizePhone, issueOtp, verifyOtp } = require('../../helpers/otp');

const PANEL = 'user';

const toPublicUser = (user) => ({
  _id: user._id,
  phone: user.phone,
  email: user.email,
  profile: user.profile ?? {},
});

/**
 * @route   POST /auth/send-otp
 * @desc    Create a login/signup OTP for a phone number and send it by SMS
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  const phone = requirePhone(req.body.phone);

  const user = await User.findOne({ phone }).select('status');
  if (user && user.status !== 'active')
    throw new CustomError(403, 'USER_INACTIVE', {
      fa: 'حساب کاربری شما غیرفعال است.',
      en: 'Your account is not active.',
    });

  const otp = await issueOtp({ phone, panel: PANEL });

  res.status(200).json({
    message: 'کد تایید به شماره همراه شما ارسال شد.',
    phone,
    isNew: !user,
    ...otp,
  });
});

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify the OTP, create the user on first login and set the auth cookie
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  await verifyOtp({ phone, panel: PANEL, code: req.body.code });

  let user = await User.findOne({ phone });
  let isNew = false;

  if (!user) {
    // OTP-only accounts still need a password to satisfy the schema
    const tempPassword = await bcrypt.hash(`otp-user-${phone}-${Date.now()}`, 10);
    user = await User.create({
      phone,
      password: tempPassword,
      profile: { firstName: 'کاربر' },
      isPhoneVerified: true,
      lastLoginAt: new Date(),
    });
    logger.info(`New user registered [${phone}]`);
    isNew = true;
  } else {
    if (user.status !== 'active')
      throw new CustomError(403, 'USER_INACTIVE', {
        fa: 'حساب کاربری شما غیرفعال است.',
        en: 'Your account is not active.',
      });

    user.isPhoneVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
    logger.info(`User logged in [${phone}]`);
  }

  const token = jwt.sign({ _id: user._id, phone: user.phone, role: 'user' }, process.env.SECRET_KEY, {
    expiresIn: '7d',
  });
  setAuthCookie(res, token);
  res.status(isNew ? 201 : 200).json({ isNew, user: toPublicUser(user) });
});

/**
 * @route   GET /auth/me
 * @desc    Get the logged-in user (the cookie is httpOnly, so the client asks the server)
 * @access  User
 */
router.get('/me', authMiddleware, role(['user']), async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || user.status !== 'active')
    throw new CustomError(401, 'INVALID_ACCESS', { fa: 'دسترسی غیر مجاز', en: 'Invalid access' });

  res.status(200).json({ user: toPublicUser(user) });
});

/**
 * @route   POST /auth/sign-out
 * @desc    Clear the auth cookie
 * @access  Public
 */
router.post('/sign-out', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'خروج انجام شد.' });
});

module.exports = router;
