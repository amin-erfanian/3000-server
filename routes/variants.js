const express = require('express');
const router = express.Router();
const Variant = require('../models/variant');
const CustomError = require('../classes/custom-error');

// GET all variants
router.get('/', async (req, res) => {
  const {
    page = 1,
    limit = 20,
    isActive,
    status,
    product,
    seller,
    color,
    minPrice,
    maxPrice,
    inStock,
  } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (status) {
    filter.status = status;
  }

  if (product) {
    filter.product = product;
  }

  if (seller) {
    filter.seller = seller;
  }

  if (color) {
    filter.color = color;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseInt(minPrice);
    if (maxPrice) filter.price.$lte = parseInt(maxPrice);
  }

  if (inStock !== undefined) {
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    } else {
      filter.stock = 0;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [variants, total] = await Promise.all([
    Variant.find(filter)
      .populate('product', 'titleFa titleEn slug images.main')
      .populate('seller', 'title slug rating')
      .populate('color', 'title titleEn hexCode')
      .populate('warranty', 'titleFa titleEn duration')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Variant.countDocuments(filter),
  ]);

  res.json({
    data: variants,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET variant by ID
router.get('/:id', async (req, res) => {
  const variant = await Variant.findById(req.params.id)
    .populate('product', 'titleFa titleEn slug images.main category brand')
    .populate('seller', 'title slug rating contactInfo')
    .populate('color', 'title titleEn hexCode')
    .populate('warranty', 'titleFa titleEn description duration');

  if (!variant) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'تنوع محصول یافت نشد.',
      en: 'Variant not found.',
    });
  }

  res.json(variant);
});

// GET variant by SKU
router.get('/sku/:sku', async (req, res) => {
  const variant = await Variant.findOne({ sku: req.params.sku })
    .populate('product', 'titleFa titleEn slug images.main category brand')
    .populate('seller', 'title slug rating contactInfo')
    .populate('color', 'title titleEn hexCode')
    .populate('warranty', 'titleFa titleEn description duration');

  if (!variant) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'تنوع محصول یافت نشد.',
      en: 'Variant not found.',
    });
  }

  res.json(variant);
});

module.exports = router;

