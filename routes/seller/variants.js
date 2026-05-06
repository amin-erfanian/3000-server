// routes/seller/variant.js
const express = require('express');
const router = express.Router();
const variantService = require('../../services/variant.service');
const sellerAuth = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

// Apply seller authentication to all routes
router.use(sellerAuth);
router.use(roleMiddleware(['seller']));

/**
 * GET /api/seller/variants
 * Get list of seller's own variants
 * Query params: status (pending|approved|rejected), page, limit
 */
router.get('/', async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { status, page = 1, limit = 20 } = req.query;

    const result = await variantService.getSellerVariants(sellerId, {
      status,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /api/seller/variants/sku/:sku
 * Get seller variant by SKU
 * Params: sku
 */
router.get('/sku/:sku', async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const result = await variantService.getVariantBySku(req.params.sku);

    if (!result?.data || result.data.seller?._id?.toString() !== sellerId.toString()) {
      return res.status(404).json({
        status: 'error',
        message: 'Variant not found or access denied',
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /api/seller/variants/:variantId
 * Get details of seller's own variant
 * Params: variantId
 */
router.get('/:variantId', async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const variant = await variantService.getSellerVariant(req.params.variantId, sellerId);

    if (!variant) {
      return res.status(404).json({
        status: 'error',
        message: 'Variant not found or access denied',
      });
    }

    res.json({
      status: 'ok',
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * POST /api/seller/variants
 * Create a new variant
 * Body: variant data (productId, sku, price, stock, attributes, etc.)
 */
router.post('/create', async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const variantData = { ...req.body, sellerId };

    const result = await variantService.createVariant(variantData);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * PUT /api/seller/variants/:variantId
 * Update seller's own variant
 * Params: variantId
 * Body: updated variant data
 */
router.put('/:variantId', async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const variant = await variantService.updateSellerVariant(req.params.variantId, sellerId, req.body);

    if (!variant) {
      return res.status(404).json({
        status: 'error',
        message: 'Variant not found or access denied',
      });
    }

    res.json({
      status: 'ok',
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
