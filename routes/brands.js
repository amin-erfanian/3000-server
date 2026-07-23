const express = require('express');
const router = express.Router();
const Brand = require('../models/brand');
const CustomError = require('../classes/custom-error');
const authMiddleware = require('../middlewares/authorization');
const roleMiddleware = require('../middlewares/role');

// TODO: Separate admin and seller routes
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, isActive, status = 'approved', search, category } = req.query;

  const filter = { status };

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (category) {
    filter.categories = category;
  }

  if (search) {
    filter.$or = [
      { titleFa: { $regex: search, $options: 'i' } },
      { titleEn: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [brands, total] = await Promise.all([
    Brand.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Brand.countDocuments(filter),
  ]);

  res.json({
    data: brands,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// POST create a brand
router.post('/', authMiddleware, roleMiddleware(['seller']), async (req, res) => {
  const { titleFa, titleEn, categories = [] } = req.body;

  if (!titleFa) {
    throw new CustomError(400, 'BAD_REQUEST', {
      fa: 'عنوان فارسی الزامی است.',
      en: 'Farsi title is required.',
    });
  }

  if (!titleEn) {
    throw new CustomError(400, 'BAD_REQUEST', {
      fa: 'عنوان انگلیسی الزامی است.',
      en: 'English title is required.',
    });
  }

  const slug = slugify(titleEn);

  const existingBrand = await Brand.findOne({ $or: [{ titleEn }, { slug }] });

  if (existingBrand) {
    throw new CustomError(400, 'BAD_REQUEST', {
      fa: 'برندی با این عنوان انگلیسی از قبل وجود دارد.',
      en: 'A brand with this English title already exists.',
    });
  }

  const brand = new Brand({
    titleFa,
    titleEn,
    categories,
    sellers: [req.seller._id],
    slug,
    status: 'pending',
  });

  try {
    await brand.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new CustomError(400, 'BAD_REQUEST', {
        fa: 'برندی با این عنوان انگلیسی از قبل وجود دارد.',
        en: 'A brand with this English title already exists.',
      });
    }
    throw err;
  }

  res.status(201).json(brand);
});

router.get('/my', authMiddleware, roleMiddleware(['seller']), async (req, res) => {
  const brands = await Brand.find({ sellers: req.seller._id });
  res.json(brands);
});

router.put('/:id', async (req, res) => {
  const { titleFa, titleEn, categories, logo, isActive, status } = req.body;

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'برند یافت نشد.',
      en: 'Brand not found.',
    });
  }

  if (titleEn && titleEn !== brand.titleEn) {
    const existing = await Brand.findOne({
      $or: [{ titleEn }, { slug: slugify(titleEn) }],
      _id: { $ne: brand._id },
    });
    if (existing) {
      throw new CustomError(400, 'BAD_REQUEST', {
        fa: 'برندی با این عنوان انگلیسی از قبل وجود دارد.',
        en: 'A brand with this English title already exists.',
      });
    }
    brand.slug = slugify(titleEn);
    brand.titleEn = titleEn;
  }

  if (titleFa !== undefined) brand.titleFa = titleFa;
  if (categories !== undefined) brand.categories = categories;
  if (logo !== undefined) brand.logo = logo;
  if (isActive !== undefined) brand.isActive = isActive;
  if (status !== undefined) brand.status = status;

  await brand.save();
  res.json(brand);
});

// POST approve brand
router.post('/:id/approve', async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'برند یافت نشد.',
      en: 'Brand not found.',
    });
  }

  brand.status = 'approved';
  await brand.save();
  res.json(brand);
});

// POST reject brand
router.post('/:id/reject', async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim() === '') {
    throw new CustomError(400, 'BAD_REQUEST', {
      fa: 'دلیل رد برند الزامی است.',
      en: 'Rejection reason is required.',
    });
  }

  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'برند یافت نشد.',
      en: 'Brand not found.',
    });
  }

  brand.status = 'rejected';
  await brand.save();
  res.json(brand);
});

// GET brand by ID
router.get('/:id', async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'برند یافت نشد.',
      en: 'Brand not found.',
    });
  }

  res.json(brand);
});

// GET brand by slug
router.get('/slug/:slug', async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });

  if (!brand) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'برند یافت نشد.',
      en: 'Brand not found.',
    });
  }

  res.json(brand);
});

module.exports = router;
