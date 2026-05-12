// services/product.service.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Variant = require('../models/Variant');

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

  async getProductById(id, populateFields = []) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      const pipeline = [
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
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
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$brand',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            titleFa: 1,
            titleEn: 1,
            slug: 1,
            sku: 1,
            status: 1,
            marketStatus: 1,
            minBasketQuantity: 1,
            images: 1,
            referencePrice: { $ifNull: ['$referencePrice', 0] },
            commission: { $ifNull: ['$commission', 0] },
            category: {
              _id: 1,
              titleFa: 1,
              titleEn: 1,
              slug: 1,
            },
            brand: {
              _id: 1,
              titleFa: 1,
              titleEn: 1,
              slug: 1,
              logo: 1,
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const products = await Product.aggregate(pipeline);

      if (!products || products.length === 0) {
        return {
          success: false,
          message: 'محصول یافت نشد',
        };
      }

      return {
        success: true,
        data: products[0],
      };
    } catch (error) {
      return {
        success: false,
        message: `خطا در دریافت محصول: ${error.message}`,
      };
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
        .populate('product', 'titleFa titleEn images')
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
        const Category = require('../models/Category');
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
        const Brand = require('../models/Brand');
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
        const Color = require('../models/Color');
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
   * ساخت محصول جدید
   */
  async createProduct(data) {
    try {
      const product = new Product(data);
      await product.save();

      return {
        success: true,
        data: product,
        message: 'محصول با موفقیت ایجاد شد',
      };
    } catch (error) {
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
      throw new Error(`خطا در به‌روزرسانی محصول: ${error.message}`);
    }
  }

  /**
   * حذف محصول (soft delete)
   */
  async deleteProduct(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      const product = await Product.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });

      if (!product) {
        throw new Error('محصول یافت نشد');
      }

      return {
        success: true,
        message: 'محصول با موفقیت غیرفعال شد',
      };
    } catch (error) {
      throw new Error(`خطا در حذف محصول: ${error.message}`);
    }
  }

  /**
   * Approve product (admin)
   */
  async approveVariant(variantId, adminId, note) {
    try {
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error('شناسه variant نامعتبر است');
      }

      const approvalData = {
        action: 'approved',
        admin: adminId,
        timestamp: new Date(),
      };

      if (note) {
        approvalData.note = note;
      }

      const variant = await Variant.findByIdAndUpdate(
        variantId,
        {
          $set: { status: 'approved', isActive: true },
          $push: {
            approvalHistory: approvalData,
          },
        },
        { new: true },
      ).populate('product', 'titleFa titleEn');

      if (!variant) {
        throw new Error('variant یافت نشد');
      }

      return {
        success: true,
        data: variant,
        message: 'variant تایید شد',
      };
    } catch (error) {
      throw new Error(`خطا در تایید variant: ${error.message}`);
    }
  }

  /**
   * Reject variant (admin)
   */
  async rejectVariant(variantId, adminId, reason, issues) {
    try {
      if (!mongoose.Types.ObjectId.isValid(variantId)) {
        throw new Error('شناسه variant نامعتبر است');
      }

      if (!reason || reason.trim() === '') {
        throw new Error('دلیل رد variant الزامی است');
      }

      const rejectionData = {
        action: 'rejected',
        admin: adminId,
        note: reason,
        timestamp: new Date(),
      };

      if (issues && Array.isArray(issues) && issues.length > 0) {
        rejectionData.issues = issues;
      }

      const variant = await Variant.findByIdAndUpdate(
        variantId,
        {
          $set: {
            status: 'rejected',
            rejectionReason: reason,
            ...(issues && issues.length > 0 && { rejectionIssues: issues }),
          },
          $push: {
            approvalHistory: rejectionData,
          },
        },
        { new: true },
      ).populate('product', 'titleFa titleEn');

      if (!variant) {
        throw new Error('variant یافت نشد');
      }

      return {
        success: true,
        data: variant,
        message: 'variant رد شد',
      };
    } catch (error) {
      throw new Error(`خطا در رد variant: ${error.message}`);
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
