// services/variant.service.js
const mongoose = require('mongoose');
const Variant = require('../models/Variant');
const Product = require('../models/Product');

class VariantService {
  /**
   * Get all variants with filters and pagination
   */
  async getVariants(filters = {}, pagination = {}, sort = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const { sortBy = 'createdAt', sortOrder = 'desc' } = sort;

      const skip = (page - 1) * limit;
      const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [variants, total] = await Promise.all([
        Variant.find(filters)
          .populate('product', 'titleFa titleEn slug images.main')
          .populate('seller', 'title slug rating')
          .populate('color', 'title titleEn hexCode')
          .populate('warranty', 'titleFa titleEn duration')
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Variant.countDocuments(filters),
      ]);

      return {
        success: true,
        data: variants,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`خطا در دریافت variantها: ${error.message}`);
    }
  }

  /**
   * Get variant by ID
   */
  async getVariantById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('شناسه variant نامعتبر است');
      }

      const variant = await Variant.findById(id)
        .populate('product', 'titleFa titleEn slug images.main category brand')
        .populate('seller', 'title slug rating contactInfo')
        .populate('color', 'title titleEn hexCode')
        .populate('warranty', 'titleFa titleEn description duration')
        .lean();

      if (!variant) {
        throw new Error('variant یافت نشد');
      }

      return {
        success: true,
        data: variant,
      };
    } catch (error) {
      throw new Error(`خطا در دریافت variant: ${error.message}`);
    }
  }

  /**
   * Get variant by SKU
   */
  async getVariantBySku(sku) {
    try {
      const variant = await Variant.findOne({ sku })
        .populate('product', 'titleFa titleEn slug images.main category brand')
        .populate('seller', 'title slug rating contactInfo')
        .populate('color', 'title titleEn hexCode')
        .populate('warranty', 'titleFa titleEn description duration')
        .lean();

      if (!variant) {
        throw new Error('variant یافت نشد');
      }

      return {
        success: true,
        data: variant,
      };
    } catch (error) {
      throw new Error(`خطا در دریافت variant: ${error.message}`);
    }
  }

  /**
   * Get seller's variants
   */
  async getSellerVariants(sellerId, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        throw new Error('شناسه فروشنده نامعتبر است');
      }

      const { status, page = 1, limit = 20 } = options;
      const filters = { seller: sellerId };

      if (status) {
        filters.status = status;
      }

      return await this.getVariants(filters, { page, limit });
    } catch (error) {
      throw new Error(`خطا در دریافت variantهای فروشنده: ${error.message}`);
    }
  }

  /**
   * Get seller's specific variant
   */
  async getSellerVariant(variantId, sellerId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(variantId) || !mongoose.Types.ObjectId.isValid(sellerId)) {
        throw new Error('شناسه نامعتبر است');
      }

      const variant = await Variant.findOne({ _id: variantId, seller: sellerId })
        .populate('product', 'titleFa titleEn slug images category brand')
        .populate('color', 'title titleEn hexCode')
        .populate('warranty', 'titleFa titleEn description duration')
        .lean();

      return variant;
    } catch (error) {
      throw new Error(`خطا در دریافت variant: ${error.message}`);
    }
  }

  /**
   * Create new variant
   */
  async createVariant(data) {
    try {
      const { productId, price } = data;
      const sellerId = data.sellerId || data.seller;

      if (!productId || !sellerId || price === null || price === undefined) {
        throw new Error('productId, sellerId and price are required');
      }

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('product not found');
      }

      // Check if seller already has a variant for this product
      const existing = await Variant.findOne({ product: productId, seller: sellerId });
      if (existing) {
        throw new Error('you already have a variant for this product');
      }

      // Create variant
      const variant = await Variant.create({
        product: productId,
        seller: sellerId,
        price: data.price,
        stock: data.stock ?? 0,
        color: data.colorId || undefined,
        warranty: data.warrantyId || undefined,
        size: data.size || '',
        barcode: data.barcode || '',
        leadTime: data.leadTime || 0,
        discountPercent: data.discountPercent || 0,
        originalPrice: data.price,
        status: 'pending',
      });

      const variantsCount = await Variant.countDocuments({ product: productId });

      return {
        success: true,
        data: {
          variant_id: variant._id,
          product_id: productId,
          product_title: product.titleFa || product.titleEn,
          variants_count: variantsCount,
          status: variant.status,
          price: variant.price,
          stock: variant.stock,
        },
      };
    } catch (error) {
      throw new Error(`خطا در ایجاد variant: ${error.message}`);
    }
  }

  /**
   * Update seller's variant
   */
  async updateSellerVariant(variantId, sellerId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(variantId) || !mongoose.Types.ObjectId.isValid(sellerId)) {
        throw new Error('شناسه نامعتبر است');
      }

      const variant = await Variant.findOneAndUpdate(
        { _id: variantId, seller: sellerId },
        { $set: updateData },
        { new: true, runValidators: true },
      )
        .populate('product', 'titleFa titleEn')
        .lean();

      return variant;
    } catch (error) {
      throw new Error(`خطا در به‌روزرسانی variant: ${error.message}`);
    }
  }

  /**
   * Approve variant (admin)
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
  async getPendingVariants(page = 1, limit = 20) {
    try {
      const filters = { status: 'pending' };
      return await this.getVariants(filters, { page, limit });
    } catch (error) {
      throw new Error(`خطا در دریافت variantهای در انتظار: ${error.message}`);
    }
  }
}

module.exports = new VariantService();
