// routes/admin/products.js
const express = require('express');
const router = express.Router();
const productService = require('../../services/product.service');
const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * @route   GET /api/admin/products/:id
 * @desc    Get product details (for viewing variant's product info)
 * @access  Private (Admin)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await productService.getProductById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/products/:productId/variants
 * @desc    Get all variants of a product (for viewing product's variants)
 * @access  Private (Admin)
 */
router.get('/:productId/variants', async (req, res, next) => {
  try {
    const result = await productService.getProductVariants(req.params.productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
