const express = require('express');
const router = express.Router();
const Attribute = require('../../models/attribute');
const Category = require('../../models/category');
const CustomError = require('../../classes/custom-error');

const authMiddleware = require('../../middlewares/authorization');
const roleMiddleware = require('../../middlewares/role');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// GET all attributes
router.get('/', async (req, res) => {
  const attributes = await Attribute.find().sort({ createdAt: -1 });

  res.json(attributes);
});

// GET unique headers
router.get('/headers', async (req, res) => {
  const headers = await Attribute.distinct('header', {
    isActive: true,
    header: { $ne: '' },
  });

  res.json(headers);
});

// POST create new attribute
router.post('/', async (req, res) => {
  const { key, header, label, type, options, required, placeholder, isActive } = req.body;

  if (!key || !label || !type) {
    throw new CustomError(400, 'VALIDATION_ERROR', {
      fa: 'کلید، برچسب و نوع ویژگی الزامی است.',
      en: 'Attribute key, label and type are required.',
    });
  }

  // Check if key already exists
  const existingAttribute = await Attribute.findOne({ key });
  if (existingAttribute) {
    throw new CustomError(409, 'DUPLICATE_KEY', {
      fa: 'کلید ویژگی تکراری است.',
      en: 'Attribute key already exists.',
    });
  }

  const attribute = new Attribute({
    key,
    header: header || '',
    label,
    type,
    options: Array.isArray(options) ? options : [],
    required: required !== undefined ? required : false,
    placeholder: placeholder || '',
    isActive: isActive !== undefined ? isActive : true,
  });

  await attribute.save();

  res.status(201).json(attribute);
});

// POST batch create attributes
router.post('/batch', async (req, res) => {
  const { attributes } = req.body;

  if (!Array.isArray(attributes) || attributes.length === 0) {
    throw new CustomError(400, 'VALIDATION_ERROR', {
      fa: 'attributes باید یک آرایه غیرخالی باشد.',
      en: 'attributes must be a non-empty array.',
    });
  }

  // Validate each attribute has required fields
  const invalidItems = [];
  attributes.forEach((attr, index) => {
    if (!attr.key || !attr.label || !attr.type) {
      invalidItems.push(index);
    }
  });

  if (invalidItems.length > 0) {
    throw new CustomError(400, 'VALIDATION_ERROR', {
      fa: `آیتم‌های ${invalidItems.join(', ')} فاقد فیلدهای الزامی هستند.`,
      en: `Items at indices ${invalidItems.join(', ')} are missing required fields (key, label, type).`,
    });
  }

  // Dedupe by key within the batch — the first occurrence wins, later
  // occurrences only add their categories to the same attribute.
  const attributesByKey = new Map();
  for (const attr of attributes) {
    if (!attributesByKey.has(attr.key)) {
      attributesByKey.set(attr.key, {
        ...attr,
        categoryIds: [...(attr.categoryIds || [])],
      });
    } else {
      const first = attributesByKey.get(attr.key);
      for (const categoryId of attr.categoryIds || []) {
        if (!first.categoryIds.includes(categoryId)) {
          first.categoryIds.push(categoryId);
        }
      }
    }
  }
  const uniqueAttributes = [...attributesByKey.values()];

  // Attributes whose keys already exist in the database are not re-created;
  // they are only assigned to their categories further below.
  const keys = uniqueAttributes.map((a) => a.key);
  const existingAttributes = await Attribute.find({ key: { $in: keys } }).select('key');
  const existingIdByKey = new Map(
    existingAttributes.map((a) => [a.key, a._id]),
  );
  const newAttributes = uniqueAttributes.filter((a) => !existingIdByKey.has(a.key));

  // Each attribute carries the list of categories it must be assigned to
  const categoryIds = [
    ...new Set(uniqueAttributes.flatMap((a) => a.categoryIds)),
  ];
  if (categoryIds.length > 0) {
    const foundCategories = await Category.countDocuments({ _id: { $in: categoryIds } });
    if (foundCategories !== categoryIds.length) {
      throw new CustomError(404, 'CATEGORY_NOT_FOUND', {
        fa: 'یک یا چند دسته‌بندی یافت نشد.',
        en: 'One or more categories not found.',
      });
    }
  }

  // Prepare documents with defaults
  const documents = newAttributes.map((attr) => ({
    key: attr.key,
    header: attr.header || '',
    label: attr.label,
    type: attr.type,
    options: Array.isArray(attr.options) ? attr.options : [],
    required: attr.required !== undefined ? attr.required : false,
    placeholder: attr.placeholder || '',
    isActive: attr.isActive !== undefined ? attr.isActive : true,
  }));

  // Insert all new attributes atomically
  const createdAttributes =
    documents.length > 0
      ? await Attribute.insertMany(documents, { ordered: true })
      : [];

  // Assign every attribute — newly created or already existing — to its
  // categories. $addToSet skips assignments that are already in place.
  const idByKey = new Map(existingIdByKey);
  for (const attribute of createdAttributes) {
    idByKey.set(attribute.key, attribute._id);
  }

  const updates = uniqueAttributes
    .filter((attr) => attr.categoryIds.length > 0 && idByKey.has(attr.key))
    .map((attr) => ({
      updateOne: {
        filter: { _id: { $in: attr.categoryIds } },
        update: { $addToSet: { attributes: idByKey.get(attr.key) } },
      },
    }));

  if (updates.length > 0) {
    await Category.bulkWrite(updates, { ordered: true });
  }

  res.status(201).json({
    count: createdAttributes.length,
    attributes: createdAttributes,
    existingKeys: [...existingIdByKey.keys()],
  });
});

