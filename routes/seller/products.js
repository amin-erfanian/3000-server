// routes/seller/products.js
const express = require('express');
const router = express.Router();
const productService = require('../../services/product.service');
const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');
const Variant = require('../../models/Variant');
const Product = require('../../models/Product');
const SellerProduct = require('../../models/Seller-Product');
const normalizePersian = require('../../utilities/normalize-persian');
const sellerProductService = require('../../services/sellerProduct.service');
const mongoose = require('mongoose');

router.use(authMiddleware);
router.use(roleMiddleware(['seller']));

/**
 * @route   GET /api/seller/products
 * @desc    Get all products of a seller with variants
 * @access  Private (Seller)
 */
router.get('/', async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const filters = {};

    // filters
    if (req.query.status) {
      filters.status = req.query.status;
    }

    // search
    if (req.query.keyword) {
      filters.$or = [
        { titleFa: { $regex: req.query.keyword, $options: 'i' } },
        { titleEn: { $regex: req.query.keyword, $options: 'i' } },
      ];
    }

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
    };

    const sort = {
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await productService.getSellerProducts(sellerId, filters, pagination, sort);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/seller/products/catalog
router.get('/catalog', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort_column = 'createdAt',
      sort_order = 'desc',
      categories,
      brands,
      keyword,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sellerId = new mongoose.Types.ObjectId(req.seller._id);

    const basePipeline = [
      {
        $match: {
          status: 'approved',
          ...(keyword && {
            $or: [
              { titleFa: { $regex: normalizePersian(keyword), $options: 'i' } },
              { titleEn: { $regex: keyword, $options: 'i' } },
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
          ...(categories && { 'category.slug': { $in: categories.split(',') } }),
          ...(brands && { 'brand.slug': { $in: brands.split(',') } }),
        },
      },
    ];

    const [items, countResult] = await Promise.all([
      Product.aggregate([
        ...basePipeline,
        {
          $lookup: {
            from: 'variants',
            let: { productId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$product', '$$productId'] } } },
              {
                $facet: {
                  count: [{ $count: 'total' }],
                  minPrice: [{ $group: { _id: null, minPrice: { $min: '$price' } } }],
                  sellers: [{ $group: { _id: '$seller' } }, { $count: 'total' }],
                },
              },
            ],
            as: 'variantData',
          },
        },
        { $unwind: { path: '$variantData', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'sellerproducts',
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$product', '$$productId'] }, { $eq: ['$seller', sellerId] }],
                  },
                },
              },
            ],
            as: 'sellerProduct',
          },
        },
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
            variant_count: {
              $ifNull: [{ $arrayElemAt: ['$variantData.count.total', 0] }, 0],
            },
            seller_count: {
              $ifNull: [{ $arrayElemAt: ['$variantData.sellers.total', 0] }, 0],
            },
            min_price: {
              $ifNull: [{ $arrayElemAt: ['$variantData.minPrice.minPrice', 0] }, null],
            },
            is_owned: { $gt: [{ $size: '$sellerProduct' }, 0] },
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
          variant_count: p.variant_count,
          seller_count: p.seller_count,
          min_price: p.min_price,
          is_owned: p.is_owned,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * @route   POST /api/seller/products/create
 * @desc    Create a brand new product (not from catalog)
 * @access  Private (Seller)
 */
router.post('/create', async (req, res, next) => {
  try {
    const sellerId = req.seller._id;

    // Extract product data from request
    const {
      titleFa,
      titleEn,
      description,
      category,
      brand,
      sku,
      dimensions,
      weight,
      referencePrice = 0,
      commission = 0,
      images,
      videos,
      minBasketQuantity,
      marketStatus,
    } = req.body;

    // Validate required fields separately
    if (!titleFa) {
      return res.status(400).json({
        success: false,
        message: 'عنوان فارسی الزامی است',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'دسته‌بندی الزامی است',
      });
    }

    if (referencePrice === undefined || referencePrice === null) {
      return res.status(400).json({
        success: false,
        message: 'قیمت مرجع الزامی است',
      });
    }

    if (commission === undefined || commission === null) {
      return res.status(400).json({
        success: false,
        message: 'درصد کمیسیون الزامی است',
      });
    }

    // Generate slug from titleFa
    const slug =
      titleFa
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '') +
      '-' +
      Date.now();

    // Prepare product data
    const productData = {
      titleFa,
      titleEn: titleEn || '',
      slug,
      description: description || '',
      category,
      brand: brand || undefined,
      sku: sku || '',
      dimensions: dimensions || { length: 0, width: 0, height: 0 },
      weight: weight || 0,
      referencePrice,
      commission,
      images: images || { main: null, gallery: [] },
      videos: videos || [],
      minBasketQuantity: minBasketQuantity || 1,
      marketStatus: marketStatus || 'marketable',
      createdBy: sellerId,
      status: 'pending',
    };

    // Create product using service
    const result = await productService.createProduct(productData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    let sellerProduct = await SellerProduct.findOne({
      seller: sellerId,
      product: result.data._id,
    }).lean();

    if (!sellerProduct) {
      sellerProduct = await SellerProduct.create({
        seller: sellerId,
        product: result.data._id,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        product: result.data,
        sellerProductId: sellerProduct._id,
      },
      message: 'محصول با موفقیت ایجاد شد و در انتظار تایید است',
    });
  } catch (error) {
    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'محصولی با این عنوان قبلاً ثبت شده است',
      });
    }
    next(error);
  }
});

/**
 * @route   PUT /api/seller/products/:productId
 * @desc    Update an existing product
 * @access  Private (Seller)
 */
router.put('/:productId', async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const { productId } = req.params;

    // Verify seller owns this product
    const sellerProduct = await SellerProduct.findOne({
      seller: sellerId,
      product: productId,
    }).lean();

    if (!sellerProduct) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد یا دسترسی به آن ندارید',
      });
    }

    // Extract product data from request
    const {
      titleFa,
      titleEn,
      description,
      category,
      brand,
      sku,
      dimensions,
      weight,
      referencePrice,
      commission,
      images,
      videos,
      minBasketQuantity,
      marketStatus,
    } = req.body;

    // Validate required fields if provided
    if (titleFa !== undefined && !titleFa) {
      return res.status(400).json({
        success: false,
        message: 'عنوان فارسی نمی‌تواند خالی باشد',
      });
    }

    if (category !== undefined && !category) {
      return res.status(400).json({
        success: false,
        message: 'دسته‌بندی نمی‌تواند خالی باشد',
      });
    }

    if (referencePrice !== undefined && (referencePrice === null || referencePrice === '')) {
      return res.status(400).json({
        success: false,
        message: 'قیمت مرجع نمی‌تواند خالی باشد',
      });
    }

    if (commission !== undefined && (commission === null || commission === '')) {
      return res.status(400).json({
        success: false,
        message: 'درصد کمیسیون نمی‌تواند خالی باشد',
      });
    }

    // Prepare update data
    const updateData = {
      status: 'pending',
    };

    if (titleFa !== undefined) {
      updateData.titleFa = titleFa;
      // Regenerate slug if title changed
      updateData.slug =
        titleFa
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '') +
        '-' +
        Date.now();
    }

    if (titleEn !== undefined) updateData.titleEn = titleEn;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand || undefined;
    if (sku !== undefined) updateData.sku = sku;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (weight !== undefined) updateData.weight = weight;
    if (referencePrice !== undefined) updateData.referencePrice = referencePrice;
    if (commission !== undefined) updateData.commission = commission;
    if (images !== undefined) updateData.images = images;
    if (videos !== undefined) updateData.videos = videos;
    if (minBasketQuantity !== undefined) updateData.minBasketQuantity = minBasketQuantity;
    if (marketStatus !== undefined) updateData.marketStatus = marketStatus;

    // Update product using service
    const result = await productService.updateProduct(productId, updateData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      data: {
        product: result.data,
        sellerProductId: sellerProduct._id,
      },
      message: 'محصول با موفقیت به‌روزرسانی شد',
    });
  } catch (error) {
    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'محصولی با این عنوان قبلاً ثبت شده است',
      });
    }
    next(error);
  }
});

