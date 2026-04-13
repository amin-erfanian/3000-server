const express = require('express');
const router = express.Router();
const Seller = require('../models/seller');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const VerificationCode = require('../models/verification-code');
const { generateCode } = require('../utilities/generate-code');
const { sendPatternSMS } = require('../services/sms-service');
const bcrypt = require('bcryptjs');
const CustomError = require('../classes/custom-error');
const logger = require('../classes/custom-logger');

router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new CustomError(400, 'MISSING_PHONE', {
      fa: 'شماره همراه الزامی است.',
      en: 'Phone number is required.',
    });
  }

  // Clear any existing code for this phone
  await VerificationCode.deleteOne({ phone });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

  await VerificationCode.create({ phone, code, expiresAt });

  // try {
  //   await sendPatternSMS({ to: phone, code, type: 'login' });
  // } catch (error) {
  //   throw new CustomError(
  //     500,
  //     'MESSAGE_FAILED',
  //     { fa: 'ارسال پیام موفقیت آمیز نبود.', en: 'Message send failed.' },
  //     error,
  //   );
  // }

  res.status(200).json({ message: 'کد تایید به شماره همراه شما ارسال شد.', code });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, code: enteredCode } = req.body;

  const record = await VerificationCode.findOne({ phone });

  if (!record || record.expiresAt < Date.now()) {
    throw new CustomError(400, 'INVALID_OTP', {
      fa: 'کد منقضی شده یا معتبر نیست.',
      en: 'OTP is invalid or expired.',
    });
  }

  if (record.code !== enteredCode) {
    throw new CustomError(400, 'WRONG_OTP', {
      fa: 'کد وارد شده اشتباه است.',
      en: 'OTP is incorrect.',
    });
  }

  await VerificationCode.deleteOne({ phone });

  // Find or create seller
  let seller = await Seller.findOne({ phone });
  let isNew = false;

  if (!seller) {
    seller = await Seller.create({ phone, isVerified: true });
    isNew = true;
    logger.info(`New seller registered [${seller.phone}]`);
  } else {
    logger.info(`Seller logged in [${seller.phone}]`);
  }

  // Create JWT token
  const token = jwt.sign({ _id: seller._id, phone: seller.phone }, SECRET_KEY, { expiresIn: '7d' });

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(isNew ? 201 : 200).json({
    isNew,
    profile: seller.profile ?? {},
  });
});

// ─── Forget Password (kept for later) ────────────────────────────────────────
router.post('/forget-password', async (req, res) => {
  const { phone } = req.body;

  const seller = await Seller.findOne({ phone });
  if (!seller) {
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });
  }

  await VerificationCode.deleteOne({ phone });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  await VerificationCode.create({ phone, code, expiresAt });

  // try {
  //   await sendPatternSMS({ to: phone, code, type: 'resetPassword' });
  // } catch (error) {
  //   throw new CustomError(
  //     500,
  //     'MESSAGE_FAILED',
  //     { fa: 'ارسال پیام موفقیت آمیز نبود.', en: 'Message send failed.' },
  //     error,
  //   );
  // }

  res.status(200).json({ message: 'کد تایید برای تغییر کلمه عبور به شماره همراه شما ارسال شد.' });
});

// ─── Reset Password (kept for later) ─────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { phone, code: enteredCode, password: newPassword } = req.body;

  const record = await VerificationCode.findOne({ phone });

  if (!record || record.expiresAt < Date.now()) {
    throw new CustomError(400, 'INVALID_OTP', {
      fa: 'کد منقضی شده یا معتبر نیست.',
      en: 'OTP is invalid or expired.',
    });
  }

  if (record.code !== enteredCode) {
    throw new CustomError(400, 'WRONG_OTP', {
      fa: 'کد وارد شده اشتباه است.',
      en: 'OTP is incorrect.',
    });
  }

  const seller = await Seller.findOne({ phone });
  if (!seller) {
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });
  }

  const salt = await bcrypt.genSalt(10);
  seller.password = await bcrypt.hash(newPassword, salt);
  await seller.save();

  await VerificationCode.deleteOne({ phone });

  res.status(200).json({ message: 'رمز عبور با موفقیت تغییر یافت.' });
});

module.exports = router;
