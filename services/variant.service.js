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
   * Get seller's variants with product, color, and warranty populated
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

      const result = await this.getVariants(filters, {
        page,
        limit,
        populate: [
          { path: 'product', select: 'referencePrice name' },
          { path: 'color', select: 'name hexCode' },
          { path: 'warranty', select: 'name duration' },
        ],
      });

      // Add referencePrice to root level of each variant for easier access
      result.data.variants = result.data.variants.map((variant) => ({
        ...variant,
        referencePrice: variant.product?.referencePrice || 0,
      }));

      return result;
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
      const { product: productId, price } = data;
      const sellerId = data.sellerId || data.seller;

      if (!productId || !sellerId || price === null || price === undefined) {
        throw new Error('productId, sellerId and price are required');
      }

      // Validate required fields
      if (!data.color) throw new Error('color is required');
      if (!data.stock && data.stock !== 0) throw new Error('stock is required');
      if (!data.orderLimit) throw new Error('orderLimit is required');

      // Parse and validate numbers
      const priceNum = Number(data.price);
      const stockNum = Number(data.stock);
      const orderLimitNum = Number(data.orderLimit);

      if (isNaN(priceNum)) throw new TypeError('price must be a valid number');
      if (isNaN(stockNum)) throw new TypeError('stock must be a valid number');
      if (isNaN(orderLimitNum)) throw new TypeError('orderLimit must be a valid number');

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('product not found');
      }

      // Check for duplicate variant: same product + seller + color + warranty combination
      const duplicateQuery = {
        product: productId,
        seller: sellerId,
        color: data.color,
      };

      // Only add warranty to query if it's provided
      if (data.warranty) {
        duplicateQuery.warranty = data.warranty;
      } else {
        duplicateQuery.warranty = { $exists: false };
      }

      const existing = await Variant.findOne(duplicateQuery);
      if (existing) {
        throw new Error('variant with this color and warranty combination already exists');
      }

      // Calculate originalPrice: use price only if discountPercent is provided, else null
      const originalPrice = data.discountPercent != null ? priceNum : null;

      // Map shipment methods from flat structure to nested object
      const shipmentMethods = {
        shipMarket: data.shipMarket || false,
        shipSeller: data.shipSeller || false,
        threeHour: data.threeHour || false,
        warehouseDelivery: data.warehouseDelivery || null,
        buyerDelivery: data.buyerDelivery || null,
        timeRange: data.timeRange || null,
      };

      // Create variant
      const variant = await Variant.create({
        product: productId,
        seller: sellerId,
        price: priceNum,
        originalPrice,
        stock: stockNum,
        orderLimit: orderLimitNum,
        color: data.color,
        sellerVariantId: data.sellerVariantId || '',
        warranty: data.warranty || undefined,
        size: data.size || '',
        barcode: data.barcode || '',
        leadTime: data.leadTime || 0,
        discountPercent: data.discountPercent || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        shipmentMethods,
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

      // Find existing variant
      const existingVariant = await Variant.findOne({ _id: variantId, seller: sellerId });
      if (!existingVariant) {
        throw new Error('variant not found or access denied');
      }

      // Fields that cannot be updated
      const protectedFields = ['_id', 'product', 'seller', 'createdAt', 'variantId'];
      protectedFields.forEach((field) => delete updateData[field]);

      // Validate numeric fields if provided
      if (updateData.price !== undefined) {
        const priceNum = Number(updateData.price);
        if (isNaN(priceNum)) throw new TypeError('price must be a valid number');
        updateData.price = priceNum;
      }

      if (updateData.stock !== undefined) {
        const stockNum = Number(updateData.stock);
        if (isNaN(stockNum)) throw new TypeError('stock must be a valid number');
        updateData.stock = stockNum;
      }

      if (updateData.orderLimit !== undefined) {
        const orderLimitNum = Number(updateData.orderLimit);
        if (isNaN(orderLimitNum)) throw new TypeError('orderLimit must be a valid number');
        updateData.orderLimit = orderLimitNum;
      }

      // Check for duplicate if color or warranty is being changed
      if (updateData.color || updateData.warranty !== undefined) {
        const duplicateQuery = {
          _id: { $ne: variantId }, // Exclude current variant
          product: existingVariant.product,
          seller: sellerId,
          color: updateData.color || existingVariant.color,
        };

        // Handle warranty: if explicitly set to null/undefined, check for variants without warranty
        if (updateData.warranty !== undefined) {
          if (updateData.warranty) {
            duplicateQuery.warranty = updateData.warranty;
          } else {
            duplicateQuery.warranty = { $exists: false };
          }
        } else {
          // Not changing warranty, use existing value
          if (existingVariant.warranty) {
            duplicateQuery.warranty = existingVariant.warranty;
          } else {
            duplicateQuery.warranty = { $exists: false };
          }
        }

        const duplicate = await Variant.findOne(duplicateQuery);
        if (duplicate) {
          throw new Error('variant with this color and warranty combination already exists');
        }
      }

      // Handle originalPrice logic: if discountPercent is provided, set originalPrice to current price
      if (updateData.discountPercent !== undefined && updateData.discountPercent !== null) {
        updateData.originalPrice = updateData.price || existingVariant.price;
      } else if (updateData.discountPercent === null || updateData.discountPercent === 0) {
        updateData.originalPrice = null;
      }

      // Map flat shipment methods to nested structure if provided
      if (
        updateData.shipMarket !== undefined ||
        updateData.shipSeller !== undefined ||
        updateData.threeHour !== undefined ||
        updateData.warehouseDelivery !== undefined ||
        updateData.buyerDelivery !== undefined ||
        updateData.timeRange !== undefined
      ) {
        updateData.shipmentMethods = {
          shipMarket: updateData.shipMarket ?? existingVariant.shipmentMethods?.shipMarket ?? false,
          shipSeller: updateData.shipSeller ?? existingVariant.shipmentMethods?.shipSeller ?? false,
          threeHour: updateData.threeHour ?? existingVariant.shipmentMethods?.threeHour ?? false,
          warehouseDelivery:
            updateData.warehouseDelivery ?? existingVariant.shipmentMethods?.warehouseDelivery ?? null,
          buyerDelivery: updateData.buyerDelivery ?? existingVariant.shipmentMethods?.buyerDelivery ?? null,
          timeRange: updateData.timeRange ?? existingVariant.shipmentMethods?.timeRange ?? null,
        };

        // Remove flat fields
        delete updateData.shipMarket;
        delete updateData.shipSeller;
        delete updateData.threeHour;
        delete updateData.warehouseDelivery;
        delete updateData.buyerDelivery;
        delete updateData.timeRange;
      }

      // Update variant
      const variant = await Variant.findOneAndUpdate(
        { _id: variantId, seller: sellerId },
        { $set: updateData },
        { new: true, runValidators: true },
      )
        .populate('product', 'titleFa titleEn referencePrice')
        .populate('color', 'name hexCode')
        .populate('warranty', 'name duration')
        .lean();

      return {
        success: true,
        data: variant,
      };
    } catch (error) {
      throw new Error(`خطا در به‌روزرسانی variant: ${error.message}`);
    }
  }
}

module.exports = new VariantService();
