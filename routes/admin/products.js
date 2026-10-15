const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const productService = require('../../services/product.service');
const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');
const Product = require('../../models/product');
const Seller = require('../../models/seller');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort_column = 'createdAt',
      sort_order = 'desc',
      code,
      title,
      phone,
      status,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const filters = {};

    if (status) {
      const statuses = String(status).split(',');
      const allowedStatuses = Product.schema.path('status').enumValues;

      if (!statuses.every((item) => allowedStatuses.includes(item))) {
        return res.status(400).json({
          status: 'error',
          message: 'وضعیت نامعتبر است',
        });
      }

      filters.status = { $in: statuses };
    }

    if (code || title || phone) {
      const sellerQuery = {};
      if (code) sellerQuery.code = code;
      if (title) sellerQuery.title = { $regex: title, $options: 'i' };
      if (phone) sellerQuery.phone = phone;

      const sellerIds = await Seller.find(sellerQuery).distinct('_id');
      if (!sellerIds.length)
        return res.json({
          status: 'ok',
          data: {
            items: [],
            pager: { page: pageNum, item_per_page: limitNum, total_pages: 0, total_rows: 0 },
          },
        });

      filters.createdBy = { $in: sellerIds };
    }

    const sort = { [sort_column]: sort_order === 'asc' ? 1 : -1 };
    const skip = (pageNum - 1) * limitNum;

    const [items, total_rows] = await Promise.all([
      Product.find(filters)
        .populate('brand')
        .populate('category')
        .populate('createdBy', 'title phone nationalId code')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filters),
    ]);

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
        items,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/products/reference-price-requests
 * @desc    List products with unwatched reference price requests (only unwatched requests are returned)
 * @access  Private (Admin)
 */
router.get('/reference-price-requests', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;
    const filters = { referencePriceRequests: { $elemMatch: { isWatched: false } } };

    const [products, total_rows] = await Promise.all([
      Product.find(filters)
        .select('titleFa titleEn code images referencePrice referencePriceRequests')
        .populate('referencePriceRequests.seller', 'title phone code')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filters),
    ]);

    const items = products.map((product) => ({
      ...product,
      referencePriceRequests: product.referencePriceRequests.filter(
        (request) => !request.isWatched,
      ),
    }));

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
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/admin/products/:productId/reference-price-requests/watched
 * @desc    Mark reference price requests as watched without changing the price
 * @access  Private (Admin)
 * @body    { requestIds?: string[] } - when omitted, all requests are marked as watched
 */
router.patch('/:productId/reference-price-requests/watched', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { requestIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه محصول نامعتبر است',
      });
    }

    if (
      requestIds !== undefined &&
      (!Array.isArray(requestIds) ||
        !requestIds.length ||
        !requestIds.every((id) => mongoose.Types.ObjectId.isValid(id)))
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه درخواست‌ها نامعتبر است',
      });
    }

    const product = requestIds
      ? await Product.findByIdAndUpdate(
          productId,
          { $set: { 'referencePriceRequests.$[request].isWatched': true } },
          {
            new: true,
            arrayFilters: [
              {
                'request._id': {
                  $in: requestIds.map((id) => new mongoose.Types.ObjectId(id)),
                },
              },
            ],
          },
        ).lean()
      : await Product.findByIdAndUpdate(
          productId,
          { $set: { 'referencePriceRequests.$[].isWatched': true } },
          { new: true },
        ).lean();

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'محصول یافت نشد',
      });
    }

    res.json({
      status: 'ok',
      data: product,
      message: 'درخواست‌ها به عنوان دیده‌شده علامت‌گذاری شدند',
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
 * @route   PUT /api/admin/products/:productId/reference-price
 * @desc    Update a product's reference price and mark seller requests as watched
 * @access  Private (Admin)
 * @body    { referencePrice: number }
 */
router.put('/:productId/reference-price', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const referencePrice = Number(req.body.referencePrice);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'شناسه محصول نامعتبر است',
      });
    }

    if (!Number.isFinite(referencePrice) || referencePrice < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'قیمت مرجع نامعتبر است',
      });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          referencePrice,
          'referencePriceRequests.$[].isWatched': true,
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'محصول یافت نشد',
      });
    }

    res.json({
      status: 'ok',
      data: product,
      message: 'قیمت مرجع با موفقیت به‌روزرسانی شد',
    });
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
 * @body    { rejectionReasons: { property: string, message: string }[] }
 *          property is a dot path to the rejected field, e.g. titleFa or attributes.model
 */
router.post('/:productId/reject', async (req, res) => {
  try {
    const adminId = req.user?._id || req.admin?._id;
    const { rejectionReasons } = req.body;

    if (!adminId) {
      return res.status(401).json({
        status: 'error',
        message: 'Admin authentication required',
      });
    }

    const result = await productService.rejectProduct(
      req.params.productId,
      adminId,
      rejectionReasons,
    );

    res.json({
      status: 'ok',
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    const message = error?.message || 'Failed to reject product';
    const statusCode = /نامعتبر|الزامی|یک بار|invalid|required/i.test(message)
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
