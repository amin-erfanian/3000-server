const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const CustomError = require('../classes/custom-error');

// GET all categories
router.get('/', async (req, res) => {
  const { page = 1, limit = 50, isActive, parent, search } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (parent !== undefined) {
    filter.parent = parent === 'null' ? null : parent;
  }

  if (search) {
    filter.$or = [
      { titleFa: { $regex: search, $options: 'i' } },
      { titleEn: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [categories, total] = await Promise.all([
    Category.find(filter).populate('parent', 'titleFa titleEn slug').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Category.countDocuments(filter),
  ]);

  res.json({
    data: categories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET category tree (for navigation/menus)
router.get('/tree', async (req, res) => {
  const tree = await Category.getTree();
  res.json(tree);
});

// GET category by ID
router.get('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id).populate('parent', 'titleFa titleEn slug');

  if (!category) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  res.json(category);
});

// GET category by slug
router.get('/slug/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate('parent', 'titleFa titleEn slug');

  if (!category) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  res.json(category);
});

// GET category breadcrumb
router.get('/:id/breadcrumb', async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  const breadcrumb = await category.getBreadcrumb();
  res.json(breadcrumb);
});

module.exports = router;

