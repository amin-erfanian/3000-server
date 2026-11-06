// routes/buyer/authentication.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const VerificationCode = require('../../models/verification-code');
const { generateCode } = require('../../utilities/generate-code');
const CustomError = require('../../classes/custom-error');
const logger = require('../../classes/custom-logger');
const { setAuthCookie } = require('../../utilities/auth');
const authMiddleware = require('../../middlewares/authorization');
const role = require('../../middlewares/role');

const PANEL = 'user';
const OTP_TTL_SECONDS = 3 * 60;
const MAX_OTP_ATTEMPTS = 5;

// Accepts Persian/Arabic digits and +98 / 0098 / 98 prefixes, returns 09xxxxxxxxx or null
const normalizePhone = (value) => {
  const phone = String(value ?? '')
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[\s-]/g, '')
    .replace(/^(\+98|0098|98)/, '0')
    .replace(/^9/, '09');

  return /^09\d{9}$/.test(phone) ? phone : null;
};

const toPublicUser = (user) => ({
  _id: user._id,
  phone: user.phone,
  email: user.email,
  profile: user.profile ?? {},
});

/**
 * @route   POST /auth/send-otp
 * @desc    Create a login/signup OTP for a phone number (returned in the response until SMS is wired up)
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (!phone)
    throw new CustomError(400, 'INVALID_PHONE', {
      fa: 'شماره همراه معتبر نیست.',
      en: 'Phone number is invalid.',
    });

  const user = await User.findOne({ phone }).select('status');
  if (user && user.status !== 'active')
    throw new CustomError(403, 'USER_INACTIVE', {
      fa: 'حساب کاربری شما غیرفعال است.',
      en: 'Your account is not active.',
    });

  await VerificationCode.deleteOne({ phone, panel: PANEL });
  const code = generateCode();
  await VerificationCode.create({
    phone,
    code,
    expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
    panel: PANEL,
  });

  res.status(200).json({
    message: 'کد تایید به شماره همراه شما ارسال شد.',
    phone,
    code,
    expiresIn: OTP_TTL_SECONDS,
    isNew: !user,
  });
});

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify the OTP, create the user on first login and set the auth cookie
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const enteredCode = String(req.body.code ?? '').trim();
  const record = phone && (await VerificationCode.findOne({ phone, panel: PANEL }));

  if (!record || record.expiresAt < Date.now())
    throw new CustomError(400, 'INVALID_OTP', {
      fa: 'کد منقضی شده یا معتبر نیست.',
      en: 'OTP is invalid or expired.',
    });

  if (record.code !== enteredCode) {
    record.attempts += 1;
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await VerificationCode.deleteOne({ _id: record._id });
      throw new CustomError(400, 'TOO_MANY_ATTEMPTS', {
        fa: 'تعداد تلاش‌ها بیش از حد مجاز است. لطفا دوباره کد دریافت کنید.',
        en: 'Too many attempts. Please request a new code.',
      });
    }
    await record.save();
    throw new CustomError(400, 'WRONG_OTP', { fa: 'کد وارد شده اشتباه است.', en: 'OTP is incorrect.' });
  }

  await VerificationCode.deleteOne({ _id: record._id });

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