// PUT update an attribute
router.put('/:id', async (req, res) => {
  const { key, header, label, type, options, required, placeholder, isActive } = req.body;

  const attribute = await Attribute.findById(req.params.id);
  if (!attribute) {
    throw new CustomError(404, 'ATTRIBUTE_NOT_FOUND', {
      fa: 'ویژگی یافت نشد.',
      en: 'Attribute not found.',
    });
  }

  if (key !== undefined && key !== attribute.key) {
    const existingAttribute = await Attribute.findOne({ key, _id: { $ne: attribute._id } });
    if (existingAttribute) {
      throw new CustomError(409, 'DUPLICATE_KEY', {
        fa: 'کلید ویژگی تکراری است.',
        en: 'Attribute key already exists.',
      });
    }
    attribute.key = key;
  }

  if (header !== undefined) attribute.header = header;
  if (label !== undefined) attribute.label = label;
  if (type !== undefined) attribute.type = type;
  if (options !== undefined) attribute.options = Array.isArray(options) ? options : attribute.options;
  if (required !== undefined) attribute.required = required;
  if (placeholder !== undefined) attribute.placeholder = placeholder;
  if (isActive !== undefined) attribute.isActive = isActive;

  await attribute.save();

  res.json(attribute);
});

// POST add a list of attributes to a category
router.post('/category/:categoryId', async (req, res) => {
  const { attributeIds } = req.body;

  if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
    throw new CustomError(400, 'VALIDATION_ERROR', {
      fa: 'attributeIds باید یک آرایه غیرخالی باشد.',
      en: 'attributeIds must be a non-empty array.',
    });
  }

  const category = await Category.findById(req.params.categoryId);
  if (!category) {
    throw new CustomError(404, 'CATEGORY_NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  // Validate all attributes exist (dedupe first so repeated ids don't fail the count check)
  const uniqueIds = [...new Set(attributeIds)];
  const foundAttributes = await Attribute.countDocuments({ _id: { $in: uniqueIds } });
  if (foundAttributes !== uniqueIds.length) {
    throw new CustomError(404, 'ATTRIBUTE_NOT_FOUND', {
      fa: 'یک یا چند ویژگی یافت نشد.',
      en: 'One or more attributes not found.',
    });
  }

  // Append without duplicating already-linked attributes
  category.attributes.addToSet(...attributeIds);
  await category.save();

  const updatedCategory = await Category.findById(category._id)
    .populate('attributes')
    .populate('parent', 'titleFa titleEn slug');

  res.json(updatedCategory);
});

// DELETE remove an attribute from a category
router.delete('/category/:categoryId/:attributeId', async (req, res) => {
  const { categoryId, attributeId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new CustomError(404, 'CATEGORY_NOT_FOUND', {
      fa: 'دسته‌بندی یافت نشد.',
      en: 'Category not found.',
    });
  }

  const attributeExists = category.attributes.some((id) => id.toString() === attributeId);
  if (!attributeExists) {
    throw new CustomError(404, 'ATTRIBUTE_NOT_FOUND', {
      fa: 'ویژگی در این دسته‌بندی یافت نشد.',
      en: 'Attribute not found on this category.',
    });
  }

  category.attributes.pull(attributeId);
  await category.save();

  const updatedCategory = await Category.findById(category._id)
    .populate('attributes')
    .populate('parent', 'titleFa titleEn slug');

  res.json(updatedCategory);
});

module.exports = router;
