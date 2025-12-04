const express = require('express');
const router = express.Router();
const Seller = require('../models/seller');
const CustomError = require('../classes/custom-error');

// GET all sellers
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, isActive, status, isVerified, search } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (status) {
    filter.status = status;
  }

  if (isVerified !== undefined) {
    filter.isVerified = isVerified === 'true';
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [sellers, total] = await Promise.all([
    Seller.find(filter)
      .select('-user')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Seller.countDocuments(filter),
  ]);

  res.json({
    data: sellers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET seller by ID
router.get('/:id', async (req, res) => {
  const seller = await Seller.findById(req.params.id).select('-user');

  if (!seller) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'فروشنده یافت نشد.',
      en: 'Seller not found.',
    });
  }

  res.json(seller);
});

// GET seller by slug
router.get('/slug/:slug', async (req, res) => {
  const seller = await Seller.findOne({ slug: req.params.slug }).select('-user');

  if (!seller) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'فروشنده یافت نشد.',
      en: 'Seller not found.',
    });
  }

  res.json(seller);
});

// GET seller by code
router.get('/code/:code', async (req, res) => {
  const seller = await Seller.findOne({ code: req.params.code }).select('-user');

  if (!seller) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'فروشنده یافت نشد.',
      en: 'Seller not found.',
    });
  }

  res.json(seller);
});

// GET seller products
router.get('/:id/variants', async (req, res) => {
  const Variant = require('../models/variant');
  const { page = 1, limit = 20, status } = req.query;

  const seller = await Seller.findById(req.params.id);

  if (!seller) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'فروشنده یافت نشد.',
      en: 'Seller not found.',
    });
  }

  const filter = { seller: req.params.id };
  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [variants, total] = await Promise.all([
    Variant.find(filter)
      .populate('product', 'titleFa titleEn slug images.main')
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

module.exports = router;

