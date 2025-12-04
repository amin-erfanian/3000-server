const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const CustomError = require('../classes/custom-error');

// GET all products
router.get('/', async (req, res) => {
  const {
    page = 1,
    limit = 20,
    isActive,
    status,
    category,
    brand,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (brand) {
    filter.brand = brand;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'titleFa titleEn slug')
      .populate('brand', 'titleFa titleEn slug logo')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET product by ID
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'titleFa titleEn slug')
    .populate('brand', 'titleFa titleEn slug logo');

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  res.json(product);
});

// GET product by slug
router.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'titleFa titleEn slug')
    .populate('brand', 'titleFa titleEn slug logo');

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  res.json(product);
});

// GET product variants
router.get('/:id/variants', async (req, res) => {
  const Variant = require('../models/variant');

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  const variants = await Variant.find({ product: req.params.id, isActive: true })
    .populate('seller', 'title slug rating')
    .populate('color', 'title titleEn hexCode')
    .populate('warranty', 'titleFa titleEn duration');

  res.json(variants);
});

// GET product reviews
router.get('/:id/reviews', async (req, res) => {
  const Review = require('../models/review');
  const { page = 1, limit = 10, status = 'approved' } = req.query;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  const filter = { product: req.params.id };
  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'profile.firstName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments(filter),
  ]);

  res.json({
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

module.exports = router;

