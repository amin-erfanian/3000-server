const express = require('express');
const router = express.Router();
const Seller = require('../models/seller');
const User = require('../models/user');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const VerificationCode = require('../models/verification-code');
const { generateCode } = require('../utilities/generate-code');
const { sendPatternSMS } = require('../helpers/sms');
const bcrypt = require('bcryptjs');
const CustomError = require('../classes/custom-error');
const logger = require('../classes/custom-logger');

const OTP_TARGETS = {
  user: User,
  seller: Seller,
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

router.post('/send-otp', async (req, res) => {
  const { phone, panel = 'user' } = req.body;
  const normalizedPanel = String(panel).toLowerCase();

  if (!phone) {
    throw new CustomError(400, 'MISSING_PHONE', {
      fa: 'شماره همراه الزامی است.',
      en: 'Phone number is required.',
    });
  }

  if (!OTP_TARGETS[normalizedPanel]) {
    throw new CustomError(400, 'INVALID_PANEL', {
      fa: 'نوع پنل نامعتبر است.',
      en: 'Invalid panel type.',
    });
  }

  await VerificationCode.deleteOne({ phone, panel: normalizedPanel });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

  await VerificationCode.create({ phone, code, expiresAt, panel: normalizedPanel });

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

  res.status(200).json({ message: 'کد تایید به شماره همراه شما ارسال شد.', code, panel: normalizedPanel });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, code: enteredCode, panel = 'user' } = req.body;
  const normalizedPanel = String(panel).toLowerCase();
  const Model = OTP_TARGETS[normalizedPanel];

  if (!Model) {
    throw new CustomError(400, 'INVALID_PANEL', {
      fa: 'نوع پنل نامعتبر است.',
      en: 'Invalid panel type.',
    });
  }

  const record = await VerificationCode.findOne({ phone, panel: normalizedPanel });

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

  await VerificationCode.deleteOne({ phone, panel: normalizedPanel });

  let account = await Model.findOne({ phone });
  let isNew = false;

  if (!account) {
    if (normalizedPanel === 'seller') {
      account = await Model.create({ phone, isVerified: true });
      logger.info(`New seller registered [${phone}]`);
    } else {
      const tempPassword = await bcrypt.hash(`otp-user-${phone}-${Date.now()}`, 10);
      account = await Model.create({
        phone,
        password: tempPassword,
        profile: { firstName: 'کاربر' },
        isPhoneVerified: true,
      });
      logger.info(`New user registered [${phone}]`);
    }
    isNew = true;
  } else {
    if (normalizedPanel === 'seller') {
      logger.info(`Seller logged in [${phone}]`);
    } else {
      account.isPhoneVerified = true;
      account.lastLoginAt = new Date();
      await account.save();
      logger.info(`User logged in [${phone}]`);
    }
  }

  const token = jwt.sign({ _id: account._id, phone: account.phone, role: normalizedPanel }, SECRET_KEY, {
    expiresIn: '7d',
  });

  setAuthCookie(res, token);

  res.status(isNew ? 201 : 200).json({
    isNew,
    panel: normalizedPanel,
    profile: account.profile ?? {},
  });
});

router.post('/admin/sign-in', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new CustomError(400, 'MISSING_CREDENTIALS', {
      fa: 'شماره همراه و رمز عبور الزامی است.',
      en: 'Phone and password are required.',
    });
  }

  const admin = await Admin.findOne({ phone });
  if (!admin) {
    throw new CustomError(401, 'INVALID_CREDENTIALS', {
      fa: 'اطلاعات ورود نامعتبر است.',
      en: 'Invalid credentials.',
    });
  }

  if (admin.password !== password) {
    throw new CustomError(401, 'INVALID_CREDENTIALS', {
      fa: 'اطلاعات ورود نامعتبر است.',
      en: 'Invalid credentials.',
    });
  }

  if (!admin.isActive) {
    throw new CustomError(403, 'ADMIN_DISABLED', {
      fa: 'دسترسی این مدیر غیرفعال شده است.',
      en: 'Admin access is disabled.',
    });
  }

  const token = jwt.sign({ _id: admin._id, phone: admin.phone, role: 'admin' }, SECRET_KEY, {
    expiresIn: '7d',
  });
  setAuthCookie(res, token);

  res.status(200).json({
    panel: 'admin',
    profile: { name: admin.name, phone: admin.phone },
  });
});

router.post('/sign-out', async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'خروج انجام شد.' });
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

  await VerificationCode.deleteOne({ phone, panel: 'seller' });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  await VerificationCode.create({ phone, code, expiresAt, panel: 'seller' });

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

  const record = await VerificationCode.findOne({ phone, panel: 'seller' });

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

  await VerificationCode.deleteOne({ phone, panel: 'seller' });

  res.status(200).json({ message: 'رمز عبور با موفقیت تغییر یافت.' });
});

module.exports = router;
