// routes/buyer/variants.js
const express = require('express');
const router = express.Router();
const variantService = require('../../services/variant.service');

/**
 * @route   GET /api/buyer/variants
 * @desc    Get all active variants with filters
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, product, seller, color, minPrice, maxPrice, inStock } = req.query;

    const filters = {
      status: 'approved',
    };

    if (product) {
      filters.product = product;
    }

    if (seller) {
      filters.seller = seller;
    }

    if (color) {
      filters.color = color;
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    if (inStock !== undefined) {
      if (inStock === 'true') {
        filters.stock = { $gt: 0 };
      } else {
        filters.stock = 0;
      }
    }

    const result = await variantService.getVariants(filters, { page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/variants/sku/:sku
 * @desc    Get variant by SKU
 * @access  Public
 */
router.get('/sku/:sku', async (req, res, next) => {
  try {
    const result = await variantService.getVariantBySku(req.params.sku);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/variants/:id
 * @desc    Get variant by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await variantService.getVariantById(req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
