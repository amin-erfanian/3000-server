const express = require('express');
const router = express.Router();
const Brand = require('../models/brand');
const CustomError = require('../classes/custom-error');

// GET all brands
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, isActive, search } = req.query;

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

  const [brands, total] = await Promise.all([
    Brand.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Brand.countDocuments(filter),
  ]);

  res.json({
    data: brands,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET brand by ID
router.get('/:id', async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'برند یافت نشد.',
      en: 'Brand not found.',
    });
  }

  res.json(brand);
});

// GET brand by slug
router.get('/slug/:slug', async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });

  if (!brand) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'برند یافت نشد.',
      en: 'Brand not found.',
    });
  }

  res.json(brand);
});

module.exports = router;

