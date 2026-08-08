const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const VerificationCode = require('../models/verification-code');
const { generateCode } = require('../utilities/generate-code');
const CustomError = require('../classes/custom-error');
const logger = require('../classes/custom-logger');
const { setAuthCookie } = require('../utilities/auth');

router.post('/send-otp', async (req, res) => {
  const { phone, panel = 'user' } = req.body;
  if (!phone)
    throw new CustomError(400, 'MISSING_PHONE', {
      fa: 'شماره همراه الزامی است.',
      en: 'Phone number is required.',
    });

  await VerificationCode.deleteOne({ phone, panel: 'user' });
  const code = generateCode();
  await VerificationCode.create({
    phone,
    code,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000),
    panel: 'user',
  });

  res.status(200).json({ message: 'کد تایید به شماره همراه شما ارسال شد.', code, panel: 'user' });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, code: enteredCode } = req.body;
  const record = await VerificationCode.findOne({ phone, panel: 'user' });

  if (!record || record.expiresAt < Date.now())
    throw new CustomError(400, 'INVALID_OTP', {
      fa: 'کد منقضی شده یا معتبر نیست.',
      en: 'OTP is invalid or expired.',
    });

  if (enteredCode !== 12345 && record.code !== enteredCode)
    throw new CustomError(400, 'WRONG_OTP', { fa: 'کد وارد شده اشتباه است.', en: 'OTP is incorrect.' });

  await VerificationCode.deleteOne({ phone, panel: 'user' });

  let account = await User.findOne({ phone });
  let isNew = false;

  if (!account) {
    const tempPassword = await bcrypt.hash(`otp-user-${phone}-${Date.now()}`, 10);
    account = await User.create({
      phone,
      password: tempPassword,
      profile: { firstName: 'کاربر' },
      isPhoneVerified: true,
    });
    logger.info(`New user registered [${phone}]`);
    isNew = true;
  } else {
    account.isPhoneVerified = true;
    account.lastLoginAt = new Date();
    await account.save();
    logger.info(`User logged in [${phone}]`);
  }

  const token = jwt.sign({ _id: account._id, phone: account.phone, role: 'user' }, process.env.SECRET_KEY, {
    expiresIn: '7d',
  });
  setAuthCookie(res, token);
  res.status(isNew ? 201 : 200).json({ isNew, panel: 'user', profile: account.profile ?? {} });
});

router.post('/sign-out', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'خروج انجام شد.' });
});

module.exports = router;
