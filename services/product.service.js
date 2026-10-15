// services/product.service.js
const mongoose = require('mongoose');
const Product = require('../models/product');
const Variant = require('../models/variant');
const Category = require('../models/category');
const CustomError = require('../classes/custom-error');

const isEmptyAttributeValue = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && !value.length);

class ProductService {
  /**
   * دریافت لیست محصولات با فیلتر و صفحه‌بندی
   */
  async getProducts(filters = {}, pagination = {}, sort = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const { sortBy = 'createdAt', sortOrder = 'desc' } = sort;

      const skip = (page - 1) * limit;
      const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [products, total] = await Promise.all([
        Product.find(filters)
          .populate('category', 'titleFa titleEn slug')
          .populate('brand', 'titleFa titleEn slug logo')
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Product.countDocuments(filters),
      ]);

      return {
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`خطا در دریافت محصولات: ${error.message}`);
    }
  }

  async getProductsByCategorySlug(categorySlug, options = {}) {
    try {
      const Category = require('../models/category');
      const category = await Category.findOne({ slug: categorySlug }).lean();

      if (!category) {
        throw new Error('دسته‌بندی یافت نشد');
      }

      const filters = {
        category: category._id,
        isActive: true,
        status: 'active',
      };

      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

      const result = await this.getProducts(filters, { page, limit }, { sortBy, sortOrder });

      return {
        ...result,
        category,
      };
    } catch (error) {
      throw new Error(`خطا در دریافت محصولات دسته‌بندی: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      const product = await Product.findById(id)
        .populate('category', '_id titleFa titleEn slug')
        .populate('brand', '_id titleFa titleEn slug logo')
        .lean();

      if (!product) {
        return { success: false, message: 'محصول یافت نشد' };
      }

      return { success: true, data: product };
    } catch (error) {
      return { success: false, message: `خطا در دریافت محصول: ${error.message}` };
    }
  }

  /**
   * دریافت محصول با slug
   */
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({ slug })
        .populate('category', 'titleFa titleEn slug')
        .populate('brand', 'titleFa titleEn slug logo')
        .lean();

      if (!product) {
        throw new Error('محصول یافت نشد');
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      throw new Error(`خطا در دریافت محصول: ${error.message}`);
    }
  }

  /**
   * دریافت محصولات یک فروشنده خاص
   */
  async getSellerProducts(sellerId, filters = {}, pagination = {}, sort = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        throw new Error('شناسه فروشنده نامعتبر است');
      }

      // پیدا کردن variantهای فروشنده
      const sellerVariants = await Variant.find({ seller: sellerId }).select('product').lean();

      // استخراج IDهای یکتای محصولات
      const productIds = [...new Set(sellerVariants.map((v) => v.product.toString()))];

      if (productIds.length === 0) {
        return {
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: pagination.limit || 20,
            total: 0,
            pages: 0,
          },
        };
      }

      // اضافه کردن فیلتر محصولات فروشنده
      filters._id = { $in: productIds };

      return await this.getProducts(filters, pagination, sort);
    } catch (error) {
      throw new Error(`خطا در دریافت محصولات فروشنده: ${error.message}`);
    }
  }

  /**
   * دریافت variantهای یک محصول
   */
  async getProductVariants(productId, filters = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      filters.product = productId;

      const variants = await Variant.find(filters)
        .populate('seller', 'storeName email phone')
        .populate('product', 'titleFa titleEn images referencePrice')
        .populate('color')
        .populate('warranty')
        .sort({ createdAt: -1 }) // newest first
        .lean();

      return {
        success: true,
        count: variants.length, // helpful for UI
        data: variants,
      };
    } catch (error) {
      throw new Error(`خطا در دریافت variantها: ${error.message}`);
    }
  }

  /**
   * دریافت لیست محصولات با فیلترهای پیشرفته (مشابه endpoint /list)
   */
  async getProductList(queryParams) {
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
      } = queryParams;

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Build filters
      const filters = {};

      // Category filter (slug-based)
      if (categories) {
        const Category = require('../models/category');
        const categoryList = categories.split(',').map((s) => s.trim());
        const categoryDocs = await Category.find({ slug: { $in: categoryList } })
          .select('_id')
          .lean();
        if (categoryDocs.length > 0) {
          filters.category = { $in: categoryDocs.map((c) => c._id) };
        }
      }

      // Brand filter (slug-based)
      if (brands) {
        const Brand = require('../models/brand');
        const brandList = brands.split(',').map((s) => s.trim());
        const brandDocs = await Brand.find({ slug: { $in: brandList } })
          .select('_id')
          .lean();
        if (brandDocs.length > 0) {
          filters.brand = { $in: brandDocs.map((b) => b._id) };
        }
      }

      // Status filter
      if (statuses) {
        const statusList = statuses.split(',').map((s) => s.trim());
        filters.status = { $in: statusList };
      }

      // Fake filter
      if (fake !== undefined) {
        filters['properties.isFake'] = fake === 'true';
      }

      // Keyword search
      if (keyword) {
        filters.$or = [
          { titleFa: { $regex: keyword, $options: 'i' } },
          { titleEn: { $regex: keyword, $options: 'i' } },
        ];
      }

      // Color filter (via variants)
      let productIdsFromColors = null;
      if (colors) {
        const Color = require('../models/color');
        const colorList = colors.split(',').map((s) => s.trim());
        const colorDocs = await Color.find({ slug: { $in: colorList } })
          .select('_id')
          .lean();
        if (colorDocs.length > 0) {
          const colorIds = colorDocs.map((c) => c._id);
          const variants = await Variant.find({ color: { $in: colorIds } })
            .select('product')
            .lean();
          productIdsFromColors = [...new Set(variants.map((v) => v.product.toString()))];
        }
      }

      if (productIdsFromColors !== null) {
        if (productIdsFromColors.length === 0) {
          return {
            success: true,
            data: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: 0,
              pages: 0,
            },
          };
        }
        filters._id = { $in: productIdsFromColors };
      }

      // Sort
      const sortObj = { [sort_column]: sort_order === 'asc' ? 1 : -1 };

      // Execute query
      const [products, total] = await Promise.all([
        Product.find(filters)
          .populate('category', 'titleFa titleEn slug')
          .populate('brand', 'titleFa titleEn slug logo')
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Product.countDocuments(filters),
      ]);

      return {
        success: true,
        data: products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      throw new Error(`خطا در دریافت لیست محصولات: ${error.message}`);
    }
  }

  /**
   * Ensure every required, active attribute of the category has a value in the product attributes
   */
  async validateRequiredAttributes(categoryId, attributes = []) {
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) return;

    const category = await Category.findById(categoryId)
      .select('attributes')
      .populate({ path: 'attributes', match: { required: true, isActive: true }, select: 'key label' })
      .lean();

    if (!category) {
      throw new CustomError(400, 'VALIDATION_ERROR', {
        fa: 'دسته‌بندی یافت نشد',
        en: 'Category not found',
      });
    }

    const filledKeys = new Set(
      (attributes || []).filter((attr) => attr && !isEmptyAttributeValue(attr.value)).map((attr) => attr.key),
    );
    const missing = category.attributes.filter((attr) => attr && !filledKeys.has(attr.key));

    if (missing.length) {
      throw new CustomError(400, 'MISSING_REQUIRED_ATTRIBUTES', {
        fa: `مقدار ویژگی‌های الزامی وارد نشده است: ${missing.map((attr) => attr.label).join('، ')}`,
        en: `Missing required attributes: ${missing.map((attr) => attr.key).join(', ')}`,
      });
    }
  }

  /**
   * ساخت محصول جدید
   */
  async createProduct(data) {
    try {
      await this.validateRequiredAttributes(data.category, data.attributes);

      const product = new Product(data);
      await product.save();

      return {
        success: true,
        data: product,
        message: 'محصول با موفقیت ایجاد شد',
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new Error(`خطا در ایجاد محصول: ${error.message}`);
    }
  }

  /**
   * آپدیت محصول
   */
  async updateProduct(id, data) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      // Category or attributes may change independently, so validate the resulting combination
      if (data.category !== undefined || data.attributes !== undefined) {
        const existing = await Product.findById(id).select('category attributes').lean();
        if (!existing) {
          throw new Error('محصول یافت نشد');
        }
        await this.validateRequiredAttributes(
          data.category ?? existing.category,
          data.attributes ?? existing.attributes,
        );
      }

      const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });

      if (!product) {
        throw new Error('محصول یافت نشد');
      }

      return {
        success: true,
        data: product,
        message: 'محصول با موفقیت به‌روزرسانی شد',
      };
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new Error(`خطا در به‌روزرسانی محصول: ${error.message}`);
    }
  }

  /**
   * Approve product (admin)
   */
  async approveProduct(productId, adminId, note = '') {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error('شناسه ادمین نامعتبر است');
      }

      const now = new Date();
      const historyItem = {
        action: 'approved',
        performedBy: adminId,
        performedAt: now,
        reason: note?.trim() || '',
      };

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            status: 'approved',
            approvedBy: adminId,
            approvedAt: now,
            rejectionReasons: [],
            rejectedAt: null,
            rejectedBy: null,
          },
          // legacy fields from the previous rejection structure
          $unset: { rejectionReason: 1, rejectionIssues: 1 },
          $push: {
            approvalHistory: historyItem,
          },
        },
        // strict: false lets the $unset reach paths no longer in the schema
        { new: true, runValidators: true, strict: false },
      )
        .populate('category', 'titleFa titleEn slug logo')
        .populate('brand', 'titleFa titleEn slug logo');

      if (!product) {
        throw new Error('محصول یافت نشد');
      }

      return {
        success: true,
        data: product,
        message: 'محصول تایید شد',
      };
    } catch (error) {
      throw new Error(`خطا در تایید محصول: ${error.message}`);
    }
  }

  /**
   * Reject product (admin)
   */
  /**
   * @param {Array<{ property: string, message: string }>} rejectionReasons
   *   property is a dot path to the rejected field, e.g. titleFa or attributes.model
   */
  async rejectProduct(productId, adminId, rejectionReasons = []) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error('شناسه ادمین نامعتبر است');
      }

      if (!Array.isArray(rejectionReasons) || !rejectionReasons.length) {
        throw new Error('حداقل یک دلیل رد الزامی است');
      }

      const normalizedReasons = rejectionReasons.map((item) => ({
        property: typeof item?.property === 'string' ? item.property.trim() : '',
        message: typeof item?.message === 'string' ? item.message.trim() : '',
      }));

      if (normalizedReasons.some(({ property, message }) => !property || !message)) {
        throw new Error('ویژگی و توضیحات هر دلیل رد الزامی است');
      }

      const properties = normalizedReasons.map(({ property }) => property);
      if (new Set(properties).size !== properties.length) {
        throw new Error('هر ویژگی فقط یک بار می‌تواند رد شود');
      }

      const now = new Date();

      const historyItem = {
        action: 'rejected',
        performedBy: adminId,
        performedAt: now,
        rejectionReasons: normalizedReasons,
      };

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            status: 'rejected',
            approvedBy: null,
            approvedAt: null,
            rejectionReasons: normalizedReasons,
            rejectedAt: now,
            rejectedBy: adminId,
          },
          // legacy fields from the previous rejection structure
          $unset: { rejectionReason: 1, rejectionIssues: 1 },
          $push: {
            approvalHistory: historyItem,
          },
        },
        // strict: false lets the $unset reach paths no longer in the schema
        { new: true, runValidators: true, strict: false },
      )
        .populate('category', 'titleFa titleEn slug logo')
        .populate('brand', 'titleFa titleEn slug logo');

      if (!product) {
        throw new Error('محصول یافت نشد');
      }

      return {
        success: true,
        data: product,
        message: 'محصول رد شد',
      };
    } catch (error) {
      throw new Error(`خطا در رد محصول: ${error.message}`);
    }
  }
  /**
   * Get pending variants (admin)
   */
  async getPendingProducts(page = 1, limit = 20) {
    try {
      const filters = { status: 'pending' };
      return await this.getProducts(filters, { page, limit });
    } catch (error) {
      throw new Error(`خطا در دریافت variantهای در انتظار: ${error.message}`);
    }
  }
}

module.exports = new ProductService();
