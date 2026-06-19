// routes/buyer/products.js
const express = require('express');
const router = express.Router();
const productService = require('../../services/product.service');

/**
 * @route   GET /api/buyer/products
 * @desc    Get active product list
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      status: 'approved',
    };

    // filters
    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.brand) {
      filters.brand = req.query.brand;
    }

    if (req.query.keyword) {
      filters.$or = [
        { titleFa: { $regex: req.query.keyword, $options: 'i' } },
        { titleEn: { $regex: req.query.keyword, $options: 'i' } },
      ];
    }

    // price filter
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = parseFloat(req.query.maxPrice);
    }

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const sort = {
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await productService.getProducts(filters, pagination, sort);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/products/list
 * @desc    Get product list (legacy-compatible)
 * @access  Public
 */
router.get('/list', async (req, res, next) => {
  try {
    const result = await productService.getProductList(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const result = await productService.getProductBySlug(req.params.slug);

    if (result.data.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد',
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/products/category/:slug
 * @desc    Get products by category slug
 * @access  Public
 */
router.get('/category/:slug', async (req, res, next) => {
  try {
    const result = await productService.getProductsByCategorySlug(req.params.slug, {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/products/:id
 * @desc    Get product details
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await productService.getProductById(req.params.id);

    if (result.data.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد',
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/products/:id/reviews
 * @desc    Get product reviews
 * @access  Public
 */
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const result = await productService.getProductReviews(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/buyer/products/:id/variants
 * @desc    Get active variants of a product
 * @access  Public
 */
router.get('/:id/variants', async (req, res, next) => {
  try {
    const filters = {
      status: 'active',
    };

    const result = await productService.getProductVariants(req.params.id, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
