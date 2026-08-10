const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('فرمت فایل نامعتبر است. فقط jpeg, png و webp مجاز است.'), false);
  },
});

router.post('/upload', upload.array('images', 10), (req, res) => {
  if (!req.files?.length)
    return res.status(400).json({ success: false, message: 'هیچ فایلی آپلود نشده است' });

  const dir = (req.body.dir || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
  const uploadDir = path.join(__dirname, '../../uploads', dir);
  fs.mkdirSync(uploadDir, { recursive: true });

  const images = req.files.map((file) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
    return `/uploads/${dir}/${filename}`;
  });

  res.status(200).json({ success: true, images, message: 'تصاویر با موفقیت آپلود شدند' });
});

module.exports = router;
