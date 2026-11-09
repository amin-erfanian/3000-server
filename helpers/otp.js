// Shared OTP logic for every panel (user, seller, ...)
const crypto = require('crypto');
const VerificationCode = require('../models/verification-code');
const CustomError = require('../classes/custom-error');
const { sendOtpSMS } = require('./sms');

const OTP_TTL_SECONDS = 3 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

// OTP_DEBUG=true skips the SMS and returns the code in the response (local development only)
const isDebug = () => process.env.OTP_DEBUG === 'true';

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

const requirePhone = (value) => {
  const phone = normalizePhone(value);
  if (!phone)
    throw new CustomError(400, 'INVALID_PHONE', {
      fa: 'شماره همراه معتبر نیست.',
      en: 'Phone number is invalid.',
    });
  return phone;
};

// Only a hash of the code is stored, so a DB leak doesn't expose live codes
const hashCode = (phone, panel, code) =>
  crypto
    .createHmac('sha256', process.env.OTP_SECRET || process.env.SECRET_KEY)
    .update(`${panel}:${phone}:${code}`)
    .digest('hex');

/**
 * Generate a code, text it to the phone and store its hash.
 * Returns the fields to put in the response (the code itself only in debug mode).
 */
const issueOtp = async ({ phone, panel }) => {
  const existing = await VerificationCode.findOne({ phone, panel }).select('sentAt');
  const elapsed = existing?.sentAt ? (Date.now() - existing.sentAt.getTime()) / 1000 : Infinity;
  if (elapsed < RESEND_COOLDOWN_SECONDS)
    throw new CustomError(429, 'OTP_COOLDOWN', {
      fa: `لطفا ${Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed)} ثانیه دیگر دوباره تلاش کنید.`,
      en: `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed)} seconds before requesting a new code.`,
    });

  const code = crypto.randomInt(10000, 100000).toString(); // 5 digits
  if (!isDebug()) await sendOtpSMS({ to: phone, code });

  const now = new Date();
  await VerificationCode.findOneAndUpdate(
    { phone, panel },
    {
      code: hashCode(phone, panel, code),
      sentAt: now,
      expiresAt: new Date(now.getTime() + OTP_TTL_SECONDS * 1000),
      attempts: 0,
    },
    { upsert: true },
  );

  return {
    expiresIn: OTP_TTL_SECONDS,
    resendIn: RESEND_COOLDOWN_SECONDS,
    ...(isDebug() && { code }),
  };
};

/**
 * Check the code; throws on failure. The code is single-use and burned after too many wrong tries.
 */
const verifyOtp = async ({ phone, panel, code }) => {
  const record = phone && (await VerificationCode.findOne({ phone, panel }));

  if (!record || record.expiresAt < Date.now())
    throw new CustomError(400, 'INVALID_OTP', {
      fa: 'کد منقضی شده یا معتبر نیست.',
      en: 'OTP is invalid or expired.',
    });

  const expected = Buffer.from(record.code, 'hex');
  const entered = Buffer.from(hashCode(phone, panel, String(code ?? '').trim()), 'hex');
  const matches = expected.length === entered.length && crypto.timingSafeEqual(expected, entered);

  if (!matches) {
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
};

module.exports = { normalizePhone, requirePhone, issueOtp, verifyOtp, OTP_TTL_SECONDS };
