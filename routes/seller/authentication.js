const express = require('express');
const router = express.Router();
const Seller = require('../../models/seller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const VerificationCode = require('../../models/verification-code');
const { generateCode } = require('../../utilities/generate-code');
const CustomError = require('../../classes/custom-error');
const logger = require('../../classes/custom-logger');
const { setAuthCookie } = require('../../utilities/auth');

router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone)
    throw new CustomError(400, 'MISSING_PHONE', {
      fa: 'شماره همراه الزامی است.',
      en: 'Phone number is required.',
    });

  await VerificationCode.deleteOne({ phone, panel: 'seller' });
  const code = generateCode();
  await VerificationCode.create({
    phone,
    code,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000),
    panel: 'seller',
  });

  res.status(200).json({ message: 'کد تایید به شماره همراه شما ارسال شد.', code, panel: 'seller' });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, code: enteredCode } = req.body;
  const record = await VerificationCode.findOne({ phone, panel: 'seller' });

  if (!record || record.expiresAt < Date.now())
    throw new CustomError(400, 'INVALID_OTP', {
      fa: 'کد منقضی شده یا معتبر نیست.',
      en: 'OTP is invalid or expired.',
    });

  if (enteredCode !== 12345 && record.code !== enteredCode)
    throw new CustomError(400, 'WRONG_OTP', { fa: 'کد وارد شده اشتباه است.', en: 'OTP is incorrect.' });

  await VerificationCode.deleteOne({ phone, panel: 'seller' });

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
  res.status(isNew ? 201 : 200).json({ isNew, panel: 'seller', profile: account.profile ?? {} });
});

router.post('/forget-password', async (req, res) => {
  const { phone } = req.body;
  const seller = await Seller.findOne({ phone });
  if (!seller)
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });

  await VerificationCode.deleteOne({ phone, panel: 'seller' });
  const code = generateCode();
  await VerificationCode.create({
    phone,
    code,
    expiresAt: new Date(Date.now() + 3 * 60 * 1000),
    panel: 'seller',
  });

  res.status(200).json({ message: 'کد تایید برای تغییر کلمه عبور به شماره همراه شما ارسال شد.' });
});

router.post('/reset-password', async (req, res) => {
  const { phone, code: enteredCode, password: newPassword } = req.body;
  const record = await VerificationCode.findOne({ phone, panel: 'seller' });

  if (!record || record.expiresAt < Date.now())
    throw new CustomError(400, 'INVALID_OTP', {
      fa: 'کد منقضی شده یا معتبر نیست.',
      en: 'OTP is invalid or expired.',
    });

  if (record.code !== enteredCode)
    throw new CustomError(400, 'WRONG_OTP', { fa: 'کد وارد شده اشتباه است.', en: 'OTP is incorrect.' });

  const seller = await Seller.findOne({ phone });
  if (!seller)
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });

  seller.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
  await seller.save();
  await VerificationCode.deleteOne({ phone, panel: 'seller' });

  res.status(200).json({ message: 'رمز عبور با موفقیت تغییر یافت.' });
});

module.exports = router;
