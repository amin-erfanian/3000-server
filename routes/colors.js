const express = require('express');
const router = express.Router();
const Color = require('../models/color');
const CustomError = require('../classes/custom-error');

// GET all colors
router.get('/', async (req, res) => {
  const { page = 1, limit = 50, isActive, search } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleEn: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [colors, total] = await Promise.all([
    Color.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Color.countDocuments(filter),
  ]);

  res.json({
    data: colors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET color by ID
router.get('/:id', async (req, res) => {
  const color = await Color.findById(req.params.id);

  if (!color) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'رنگ یافت نشد.',
      en: 'Color not found.',
    });
  }

  res.json(color);
});

module.exports = router;

