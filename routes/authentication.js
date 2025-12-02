const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const VerificationCode = require('../models/verification-code');
const { generateCode } = require('../utilities/generate-code');
const { sendPatternSMS } = require('../services/sms-service'); // adjust path as needed
const bcrypt = require('bcryptjs');
const CustomError = require('../classes/custom-error');
const logger = require('../classes/custom-logger');

router.post('/signup', async (req, res) => {
  const { phone, password, name } = req.body;

  const userExists = await User.findOne({ phone });
  if (userExists) {
    throw new CustomError(400, 'ALREADY_EXISTS', {
      fa: 'این شماره قبلا ثبت نام شده است.',
      en: 'User already exists.',
    });
  }

  const existingCode = await VerificationCode.findOne({ phone });
  if (existingCode) {
    await VerificationCode.deleteOne({ phone });
  }

  const code = generateCode();

  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await VerificationCode.create({
    phone,
    code,
    expiresAt,
    password: hashedPassword,
    profile: {
      firstName: name,
    },
  });

  try {
    await sendPatternSMS({ to: phone, code, type: 'signup' });
  } catch (error) {
    throw new CustomError(
      500,
      'MESSAGE_FAILED',
      {
        fa: 'ارسال پیام موفقیت آمیز نبود.',
        en: 'Message send failed.',
      },
      error,
    );
  }

  res.status(200).json({ message: 'کد تایید به شماره همراه شما ارسال شد.' });
});

router.post('/verify-phone', async (req, res) => {
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

  const user = await User.create({
    phone: record.phone,
    password: record.password,
    isVerified: true,
    profile: {
      firstName: record.profile.firstName,
    },
  });

  logger.info(`New user signup completed [${user.phone}] [${user.profile.firstName}]`);

  await VerificationCode.deleteOne({ phone });

  const token = jwt.sign(
    {
      _id: user._id,
      phone: user.phone,
    },
    SECRET_KEY,
  );

  res.status(201).json({
    token,
    profile: user.profile,
  });
});

router.post('/forget-password', async (req, res) => {
  const { phone } = req.body;

  const userExists = await User.findOne({ phone });
  if (!userExists) {
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });
  }

  const existingCode = await VerificationCode.findOne({ phone });
  if (existingCode) {
    await VerificationCode.deleteOne({ phone });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

  await VerificationCode.create({
    phone,
    code,
    expiresAt,
  });

  try {
    await sendPatternSMS({
      to: phone,
      code,
      type: 'resetPassword',
    });
  } catch (error) {
    console.log(error);
    throw new CustomError(
      500,
      'MESSAGE_FAILED',
      {
        fa: 'ارسال پیام موفقیت آمیز نبود.',
        en: 'Message send failed.',
      },
      error,
    );
  }

  res.status(200).json({ message: 'کد تایید برای تغییر کلمه عبور به شماره همراه شما ارسال شد.' });
});

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

  const user = await User.findOne({ phone });
  if (!user) {
    throw new CustomError(400, 'USER_NOT_FOUND', {
      fa: 'کاربری با این شماره همراه یافت نشد.',
      en: 'User not found.',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();

  await VerificationCode.deleteOne({ phone });

  res.status(200).json({ message: 'رمز عبور با موفقیت تغییر یافت.' });
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });

  if (user && (await user.matchPassword(password))) {
    const { profile } = user;

    const token = jwt.sign(
      {
        _id: user._id,
        phone: user.phone,
      },
      SECRET_KEY,
    );

    res.json({
      token,
      profile: profile,
    });
  } else {
    throw new CustomError(401, 'WRONG_CREDENTIALS', {
      fa: 'شماره همراه یا کلمه عبور وارد شده اشتباه است',
      en: 'Phone number or password is incorrect.',
    });
  }
});

module.exports = router;
