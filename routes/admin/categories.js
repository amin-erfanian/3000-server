const express = require('express');
const router = express.Router();
const Category = require('../../models/category');
const CustomError = require('../../classes/custom-error');

const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// POST create new category
router.post('/', async (req, res) => {
  const {
    titleFa,
    titleEn,
    slug,
    parent,
    image,
    returnReasonAlert,
    isActive,
    attributes,
    commission,
    publicIds,
  } = req.body;

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
    attributes: attributes || [],
    commission: commission !== undefined ? commission : 0,
    publicIds: publicIds || [],
  });

  await category.save();

  const populatedCategory = await Category.findById(category._id).populate('parent', 'titleFa titleEn slug');

  res.status(201).json(populatedCategory);
});

// PUT update category
router.put('/:id', async (req, res) => {
  const {
    titleFa,
    titleEn,
    slug,
    parent,
    image,
    returnReasonAlert,
    isActive,
    attributes,
    commission,
    publicIds,
  } = req.body;

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
  if (attributes !== undefined) category.attributes = attributes;
  if (commission !== undefined) category.commission = commission;
  if (publicIds !== undefined) category.publicIds = publicIds;

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

// PUT replace attributes array
router.put('/:id/attributes', async (req, res) => {
  const { attributes } = req.body;

  if (!Array.isArray(attributes)) {
    throw new CustomError(400, 'VALIDATION_ERROR', {
      fa: 'attributes باید یک آرایه باشد.',
      en: 'attributes must be an array.',
    });
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { attributes },
    { new: true, runValidators: true },
  ).populate('parent', 'titleFa titleEn slug');

  if (!category) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  res.json(category);
});

module.exports = router;