router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await sellerProductService.addProductToSeller(req.seller._id, productId);

    res.status(201).json({
      message: 'Product added successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/seller/products/my-catalog
router.get('/my-catalog', async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const {
      page = 1,
      limit = 10,
      sort_column = 'createdAt',
      sort_order = 'desc',
      categories,
      brands,
      keyword,
      status, // وضعیت Product: draft, pending, approved, rejected
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const basePipeline = [
      {
        $match: {
          seller: new mongoose.Types.ObjectId(sellerId),
        },
      },
      // Join با Product
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      // فیلتر جستجو
      {
        $match: {
          ...(status && { 'product.status': status }),
          ...(keyword && {
            $or: [
              { 'product.titleFa': { $regex: normalizePersian(keyword), $options: 'i' } },
              { 'product.titleEn': { $regex: keyword, $options: 'i' } },
            ],
          }),
        },
      },
      // Join با Brand
      {
        $lookup: {
          from: 'brands',
          localField: 'product.brand',
          foreignField: '_id',
          as: 'brand',
        },
      },
      { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
      // Join با Category
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      // فیلتر دسته‌بندی و برند
      {
        $match: {
          ...(categories && { 'category.slug': { $in: categories.split(',') } }),
          ...(brands && { 'brand.slug': { $in: brands.split(',') } }),
        },
      },
    ];

    const [items, countResult] = await Promise.all([
      SellerProduct.aggregate([
        ...basePipeline,
        // شمارش واریانت‌های این فروشنده برای این محصول
        {
          $lookup: {
            from: 'variants',
            let: { sellerProductId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$sellerProduct', '$$sellerProductId'] } } },
              { $count: 'total' },
            ],
            as: 'variantCount',
          },
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            updatedAt: 1,
            'product._id': 1,
            'product.titleFa': 1,
            'product.titleEn': 1,
            'product.images.main.url': 1,
            'product.status': 1, // وضعیت محصول در کاتالوگ
            'product.rejectionReason': 1,
            'product.marketStatus': 1,
            'product.minBasketQuantity': 1,
            brand: { titleFa: '$brand.titleFa', slug: '$brand.slug' },
            category: { titleFa: '$category.titleFa', slug: '$category.slug' },
            variant_count: { $ifNull: [{ $arrayElemAt: ['$variantCount.total', 0] }, 0] },
          },
        },
        { $sort: { [sort_column]: sort_order === 'asc' ? 1 : -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ]),
      SellerProduct.aggregate([...basePipeline, { $count: 'total' }]),
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
        items: items.map((sp) => ({
          seller_product_id: sp._id,
          product_id: sp.product._id,
          title: sp.product.titleFa || sp.product.titleEn || '',
          image_src: sp.product.images?.main?.url || null,
          brand: sp.brand?.titleFa || '',
          category: sp.category?.titleFa || '',
          product_status: sp.product.status, // وضعیت محصول در کاتالوگ
          market_status: sp.product.marketStatus,
          min_basket_quantity: sp.product.minBasketQuantity || 1,
          variant_count: sp.variant_count, // تعداد واریانت‌های این فروشنده
          created_at: sp.createdAt,
          ...(sp.product.status === 'rejected' && {
            rejectionReason: sp.product.rejectionReason || {
              propertyKeys: [],
              message: '',
              rejectedAt: null,
              rejectedBy: null,
            },
          }),
          updated_at: sp.updatedAt,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * @route   GET /api/seller/products/:id
 * @desc    Get details of a product (if has variant)
 * @access  Private (Seller)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const productId = req.params.id;

    const result = await productService.getProductById(productId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد',
      });
    }

    const hasVariant = await Variant.exists({
      product: productId,
      seller: sellerId,
    });

    res.json({
      success: true,
      data: {
        ...result.data,
        hasVariant: !!hasVariant,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/seller/products/:id/variants
 * @desc    Get variants of a product for a seller
 * @access  Private (Seller)
 */
router.get('/:id/variants', async (req, res, next) => {
  try {
    const sellerId = req.seller._id;
    const filters = {
      seller: sellerId,
    };

    const result = await productService.getProductVariants(req.params.id, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
