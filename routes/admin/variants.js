// routes/admin/variant.js
const express = require('express');
const router = express.Router();
const variantService = require('../../services/variant.service');
const adminAuth = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

// Apply admin authentication to all routes
router.use(adminAuth);
router.use(roleMiddleware(['admin']));

/**
 * GET /api/admin/variants/pending
 * Get list of variants pending approval
 * Query params: page, limit
 */
router.get('/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await variantService.getPendingVariants(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /api/admin/variants/:variantId
 * Get variant details
 * Params: variantId
 */
router.get('/:variantId', async (req, res) => {
  try {
    const variant = await variantService.getVariantById(req.params.variantId);

    if (!variant) {
      return res.status(404).json({
        status: 'error',
        message: 'Variant not found',
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
 * POST /api/admin/variants/:variantId/approve
 * Approve a variant
 * Params: variantId
 * Body: (optional) { note: string }
 */
router.post('/:variantId/approve', async (req, res) => {
  try {
    const adminId = req.admin._id;
    const { note } = req.body;
    const variant = await variantService.approveVariant(req.params.variantId, adminId, note);
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
 * POST /api/admin/variants/:variantId/reject
 * Reject a variant
 * Params: variantId
 * Body: { reason: string, issues?: { field: string, message: string }[] }
 */
router.post('/:variantId/reject', async (req, res) => {
  try {
    const { reason, issues } = req.body;
    const adminId = req.admin._id;

    // Validate rejection reason
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required',
      });
    }

    const variant = await variantService.rejectVariant(req.params.variantId, adminId, reason, issues);

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
