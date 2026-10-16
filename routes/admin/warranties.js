const express = require('express');
const router = express.Router();
const Warranty = require('../../models/warranty');
const CustomError = require('../../classes/custom-error');

const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * @route   GET /api/admin/warranties
 * @desc    List warranties, optionally filtered by status
 * @access  Private (Admin)
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;
  const filters = status ? { status } : {};

  const [items, total_rows] = await Promise.all([
    Warranty.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Warranty.countDocuments(filters),
  ]);

  res.json({
    status: 'ok',
    data: {
      pager: {
        page: pageNum,
        item_per_page: limitNum,
        total_pages: Math.ceil(total_rows / limitNum),
        total_rows,
      },
      items,
    },
  });
});

const updatePendingStatus = async (warrantyId, status) => {
  const warranty = await Warranty.findById(warrantyId);

  if (!warranty) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'گارانتی یافت نشد.',
      en: 'Warranty not found.',
    });
  }

  if (warranty.status !== 'pending') {
    throw new CustomError(400, 'BAD_REQUEST', {
      fa: 'فقط گارانتی‌های در انتظار تایید قابل تغییر وضعیت هستند.',
      en: 'Only pending warranties can be reviewed.',
    });
  }

  warranty.status = status;
  await warranty.save();

  return warranty;
};

/**
 * @route   POST /api/admin/warranties/:id/approve
 * @desc    Approve a pending warranty
 * @access  Private (Admin)
 */
router.post('/:id/approve', async (req, res) => {
  const warranty = await updatePendingStatus(req.params.id, 'approved');
  res.json({ status: 'ok', data: warranty });
});

/**
 * @route   POST /api/admin/warranties/:id/reject
 * @desc    Reject a pending warranty
 * @access  Private (Admin)
 */
router.post('/:id/reject', async (req, res) => {
  const warranty = await updatePendingStatus(req.params.id, 'rejected');
  res.json({ status: 'ok', data: warranty });
});

module.exports = router;
