const express = require('express');
const router = express.Router();
const Seller = require('../../models/seller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const CustomError = require('../../classes/custom-error');
const logger = require('../../classes/custom-logger');
const { setAuthCookie } = require('../../utilities/auth');
const { requirePhone, normalizePhone, issueOtp, verifyOtp } = require('../../helpers/otp');

const PANEL = 'seller';

/**
 * @route   POST /seller/auth/send-otp
 * @desc    Create a login/signup OTP for a phone number and send it by SMS
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  const phone = requirePhone(req.body.phone);
  const otp = await issueOtp({ phone, panel: PANEL });

  res.status(200).json({ message: 'کد تایید به شماره همراه شما ارسال شد.', phone, panel: PANEL, ...otp });
});

/**
 * @route   POST /seller/auth/verify-otp
 * @desc    Verify the OTP, create the seller on first login and set the auth cookie
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  await verifyOtp({ phone, panel: PANEL, code: req.body.code });

  let account = await Seller.findOne({ phone });
  let isNew = false;

  if (!account) {
    const { generateSellerCode } = require('../../utilities/generate-seller-code');
    const uniqueCode = await generateSellerCode();

    account = await Seller.create({ phone, isVerified: true, code: uniqueCode });
    logger.info(`New seller registered [${phone}] with code [${uniqueCode}]`);
    isNew = true;
  } else {
    logger.info(`Seller logged in [${phone}]`);
  }

  const token = jwt.sign({ _id: account._id, phone: account.phone, role: 'seller' }, process.env.SECRET_KEY, {
    expiresIn: '7d',
  });
  setAuthCookie(res, token);
  res.status(isNew ? 201 : 200).json({ isNew, panel: PANEL, profile: account.profile ?? {} });
});

/**
 * @route   POST /seller/auth/forget-password
 * @desc    Send an OTP by SMS for resetting the password
 * @access  Public
 */
router.post('/forget-password', async (req, res) => {
  const phone = requirePhone(req.body.phone);
  const seller = await Seller.findOne({ phone }).select('_id');
  if (!seller)
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });

  const otp = await issueOtp({ phone, panel: PANEL });

  res.status(200).json({ message: 'کد تایید برای تغییر کلمه عبور به شماره همراه شما ارسال شد.', ...otp });
});

/**
 * @route   POST /seller/auth/reset-password
 * @desc    Verify the OTP and set a new password
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { password: newPassword } = req.body;
  if (!newPassword)
    throw new CustomError(400, 'MISSING_PASSWORD', {
      fa: 'رمز عبور جدید الزامی است.',
      en: 'New password is required.',
    });

  const seller = phone && (await Seller.findOne({ phone }));
  if (!seller)
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });

  await verifyOtp({ phone, panel: PANEL, code: req.body.code });

  seller.password = await bcrypt.hash(String(newPassword), await bcrypt.genSalt(10));
  await seller.save();

  res.status(200).json({ message: 'رمز عبور با موفقیت تغییر یافت.' });
});

module.exports = router;
