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
    Category.find(filter)
      .populate('parent', 'titleFa titleEn slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
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
  const category = await Category.findOne({ slug: req.params.slug }).populate(
    'parent',
    'titleFa titleEn slug',
  );

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

// POST create new category
router.post('/', async (req, res) => {
  const { titleFa, titleEn, slug, parent, image, returnReasonAlert, isActive } = req.body;

  if (!titleFa || !slug) {
    throw new CustomError(400, 'VALIDATION_ERROR', {
      fa: 'عنوان فارسی و اسلاگ الزامی است.',
      en: 'Persian title and slug are required.',
    });
  }

  // Check if slug already exists
  const existingCategory = await Category.findOne({ slug });
  if (existingCategory) {
    throw new CustomError(409, 'DUPLICATE_SLUG', {
      fa: 'اسلاگ تکراری است.',
      en: 'Slug already exists.',
    });
  }

  // Validate parent exists if provided
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw new CustomError(404, 'PARENT_NOT_FOUND', {
        fa: 'دسته‌بندی والد یافت نشد.',
        en: 'Parent category not found.',
      });
    }
  }

  const category = new Category({
    titleFa,
    titleEn: titleEn || '',
    slug,
    parent: parent || null,
    image: image || '',
    returnReasonAlert: returnReasonAlert || '',
    isActive: isActive !== undefined ? isActive : true,
  });

  await category.save();

  const populatedCategory = await Category.findById(category._id).populate('parent', 'titleFa titleEn slug');

  res.status(201).json(populatedCategory);
});

// PUT update category
router.put('/:id', async (req, res) => {
  const { titleFa, titleEn, slug, parent, image, returnReasonAlert, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  // Check if slug is being changed and if it's unique
  if (slug && slug !== category.slug) {
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new CustomError(409, 'DUPLICATE_SLUG', {
        fa: 'اسلاگ تکراری است.',
        en: 'Slug already exists.',
      });
    }
  }

  // Prevent setting parent to self or creating circular reference
  if (parent && parent === req.params.id) {
    throw new CustomError(400, 'INVALID_PARENT', {
      fa: 'دسته‌بندی نمی‌تواند والد خودش باشد.',
      en: 'Category cannot be its own parent.',
    });
  }

  // Validate parent exists if provided
  if (parent && parent !== category.parent?.toString()) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw new CustomError(404, 'PARENT_NOT_FOUND', {
        fa: 'دسته‌بندی والد یافت نشد.',
        en: 'Parent category not found.',
      });
    }
  }

  // Update fields
  if (titleFa !== undefined) category.titleFa = titleFa;
  if (titleEn !== undefined) category.titleEn = titleEn;
  if (slug !== undefined) category.slug = slug;
  if (parent !== undefined) category.parent = parent || null;
  if (image !== undefined) category.image = image;
  if (returnReasonAlert !== undefined) category.returnReasonAlert = returnReasonAlert;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  const updatedCategory = await Category.findById(category._id).populate('parent', 'titleFa titleEn slug');

  res.json(updatedCategory);
});

// DELETE category
router.delete('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  // Check if category has children
  const childrenCount = await Category.countDocuments({ parent: req.params.id });
  if (childrenCount > 0) {
    throw new CustomError(400, 'HAS_CHILDREN', {
      fa: 'این دسته‌بندی دارای زیرمجموعه است و نمی‌توان آن را حذف کرد.',
      en: 'Cannot delete category with children.',
    });
  }

  // Optional: Check if category is used by products
  // const Product = require('../models/product');
  // const productsCount = await Product.countDocuments({ category: req.params.id });
  // if (productsCount > 0) {
  //   throw new CustomError(400, 'HAS_PRODUCTS', {
  //     fa: 'این دسته‌بندی دارای محصول است و نمی‌توان آن را حذف کرد.',
  //     en: 'Cannot delete category with products.',
  //   });
  // }

  await category.deleteOne();

  res.json({
    message: {
      fa: 'دسته‌بندی با موفقیت حذف شد.',
      en: 'Category deleted successfully.',
    },
  });
});

module.exports = router;
