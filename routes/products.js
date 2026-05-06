const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const slugify = require('slugify');

const Product = require('../models/Product');
const Variant = require('../models/Variant');
const CustomError = require('../classes/custom-error');

const normalizePersian = require('../utilities/normalize-persian');
const authMiddleware = require('../middlewares/authorization');

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

router.post('/create', async (req, res) => {
  try {
    const { titleFa, titleEn, description, category, brand, fake, productId, dimensions, weight, images } =
      req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!titleFa) {
      return res.status(400).json({
        success: false,
        message: 'titleFa is required',
      });
    }

    if (!category?._id || !mongoose.Types.ObjectId.isValid(category._id)) {
      return res.status(400).json({
        success: false,
        message: 'A valid category is required',
      });
    }

    if (brand?._id && !mongoose.Types.ObjectId.isValid(brand._id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid brand id',
      });
    }

    // ── Slug Generation ─────────────────────────────────────────
    // Try titleEn first, fallback to titleFa
    const slugBase = titleEn?.trim() || titleFa?.trim();
    let slug = slugify(slugBase, { lower: true, strict: true });

    // Append productId if provided for extra uniqueness
    if (productId) {
      slug = `${slug}-${productId}`;
    }

    // Ensure slug is unique
    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    // ── Build images object ─────────────────────────────────────
    // gallery items are expected as: [{ url, thumbnailUrl?, alt? }]
    const galleryImages =
      images?.gallery?.map((img) => ({
        url: img.url,
        thumbnailUrl: img.thumbnailUrl || '',
        alt: img.alt || '',
      })) ?? [];

    // ── Build product document ──────────────────────────────────
    const newProduct = new Product({
      titleFa,
      titleEn: titleEn || '',
      slug,
      description: description || '',
      dimensions: {
        length: Number(dimensions?.length) || 0,
        width: Number(dimensions?.width) || 0,
        height: Number(dimensions?.height) || 0,
      },
      weight: Number(weight) || 0,

      // Extract only the ObjectId from the nested objects
      category: category._id,
      brand: brand?._id || undefined,

      images: {
        // main image is not in the payload — leave undefined or set if present
        ...(images?.main && { main: images.main }),
        gallery: galleryImages,
      },

      properties: {
        isFake: fake ?? false,
      },
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    });
  } catch (error) {
    // Duplicate slug edge case
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A product with this slug already exists',
        field: Object.keys(error.keyPattern)[0],
      });
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('Add product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.get('/list', async (req, res) => {
  try {
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

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // -------- Product-level filters (including brand/category slug, fake, keyword) --------
    const productMatch = {};

    // filter by category slug (assuming product.category is an ObjectId -> Category)
    // and Category has `slug` field
    if (categories) {
      const categorySlugs = categories.split(',');
      productMatch['category.slug'] = { $in: categorySlugs };
    }

    // filter by brand slug (assuming product.brand is an ObjectId -> Brand)
    // and Brand has `slug` field
    if (brands) {
      const brandSlugs = brands.split(',');
      productMatch['brand.slug'] = { $in: brandSlugs };
    }

    if (fake !== undefined) {
      productMatch['properties.isFake'] = fake === 'true';
    }

    // keyword in titleFa OR titleEn
    if (keyword) {
      const kw = normalizePersian(keyword);

      productMatch.$or = [
        { titleFa: { $regex: kw, $options: 'i' } },
        { titleEn: { $regex: kw, $options: 'i' } },
      ];
    }

    // -------- Variant-level filters --------
    const variantMatch = {};
    if (statuses) variantMatch.status = { $in: statuses.split(',') };
    if (colors) variantMatch.color = { $in: colors.split(',') };

    // -------- Aggregation rooted on Product --------
    const pipeline = [
      // 1) Start from products
      {
        $match: {
          // product-level filters that do NOT depend on brand/category slug
          ...(fake !== undefined && { 'properties.isFake': fake === 'true' }),
          ...(keyword && {
            $or: [
              { titleFa: { $regex: normalizePersian(keyword), $options: 'i' } },
              { titleEn: { $regex: normalizePersian(keyword), $options: 'i' } },
            ],
          }),
        },
      },

      // 2) Lookup brand & category for slug filtering + titles
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

      // 3) Apply brand/category slug filters here (productMatch by slugs)
      {
        $match: {
          ...(categories && {
            'category.slug': { $in: categories.split(',') },
          }),
          ...(brands && {
            'brand.slug': { $in: brands.split(',') },
          }),
        },
      },

      // 4) Lookup variants (left join). We will filter them in a sub‑pipeline
      {
        $lookup: {
          from: 'variants',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$product', '$$productId'] },
                ...variantMatch,
              },
            },
          ],
          as: 'variants',
        },
      },

      // 5) Project and normalize. If there are no variants, we return zeros/defaults.
      {
        $project: {
          _id: 1,
          titleFa: 1,
          titleEn: 1,
          'images.main.url': 1,
          brand: { titleFa: '$brand.titleFa' },
          category: { titleFa: '$category.titleFa' },
          variants: 1,
        },
      },

      // 6) Pagination
      { $skip: skip },
      { $limit: limitNum },
    ];

    const items = await Product.aggregate(pipeline);

    // total_rows for pager (count products with same filters)
    const countPipeline = [
      {
        $match: {
          ...(fake !== undefined && { 'properties.isFake': fake === 'true' }),
          ...(keyword && {
            $or: [
              { titleFa: { $regex: normalizePersian(keyword), $options: 'i' } },
              { titleEn: { $regex: normalizePersian(keyword), $options: 'i' } },
            ],
          }),
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
      {
        $match: {
          ...(categories && {
            'category.slug': { $in: categories.split(',') },
          }),
          ...(brands && {
            'brand.slug': { $in: brands.split(',') },
          }),
        },
      },
      { $count: 'total' },
    ];

    const countResult = await Product.aggregate(countPipeline);
    const total_rows = countResult[0]?.total || 0;

    // -------- Format output: if no variants, return 0 for variant fields --------
    const formatted = items.map((p) => {
      const hasVariant = Array.isArray(p.variants) && p.variants.length > 0;
      const v = hasVariant ? p.variants[0] : {}; // pick first variant or empty

      return {
        id: p._id,
        title: p.titleFa || p.titleEn || '',
        status: v.status || 0,
        min_price: v.price ?? 0,
        color: v.color || '',
        commission: {
          canSell: false,
          commission: 0.02,
          type: 'document',
          message: [
            'برای درج کالا در این گروه کالایی نیاز به ارایه مدرک است، برای اطلاعات بیشتر به بخش مدارک فروشنده مراجعه کنید.',
          ],
        },
        market_price: 0,
        image_src: p.images?.main?.url || null,
        price_type: { recommended: 'پیشنهادی' },
        number_of_sellers: hasVariant ? 1 : 0,
        is_selling: false,
        brand: p.brand?.titleFa || '',
        category: p.category?.titleFa || '',
        category_price_configs: {
          order_limit_minimum: hasVariant ? 1 : 0,
          order_limit_maximum: hasVariant ? 1000 : 0,
        },
        tags: [],
        demand_count: 0,
        site: 'digikala',
      };
    });

    res.json({
      status: 'ok',
      data: {
        sort_data: {
          sort_column,
          sort_order,
          sort_columns: [sort_column],
        },
        pager: {
          page: pageNum,
          item_per_page: limitNum,
          total_pages: Math.ceil(total_rows / limitNum),
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
                description: 'search by product name (fa/en)',
              },
            ],
            [
              {
                name: 'categories',
                type: 'option',
                label: 'گروه اصلی',
                dynamic: true,
                db_name: 'category',
                description: 'search by category slug',
              },
            ],
            [
              {
                name: 'brands',
                type: 'option',
                label: 'برند کالا',
                dynamic: true,
                db_name: 'brand',
                description: 'search by brand slug',
              },
            ],
          ],
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/seller', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort_column = 'createdAt',
      sort_order = 'desc',
      status, // draft | pending | active | inactive
      keyword,
    } = req.query;

    const sellerId = req.seller._id;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // 1) Find all product IDs this seller has variants for
    const variantFilter = { seller: sellerId };
    const sellerVariants = await Variant.find(variantFilter).select('product status price stock').lean();

    const productIds = [...new Set(sellerVariants.map((v) => v.product.toString()))];

    // 2) Build product-level filter
    const productFilter = { _id: { $in: productIds } };
    if (status) productFilter.status = status;
    if (keyword) {
      const kw = normalizePersian(keyword);
      productFilter.$or = [
        { titleFa: { $regex: kw, $options: 'i' } },
        { titleEn: { $regex: kw, $options: 'i' } },
      ];
    }

    const sortDir = sort_order === 'asc' ? 1 : -1;
    const sortObj = { [sort_column]: sortDir };

    const [products, total_rows] = await Promise.all([
      Product.find(productFilter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'titleFa slug')
        .populate('brand', 'titleFa slug')
        .lean(),
      Product.countDocuments(productFilter),
    ]);

    // 3) Map variants by productId for quick lookup
    const variantsByProduct = sellerVariants.reduce((acc, v) => {
      const pid = v.product.toString();
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push(v);
      return acc;
    }, {});

    const items = products.map((p) => {
      const pid = p._id.toString();
      const variants = variantsByProduct[pid] || [];
      const hasVariants = variants.length > 0;

      return {
        product_id: p._id,
        title: p.titleFa || p.titleEn || '',
        title_en: p.titleEn || '',
        slug: p.slug,
        status: p.status, // draft | pending | active | inactive
        moderation_status: p.status,
        is_owner: true,
        fake: p.properties?.isFake ?? false,
        variants_count: variants.length,
        has_variants: hasVariants,
        main_category_title: p.category?.titleFa || '',
        brand_title: p.brand?.titleFa || '',
        image_src: p.images?.main?.url || null,
        product_dimension: {
          length: p.dimensions?.length ?? 0,
          width: p.dimensions?.width ?? 0,
          height: p.dimensions?.height ?? 0,
          weight: p.weight ?? 0,
        },
        tags: [],
        site: 'digikala',
      };
    });

    res.json({
      status: 'ok',
      data: {
        sort_data: {
          sort_column,
          sort_order,
          sort_columns: ['createdAt', 'titleFa', 'status'],
        },
        pager: {
          page: pageNum,
          item_per_page: limitNum,
          total_pages: Math.ceil(total_rows / limitNum),
          total_rows,
        },
        form_data: {},
        items,
        meta_data: {
          filters: [
            { name: 'keyword', type: 'string', description: 'search by product name' },
            {
              name: 'status',
              type: 'option',
              label: 'وضعیت',
              options: ['draft', 'pending', 'active', 'inactive'],
            },
            {
              name: 'multi_search',
              type: 'string',
              description: 'search by product id or title',
            },
          ],
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
  const Variant = require('../models/Variant');

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
