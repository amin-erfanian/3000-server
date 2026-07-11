// routes/admin/products.js
const express = require('express');
const router = express.Router();
const productService = require('../../services/product.service');
const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');
const Product = require('../../models/product');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort_column = 'createdAt', sort_order = 'desc' } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const filters = { status: 'pending' };
    const sort = { [sort_column]: sort_order === 'asc' ? 1 : -1 };

    const [items, total_rows] = await Promise.all([
      Product.find(filters)
        .populate('brand')
        .populate('category')
        .populate('createdBy')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filters),
    ]);

    const normalizedItems = items.map((item) => ({
      ...item,
      seller: item.createdBy || null,
    }));

    res.json({
      status: 'ok',
      data: {
        sort_data: { sort_column, sort_order },
        pager: {
          page: pageNum,
          item_per_page: limitNum,
          total_pages: Math.ceil(total_rows / limitNum),
          total_rows,
        },
        items: normalizedItems,
      },
    });
  } catch (error) {
    next(error);
  }
});

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

/**
 * @route   POST /api/admin/products/:productId/approve
 * @desc    Approve a product
 * @access  Private (Admin)
 */
router.post('/:productId/approve', async (req, res) => {
  try {
    const adminId = req.user?._id || req.admin?._id;
    const { note } = req.body;

    if (!adminId) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin authentication required',
      });
    }

    const result = await productService.approveProduct(req.params.productId, adminId, note);

    res.json({
      status: 'ok',
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    const message = error?.message || 'Failed to approve product';
    const statusCode = /نامعتبر|invalid|required/i.test(message)
      ? 400
      : /یافت نشد|not found/i.test(message)
        ? 404
        : 500;

    res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
});

/**
 * @route   POST /api/admin/products/:productId/reject
 * @desc    Reject a product
 * @access  Private (Admin)
 * @body    { reason: string, propertyKeys?: string[] }
 */
router.post('/:productId/reject', async (req, res) => {
  try {
    const adminId = req.user?._id || req.admin?._id;
    const { reason, propertyKeys } = req.body;

    if (!adminId) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin authentication required',
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required',
      });
    }

    if (propertyKeys !== undefined && !Array.isArray(propertyKeys)) {
      return res.status(400).json({
        status: 'error',
        message: 'propertyKeys must be an array',
      });
    }

    const result = await productService.rejectProduct(
      req.params.productId,
      adminId,
      reason,
      propertyKeys || [],
    );

    res.json({
      status: 'ok',
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    const message = error?.message || 'Failed to reject product';
    const statusCode = /نامعتبر|invalid|required/i.test(message)
      ? 400
      : /یافت نشد|not found/i.test(message)
        ? 404
        : 500;

    res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
});
module.exports = router;
