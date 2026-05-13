// routes/admin/products.js
const express = require('express');
const router = express.Router();
const productService = require('../../services/product.service');
const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');
const Product = require('../../models/Product');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort_column = 'createdAt', sort_order = 'desc' } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const basePipeline = [
      {
        $match: {
          status: 'pending',
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    ];

    const [items, countResult] = await Promise.all([
      Product.aggregate([
        ...basePipeline,
        {
          $project: {
            _id: 1,
            titleFa: 1,
            titleEn: 1,
            'images.main.url': 1,
            status: 1,
            marketStatus: 1,
            minBasketQuantity: 1,
            brand: { titleFa: '$brand.titleFa', slug: '$brand.slug' },
            category: { titleFa: '$category.titleFa', slug: '$category.slug' },
          },
        },
        { $sort: { [sort_column]: sort_order === 'asc' ? 1 : -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ]),
      Product.aggregate([...basePipeline, { $count: 'total' }]),
    ]);

    const total_rows = countResult[0]?.total || 0;

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
        items: items.map((p) => ({
          id: p._id,
          title: p.titleFa || p.titleEn || '',
          image_src: p.images?.main?.url || null,
          brand: p.brand?.titleFa || '',
          category: p.category?.titleFa || '',
          status: p.status,
          market_status: p.marketStatus,
          min_basket_quantity: p.minBasketQuantity || 1,
        })),
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

module.exports = router;
