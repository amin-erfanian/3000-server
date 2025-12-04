const express = require('express');
const router = express.Router();
const Warranty = require('../models/warranty');
const CustomError = require('../classes/custom-error');

// GET all warranties
router.get('/', async (req, res) => {
  const { page = 1, limit = 50, isActive, search } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    filter.$or = [
      { titleFa: { $regex: search, $options: 'i' } },
      { titleEn: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [warranties, total] = await Promise.all([
    Warranty.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Warranty.countDocuments(filter),
  ]);

  res.json({
    data: warranties,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET warranty by ID
router.get('/:id', async (req, res) => {
  const warranty = await Warranty.findById(req.params.id);

  if (!warranty) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'گارانتی یافت نشد.',
      en: 'Warranty not found.',
    });
  }

  res.json(warranty);
});

module.exports = router;

