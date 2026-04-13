const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Variant = require('../models/variant');
const CustomError = require('../classes/custom-error');

// GET all products
router.get('/', async (req, res) => {
  const {
    page = 1,
    limit = 20,
    isActive,
    status,
    category,
    brand,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (brand) {
    filter.brand = brand;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'titleFa titleEn slug')
      .populate('brand', 'titleFa titleEn slug logo')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

router.get('/list', async (req, res) => {
  try {
    // Parse filters
    const {
      page = 1,
      limit = 10,
      sort_column = 'createdAt',
      sort_order = 'desc',

      categories,
      brands,
      statuses,
      colors,
      fake,
      keyword,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build product/variant filters
    const productMatch = {};
    const variantMatch = {};

    if (categories) productMatch['product.category'] = { $in: categories.split(',') };
    if (brands) productMatch['product.brand'] = { $in: brands.split(',') };
    if (fake !== undefined) productMatch['product.properties.isFake'] = fake === 'true';

    if (keyword) {
      productMatch['product.titleFa'] = {
        $regex: keyword,
        $options: 'i',
      };
    }
    if (statuses) variantMatch.status = { $in: statuses.split(',') };
    if (colors) variantMatch.color = { $in: colors.split(',') };

    // Aggregate Variants rooted pipeline (faster)
    const pipeline = [
      {
        $match: {
          ...variantMatch,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $match: productMatch,
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'product.brand',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          'product.titleFa': 1,
          'product.images.main.url': 1,
          status: 1,
          price: 1,
          color: 1,
          'brand.titleFa': 1,
          'category.titleFa': 1,
        },
      },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ];

    const items = await Variant.aggregate(pipeline);
    const total_rows = await Variant.countDocuments({
      ...variantMatch,
    });

    // Transform DB docs → required shape
    const formatted = items.map((v) => ({
      id: v._id,
      title: v.product?.titleFa,
      status: v.status,
      min_price: v.price || 0,
      commission: {
        canSell: false,
        commission: 0.02,
        type: 'document',
        message: [
          'برای درج کالا در این گروه کالایی نیاز به ارایه مدرک است، برای اطلاعات بیشتر به بخش مدارک فروشنده مراجعه کنید.',
        ],
      },
      market_price: 0,
      image_src: v.product?.images?.main?.url || null,
      price_type: { recommended: 'پیشنهادی' },
      number_of_sellers: 1,
      is_selling: false,
      brand: v.brand?.titleFa || '',
      category: v.category?.titleFa || '',
      category_price_configs: {
        order_limit_minimum: 1,
        order_limit_maximum: 1000,
      },
      tags: [],
      demand_count: 0,
      site: 'digikala',
    }));

    // Response payload
    res.json({
      status: 'ok',
      data: {
        sort_data: {
          sort_column,
          sort_order,
          sort_columns: [sort_column],
        },
        pager: {
          page: parseInt(page),
          item_per_page: parseInt(limit),
          total_pages: Math.ceil(total_rows / limit),
          total_rows,
        },
        form_data: {
          categories: categories || '',
        },
        items: formatted,
        meta_data: {
          filters: [
            [
              {
                name: 'keyword',
                type: 'string',
                required: 'true',
                description: 'search by product name',
              },
            ],
            [
              {
                name: 'categories',
                type: 'option',
                label: 'گروه اصلی',
                dynamic: true,
                db_name: 'category',
                description: 'search by product category ids',
                values: [{ 18: 'لپ تاپ و الترابوک' }],
              },
            ],
            [
              {
                name: 'brands',
                type: 'option',
                label: 'برند کالا',
                dynamic: true,
                db_name: 'brand',
                description: 'search by product brand ids',
              },
            ],
          ],
          filtered: {
            categories: {
              1: [
                {
                  name: 'categories',
                  type: 'option',
                  label: 'گروه اصلی',
                  dynamic: true,
                  db_name: 'category',
                  description: 'search by product category ids',
                },
              ],
              data: { 18: 'لپ تاپ و الترابوک' },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'titleFa titleEn slug')
    .populate('brand', 'titleFa titleEn slug logo');

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  res.json(product);
});

// GET product by slug
router.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'titleFa titleEn slug')
    .populate('brand', 'titleFa titleEn slug logo');

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  res.json(product);
});

// GET products by category slug (includes all subcategories)
router.get('/category/:slug', async (req, res) => {
  const Category = require('../models/category');
  const {
    page = 1,
    limit = 20,
    isActive,
    status,
    brand,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  // Get all descendant category IDs recursively
  const getAllDescendantIds = async (parentId) => {
    const children = await Category.find({ parent: parentId }, '_id');
    let ids = children.map((c) => c._id);

    for (const child of children) {
      const descendantIds = await getAllDescendantIds(child._id);
      ids = ids.concat(descendantIds);
    }

    return ids;
  };

  const descendantIds = await getAllDescendantIds(category._id);
  const allCategoryIds = [category._id, ...descendantIds];

  const filter = { category: { $in: allCategoryIds } };

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (status) {
    filter.status = status;
  }

  if (brand) {
    filter.brand = brand;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'titleFa titleEn slug')
      .populate('brand', 'titleFa titleEn slug logo')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(filter),
  ]);

  res.json({
    category,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET product variants
router.get('/:id/variants', async (req, res) => {
  const Variant = require('../models/variant');

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  const variants = await Variant.find({ product: req.params.id, isActive: true })
    .populate('seller', 'title slug rating')
    .populate('color', 'title titleEn hexCode')
    .populate('warranty', 'titleFa titleEn duration');

  res.json(variants);
});

// GET product reviews
router.get('/:id/reviews', async (req, res) => {
  const Review = require('../models/review');
  const { page = 1, limit = 10, status = 'approved' } = req.query;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'محصول یافت نشد.',
      en: 'Product not found.',
    });
  }

  const filter = { product: req.params.id };
  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'profile.firstName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments(filter),
  ]);

  res.json({
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

module.exports = router;

module.exports = router;
