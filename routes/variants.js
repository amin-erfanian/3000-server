const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Variant = require('../models/Variant');
const Product = require('../models/Product');
const CustomError = require('../classes/custom-error');
const authMiddleware = require('../middlewares/authorization');

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

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const {
      productId,
      price = 0,
      stock = 0,
      colorId,
      warrantyId,
      size = '',
      barcode = '',
      leadTime = 0,
      discountPercent = 0,
    } = req.body;

    if (!productId || price === null || price === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'productId and price are required',
      });
    }

    // 1) Verify product exists
    const product = await Product.findById(productId)
      .populate('category', 'titleFa')
      .populate('brand', 'titleFa')
      .lean();

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'product not found' });
    }

    // 2) Check if this seller already has a variant for this product
    const existing = await Variant.findOne({ product: productId, seller: sellerId });
    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: 'you already have a variant for this product',
        data: { variant_id: existing._id },
      });
    }

    // 3) Create the variant
    const variant = await Variant.create({
      product: productId,
      seller: sellerId,
      price,
      stock,
      color: colorId || undefined,
      warranty: warrantyId || undefined,
      size,
      barcode,
      leadTime,
      discountPercent,
      originalPrice: price, // required
      status: 'pending',
    });

    // 4) Check total variants on this product (so caller knows if product is now "live")
    const variantsCount = await Variant.countDocuments({ product: productId });

    res.status(201).json({
      status: 'ok',
      data: {
        variant_id: variant._id,
        product_id: productId,
        product_title: product.titleFa || product.titleEn,
        variants_count: variantsCount, // total variants across all sellers
        status: variant.status,
        price: variant.price,
        stock: variant.stock,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
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
