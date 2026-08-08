const express = require('express');
const router = express.Router();
const Admin = require('../../models/admin');
const jwt = require('jsonwebtoken');
const CustomError = require('../../classes/custom-error');
const { setAuthCookie } = require('../../utilities/auth');

router.post('/sign-in', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password)
    throw new CustomError(400, 'MISSING_CREDENTIALS', {
      fa: 'شماره همراه و رمز عبور الزامی است.',
      en: 'Phone and password are required.',
    });

  const admin = await Admin.findOne({ phone });
  if (!admin || admin.password !== password)
    throw new CustomError(401, 'INVALID_CREDENTIALS', {
      fa: 'اطلاعات ورود نامعتبر است.',
      en: 'Invalid credentials.',
    });

  if (!admin.isActive)
    throw new CustomError(403, 'ADMIN_DISABLED', {
      fa: 'دسترسی این مدیر غیرفعال شده است.',
      en: 'Admin access is disabled.',
    });

  const token = jwt.sign({ _id: admin._id, phone: admin.phone, role: 'admin' }, process.env.SECRET_KEY, {
    expiresIn: '7d',
  });
  setAuthCookie(res, token);

  res.status(200).json({ panel: 'admin', profile: { name: admin.name, phone: admin.phone } });
});

module.exports = router;
