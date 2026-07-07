// services/sellerProduct.service.js
const mongoose = require('mongoose');
const SellerProduct = require('../models/seller-product');
const Product = require('../models/Product');

class SellerProductService {
  /**
   * افزودن محصول به لیست فروشنده (از کاتالوگ)
   */
  async addProductToSeller(sellerId, productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        throw new Error('شناسه فروشنده نامعتبر است');
      }

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('شناسه محصول نامعتبر است');
      }

      const product = await Product.findById(productId).lean();

      if (!product) {
        throw new Error('محصول در کاتالوگ یافت نشد');
      }

      if (product.status !== 'approved') {
        throw new Error('وضعیت محصول تایید نشده است');
      }

      if (product.marketStatus !== 'marketable') {
        throw new Error('محصول قابل فروش نیست');
      }

      // بررسی تکراری نبودن
      const existing = await SellerProduct.findOne({
        seller: sellerId,
        product: productId,
      }).lean();

      if (existing) {
        throw new Error('این محصول قبلاً به لیست شما اضافه شده است');
      }

      // ایجاد رکورد SellerProduct با وضعیت برابر با وضعیت محصول
      const sellerProduct = new SellerProduct({
        seller: sellerId,
        product: productId,
      });

      await sellerProduct.save();

      // Populate برای برگرداندن اطلاعات کامل
      await sellerProduct.populate([
        { path: 'product', select: 'titleFa titleEn images category brand status marketStatus' },
      ]);

      return {
        success: true,
        data: sellerProduct,
        message: 'محصول با موفقیت به لیست شما اضافه شد. اکنون می‌توانید واریانت‌های آن را تعریف کنید.',
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('این محصول قبلاً به لیست شما اضافه شده است');
      }
      throw new Error(`خطا در افزودن محصول: ${error.message}`);
    }
  }

  /**
   * دریافت لیست محصولات فروشنده
   */
  async getSellerProducts(sellerId, filters = {}, pagination = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        throw new Error('شناسه فروشنده نامعتبر است');
      }

      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;

      const query = { seller: sellerId, ...filters };

      const [sellerProducts, total] = await Promise.all([
        SellerProduct.find(query)
          .populate({
            path: 'product',
            select: 'titleFa titleEn images category brand',
            populate: [
              { path: 'category', select: 'titleFa titleEn' },
              { path: 'brand', select: 'titleFa titleEn logo' },
            ],
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        SellerProduct.countDocuments(query),
      ]);

      // محاسبه تعداد واریانت‌ها برای هر محصول
      const Variant = require('../models/Variant');
      const sellerProductIds = sellerProducts.map((sp) => sp._id);

      const variantCounts = await Variant.aggregate([
        { $match: { sellerProduct: { $in: sellerProductIds } } },
        {
          $group: {
            _id: '$sellerProduct',
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          },
        },
      ]);

      const variantCountMap = variantCounts.reduce((acc, item) => {
        acc[item._id.toString()] = item;
        return acc;
      }, {});

      // اضافه کردن تعداد واریانت‌ها به نتیجه
      const enrichedData = sellerProducts.map((sp) => ({
        ...sp,
        variantStats: variantCountMap[sp._id.toString()] || {
          total: 0,
          active: 0,
          pending: 0,
          rejected: 0,
        },
      }));

      return {
        success: true,
        data: enrichedData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`خطا در دریافت محصولات فروشنده: ${error.message}`);
    }
  }

  /**
   * دریافت یک SellerProduct با ID
   */
  async getSellerProductById(sellerProductId, sellerId = null) {
    try {
      if (!mongoose.Types.ObjectId.isValid(sellerProductId)) {
        throw new Error('شناسه نامعتبر است');
      }

      const query = { _id: sellerProductId };
      if (sellerId) {
        query.seller = sellerId;
      }

      const sellerProduct = await SellerProduct.findOne(query)
        .populate({
          path: 'product',
          populate: [
            { path: 'category', select: 'titleFa titleEn' },
            { path: 'brand', select: 'titleFa titleEn logo' },
          ],
        })
        .lean();

      if (!sellerProduct) {
        throw new Error('محصول یافت نشد');
      }

      return {
        success: true,
        data: sellerProduct,
      };
    } catch (error) {
      throw new Error(`خطا در دریافت محصول: ${error.message}`);
    }
  }

  /**
   * حذف محصول از لیست فروشنده
   */
  async removeProductFromSeller(sellerProductId, sellerId) {
    try {
      const Variant = require('../models/Variant');

      // بررسی وجود واریانت‌های فعال
      const activeVariants = await Variant.countDocuments({
        sellerProduct: sellerProductId,
        status: 'active',
      });

      if (activeVariants > 0) {
        throw new Error('نمی‌توانید محصولی با واریانت‌های فعال را حذف کنید. ابتدا آن‌ها را غیرفعال کنید.');
      }

      const result = await SellerProduct.findOneAndDelete({
        _id: sellerProductId,
        seller: sellerId,
      });

      if (!result) {
        throw new Error('محصول یافت نشد');
      }

      // حذف تمام واریانت‌های مرتبط
      await Variant.deleteMany({ sellerProduct: sellerProductId });

      return {
        success: true,
        message: 'محصول با موفقیت حذف شد',
      };
    } catch (error) {
      throw new Error(`خطا در حذف محصول: ${error.message}`);
    }
  }
}

module.exports = new SellerProductService();
