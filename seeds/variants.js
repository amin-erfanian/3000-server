/**
 * Seed Variants
 * Run: node seeds/variants.js
 *
 * Creates ~100 variants distributed across products
 * Must run AFTER: categories, colors, warranties, brands, sellers, products
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Variant = require('../models/variant');
const Product = require('../models/product');
const Seller = require('../models/seller');
const Color = require('../models/color');
const Warranty = require('../models/warranty');

const forceReseed = process.argv.includes('--force');

// Use same connection as main app
const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

// Variant definitions: productSlug -> array of variant configs
// Distribution: some products have 1 variant, some have many (for testing)
const VARIANT_CONFIGS = [
  // ==================== MOBILE PHONES ====================
  // iPhone 15 Pro Max - 8 variants (popular, multiple sellers & colors)
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'DK001',
    colorTitle: 'تیتانیوم',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 89900000,
    originalPrice: 94900000,
    stock: 15,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 88500000,
    originalPrice: 94900000,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'DK001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 89000000,
    originalPrice: 94900000,
    stock: 5,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'AP001',
    colorTitle: 'تیتانیوم',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 92500000,
    originalPrice: null,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'AP001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 93000000,
    originalPrice: null,
    stock: 6,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'MS001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 85000000,
    originalPrice: 89000000,
    stock: 3,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'MS001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 86000000,
    originalPrice: null,
    stock: 0,
    status: 'out_of_stock',
  },
  {
    productSlug: 'apple-iphone-15-pro-max-256gb',
    sellerCode: 'NW001',
    colorTitle: 'مشکی',
    warrantyTitle: 'بدون گارانتی',
    price: 82000000,
    originalPrice: null,
    stock: 2,
    status: 'pending',
  },

  // iPhone 15 - 4 variants
  {
    productSlug: 'apple-iphone-15-128gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 54900000,
    originalPrice: 58000000,
    stock: 20,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-128gb',
    sellerCode: 'DK001',
    colorTitle: 'صورتی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 55500000,
    originalPrice: 58000000,
    stock: 10,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-128gb',
    sellerCode: 'AP001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 57000000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'apple-iphone-15-128gb',
    sellerCode: 'MS001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 52000000,
    originalPrice: null,
    stock: 5,
    status: 'marketable',
  },

  // Galaxy S24 Ultra - 6 variants
  {
    productSlug: 'samsung-galaxy-s24-ultra-256gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 79900000,
    originalPrice: 84000000,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-s24-ultra-256gb',
    sellerCode: 'DK001',
    colorTitle: 'بنفش',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 80500000,
    originalPrice: 84000000,
    stock: 7,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-s24-ultra-256gb',
    sellerCode: 'SM001',
    colorTitle: 'تیتانیوم',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 82000000,
    originalPrice: null,
    stock: 15,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-s24-ultra-256gb',
    sellerCode: 'SM001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 81500000,
    originalPrice: null,
    stock: 9,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-s24-ultra-256gb',
    sellerCode: 'MS001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 76000000,
    originalPrice: 80000000,
    stock: 4,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-s24-ultra-256gb',
    sellerCode: 'MS001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 77000000,
    originalPrice: null,
    stock: 0,
    status: 'out_of_stock',
  },

  // Galaxy A54 - 3 variants
  {
    productSlug: 'samsung-galaxy-a54-128gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 16500000,
    originalPrice: 18000000,
    stock: 30,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-a54-128gb',
    sellerCode: 'DK001',
    colorTitle: 'سبز',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 16800000,
    originalPrice: 18000000,
    stock: 18,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-a54-128gb',
    sellerCode: 'SM001',
    colorTitle: 'بنفش',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 15500000,
    originalPrice: null,
    stock: 12,
    status: 'marketable',
  },

  // Redmi Note 13 Pro - 4 variants
  {
    productSlug: 'xiaomi-redmi-note-13-pro-256gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 14900000,
    originalPrice: 16500000,
    stock: 25,
    status: 'marketable',
  },
  {
    productSlug: 'xiaomi-redmi-note-13-pro-256gb',
    sellerCode: 'DK001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 15200000,
    originalPrice: 16500000,
    stock: 15,
    status: 'marketable',
  },
  {
    productSlug: 'xiaomi-redmi-note-13-pro-256gb',
    sellerCode: 'MS001',
    colorTitle: 'بنفش',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 13800000,
    originalPrice: null,
    stock: 20,
    status: 'marketable',
  },
  {
    productSlug: 'xiaomi-redmi-note-13-pro-256gb',
    sellerCode: 'MS001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 14000000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },

  // Poco X6 Pro - 3 variants
  {
    productSlug: 'xiaomi-poco-x6-pro-256gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 18500000,
    originalPrice: 20000000,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'xiaomi-poco-x6-pro-256gb',
    sellerCode: 'DK001',
    colorTitle: 'زرد',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 18800000,
    originalPrice: 20000000,
    stock: 6,
    status: 'marketable',
  },
  {
    productSlug: 'xiaomi-poco-x6-pro-256gb',
    sellerCode: 'MS001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 17500000,
    originalPrice: null,
    stock: 10,
    status: 'marketable',
  },

  // Huawei Nova 12 Pro - 2 variants
  {
    productSlug: 'huawei-nova-12-pro-256gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 28000000,
    originalPrice: 30000000,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'huawei-nova-12-pro-256gb',
    sellerCode: 'MS001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۶ ماهه',
    price: 26500000,
    originalPrice: null,
    stock: 3,
    status: 'marketable',
  },

  // Galaxy Z Fold5 - 3 variants (expensive, fewer variants)
  {
    productSlug: 'samsung-galaxy-z-fold5-256gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 95000000,
    originalPrice: 105000000,
    stock: 5,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-z-fold5-256gb',
    sellerCode: 'SM001',
    colorTitle: 'کرم',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 98000000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-z-fold5-256gb',
    sellerCode: 'SM001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 99000000,
    originalPrice: null,
    stock: 3,
    status: 'marketable',
  },

  // ==================== LAPTOPS ====================
  // ROG Strix G16 - 3 variants
  {
    productSlug: 'asus-rog-strix-g16-i9-32gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 125000000,
    originalPrice: 135000000,
    stock: 4,
    status: 'marketable',
  },
  {
    productSlug: 'asus-rog-strix-g16-i9-32gb',
    sellerCode: 'TE001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 122000000,
    originalPrice: null,
    stock: 6,
    status: 'marketable',
  },
  {
    productSlug: 'asus-rog-strix-g16-i9-32gb',
    sellerCode: 'GA001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 118000000,
    originalPrice: 125000000,
    stock: 2,
    status: 'marketable',
  },

  // VivoBook 15 - 4 variants
  {
    productSlug: 'asus-vivobook-15-i5-8gb',
    sellerCode: 'DK001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 32000000,
    originalPrice: 35000000,
    stock: 15,
    status: 'marketable',
  },
  {
    productSlug: 'asus-vivobook-15-i5-8gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 31500000,
    originalPrice: 35000000,
    stock: 20,
    status: 'marketable',
  },
  {
    productSlug: 'asus-vivobook-15-i5-8gb',
    sellerCode: 'TE001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 30000000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'asus-vivobook-15-i5-8gb',
    sellerCode: 'TE001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 31000000,
    originalPrice: null,
    stock: 5,
    status: 'marketable',
  },

  // ThinkPad X1 Carbon - 2 variants
  {
    productSlug: 'lenovo-thinkpad-x1-carbon-i7-16gb',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۳۶ ماهه',
    price: 85000000,
    originalPrice: 92000000,
    stock: 6,
    status: 'marketable',
  },
  {
    productSlug: 'lenovo-thinkpad-x1-carbon-i7-16gb',
    sellerCode: 'TE001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 82000000,
    originalPrice: null,
    stock: 4,
    status: 'marketable',
  },

  // MacBook Air M3 - 5 variants (popular)
  {
    productSlug: 'apple-macbook-air-m3-8gb-256gb',
    sellerCode: 'DK001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 72000000,
    originalPrice: 78000000,
    stock: 10,
    status: 'marketable',
  },
  {
    productSlug: 'apple-macbook-air-m3-8gb-256gb',
    sellerCode: 'DK001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 72500000,
    originalPrice: 78000000,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'apple-macbook-air-m3-8gb-256gb',
    sellerCode: 'AP001',
    colorTitle: 'طلایی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 75000000,
    originalPrice: null,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'apple-macbook-air-m3-8gb-256gb',
    sellerCode: 'AP001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 74500000,
    originalPrice: null,
    stock: 6,
    status: 'marketable',
  },
  {
    productSlug: 'apple-macbook-air-m3-8gb-256gb',
    sellerCode: 'TE001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 69000000,
    originalPrice: 72000000,
    stock: 3,
    status: 'marketable',
  },

  // HP Pavilion 15 - 3 variants
  {
    productSlug: 'hp-pavilion-15-ryzen5-8gb',
    sellerCode: 'DK001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 28000000,
    originalPrice: 32000000,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'hp-pavilion-15-ryzen5-8gb',
    sellerCode: 'TE001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 26500000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'hp-pavilion-15-ryzen5-8gb',
    sellerCode: 'TE001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 27000000,
    originalPrice: null,
    stock: 5,
    status: 'marketable',
  },

  // Dell XPS 15 - 2 variants
  {
    productSlug: 'dell-xps-15-i7-16gb',
    sellerCode: 'DK001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 95000000,
    originalPrice: 105000000,
    stock: 4,
    status: 'marketable',
  },
  {
    productSlug: 'dell-xps-15-i7-16gb',
    sellerCode: 'TE001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 92000000,
    originalPrice: null,
    stock: 3,
    status: 'marketable',
  },

  // ==================== HEADPHONES ====================
  // AirPods Pro 2 - 3 variants
  {
    productSlug: 'apple-airpods-pro-2',
    sellerCode: 'DK001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 12500000,
    originalPrice: 14000000,
    stock: 30,
    status: 'marketable',
  },
  {
    productSlug: 'apple-airpods-pro-2',
    sellerCode: 'AP001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 13500000,
    originalPrice: null,
    stock: 25,
    status: 'marketable',
  },
  {
    productSlug: 'apple-airpods-pro-2',
    sellerCode: 'MS001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 11800000,
    originalPrice: null,
    stock: 15,
    status: 'marketable',
  },

  // Galaxy Buds2 Pro - 4 variants
  {
    productSlug: 'samsung-galaxy-buds2-pro',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 7500000,
    originalPrice: 8500000,
    stock: 20,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-buds2-pro',
    sellerCode: 'DK001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 7600000,
    originalPrice: 8500000,
    stock: 15,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-buds2-pro',
    sellerCode: 'SM001',
    colorTitle: 'بنفش',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 7000000,
    originalPrice: null,
    stock: 18,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-buds2-pro',
    sellerCode: 'MS001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۶ ماهه',
    price: 6500000,
    originalPrice: 7000000,
    stock: 10,
    status: 'marketable',
  },

  // Sony WH-1000XM5 - 3 variants
  {
    productSlug: 'sony-wh-1000xm5',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 18500000,
    originalPrice: 21000000,
    stock: 10,
    status: 'marketable',
  },
  {
    productSlug: 'sony-wh-1000xm5',
    sellerCode: 'DK001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 18800000,
    originalPrice: 21000000,
    stock: 7,
    status: 'marketable',
  },
  {
    productSlug: 'sony-wh-1000xm5',
    sellerCode: 'GA001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 17000000,
    originalPrice: null,
    stock: 5,
    status: 'marketable',
  },

  // JBL Tune 770NC - 3 variants
  {
    productSlug: 'jbl-tune-770nc',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 4500000,
    originalPrice: 5200000,
    stock: 25,
    status: 'marketable',
  },
  {
    productSlug: 'jbl-tune-770nc',
    sellerCode: 'DK001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 4600000,
    originalPrice: 5200000,
    stock: 18,
    status: 'marketable',
  },
  {
    productSlug: 'jbl-tune-770nc',
    sellerCode: 'GA001',
    colorTitle: 'سفید',
    warrantyTitle: 'گارانتی ۶ ماهه',
    price: 4200000,
    originalPrice: null,
    stock: 12,
    status: 'marketable',
  },

  // ==================== SMART WATCHES ====================
  // Apple Watch Series 9 - 4 variants
  {
    productSlug: 'apple-watch-series-9-45mm',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 24000000,
    originalPrice: 27000000,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'apple-watch-series-9-45mm',
    sellerCode: 'DK001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 24500000,
    originalPrice: 27000000,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'apple-watch-series-9-45mm',
    sellerCode: 'AP001',
    colorTitle: 'رزگلد',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 26000000,
    originalPrice: null,
    stock: 10,
    status: 'marketable',
  },
  {
    productSlug: 'apple-watch-series-9-45mm',
    sellerCode: 'MS001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 22500000,
    originalPrice: null,
    stock: 5,
    status: 'marketable',
  },

  // Galaxy Watch6 Classic - 3 variants
  {
    productSlug: 'samsung-galaxy-watch6-classic-47mm',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 16500000,
    originalPrice: 18500000,
    stock: 10,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-watch6-classic-47mm',
    sellerCode: 'SM001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 15500000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-watch6-classic-47mm',
    sellerCode: 'MS001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۶ ماهه',
    price: 14500000,
    originalPrice: 16000000,
    stock: 4,
    status: 'marketable',
  },

  // Xiaomi Watch S3 - 2 variants
  {
    productSlug: 'xiaomi-watch-s3',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 6500000,
    originalPrice: 7500000,
    stock: 20,
    status: 'marketable',
  },
  {
    productSlug: 'xiaomi-watch-s3',
    sellerCode: 'MS001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۶ ماهه',
    price: 5800000,
    originalPrice: null,
    stock: 15,
    status: 'marketable',
  },

  // ==================== TABLETS ====================
  // iPad Pro 12.9 - 3 variants
  {
    productSlug: 'apple-ipad-pro-12-9-m2-256gb',
    sellerCode: 'DK001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 72000000,
    originalPrice: 78000000,
    stock: 6,
    status: 'marketable',
  },
  {
    productSlug: 'apple-ipad-pro-12-9-m2-256gb',
    sellerCode: 'AP001',
    colorTitle: 'نقره‌ای',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 75000000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'apple-ipad-pro-12-9-m2-256gb',
    sellerCode: 'TE001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 68000000,
    originalPrice: 72000000,
    stock: 3,
    status: 'marketable',
  },

  // Galaxy Tab S9 Ultra - 2 variants
  {
    productSlug: 'samsung-galaxy-tab-s9-ultra-256gb',
    sellerCode: 'DK001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 65000000,
    originalPrice: 72000000,
    stock: 5,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-galaxy-tab-s9-ultra-256gb',
    sellerCode: 'SM001',
    colorTitle: 'بژ',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 62000000,
    originalPrice: null,
    stock: 4,
    status: 'marketable',
  },

  // iPad Air 5 - 3 variants
  {
    productSlug: 'apple-ipad-air-5-64gb',
    sellerCode: 'DK001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 32000000,
    originalPrice: 36000000,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'apple-ipad-air-5-64gb',
    sellerCode: 'DK001',
    colorTitle: 'صورتی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 32500000,
    originalPrice: 36000000,
    stock: 8,
    status: 'marketable',
  },
  {
    productSlug: 'apple-ipad-air-5-64gb',
    sellerCode: 'AP001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 34000000,
    originalPrice: null,
    stock: 10,
    status: 'marketable',
  },

  // ==================== TVs ====================
  // Samsung QN90C - 2 variants
  {
    productSlug: 'samsung-tv-55-qn90c',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 75000000,
    originalPrice: 85000000,
    stock: 4,
    status: 'marketable',
  },
  {
    productSlug: 'samsung-tv-55-qn90c',
    sellerCode: 'HA001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 72000000,
    originalPrice: null,
    stock: 6,
    status: 'marketable',
  },

  // LG OLED C3 - 2 variants
  {
    productSlug: 'lg-oled-65-c3',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۲۴ ماهه شرکتی',
    price: 95000000,
    originalPrice: 110000000,
    stock: 3,
    status: 'marketable',
  },
  {
    productSlug: 'lg-oled-65-c3',
    sellerCode: 'HA001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۸ ماهه شرکتی',
    price: 90000000,
    originalPrice: 98000000,
    stock: 2,
    status: 'marketable',
  },

  // ==================== SPEAKERS ====================
  // JBL Flip 6 - 4 variants (different colors)
  {
    productSlug: 'jbl-flip-6',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 5500000,
    originalPrice: 6500000,
    stock: 20,
    status: 'marketable',
  },
  {
    productSlug: 'jbl-flip-6',
    sellerCode: 'DK001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 5600000,
    originalPrice: 6500000,
    stock: 15,
    status: 'marketable',
  },
  {
    productSlug: 'jbl-flip-6',
    sellerCode: 'DK001',
    colorTitle: 'قرمز',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 5600000,
    originalPrice: 6500000,
    stock: 12,
    status: 'marketable',
  },
  {
    productSlug: 'jbl-flip-6',
    sellerCode: 'GA001',
    colorTitle: 'سبز',
    warrantyTitle: 'گارانتی ۶ ماهه',
    price: 5000000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
  },

  // Sony SRS-XB33 - 2 variants
  {
    productSlug: 'sony-srs-xb33',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'گارانتی ۱۲ ماهه',
    price: 7500000,
    originalPrice: 8500000,
    stock: 10,
    status: 'marketable',
  },
  {
    productSlug: 'sony-srs-xb33',
    sellerCode: 'GA001',
    colorTitle: 'آبی',
    warrantyTitle: 'گارانتی ۶ ماهه',
    price: 7000000,
    originalPrice: null,
    stock: 6,
    status: 'marketable',
  },

  // ==================== SPORTS/FASHION ====================
  // Nike Air Max 270 - 4 variants (different sizes represented as colors for demo)
  {
    productSlug: 'nike-air-max-270-men',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'بدون گارانتی',
    price: 8500000,
    originalPrice: 9500000,
    stock: 15,
    status: 'marketable',
    size: '42',
  },
  {
    productSlug: 'nike-air-max-270-men',
    sellerCode: 'DK001',
    colorTitle: 'سفید',
    warrantyTitle: 'بدون گارانتی',
    price: 8500000,
    originalPrice: 9500000,
    stock: 12,
    status: 'marketable',
    size: '43',
  },
  {
    productSlug: 'nike-air-max-270-men',
    sellerCode: 'SP001',
    colorTitle: 'قرمز',
    warrantyTitle: 'بدون گارانتی',
    price: 8000000,
    originalPrice: null,
    stock: 8,
    status: 'marketable',
    size: '44',
  },
  {
    productSlug: 'nike-air-max-270-men',
    sellerCode: 'SP001',
    colorTitle: 'آبی',
    warrantyTitle: 'بدون گارانتی',
    price: 8200000,
    originalPrice: null,
    stock: 10,
    status: 'marketable',
    size: '41',
  },

  // Adidas Ultraboost 23 - 3 variants
  {
    productSlug: 'adidas-ultraboost-23-men',
    sellerCode: 'DK001',
    colorTitle: 'مشکی',
    warrantyTitle: 'بدون گارانتی',
    price: 9500000,
    originalPrice: 11000000,
    stock: 10,
    status: 'marketable',
    size: '42',
  },
  {
    productSlug: 'adidas-ultraboost-23-men',
    sellerCode: 'DK001',
    colorTitle: 'سفید',
    warrantyTitle: 'بدون گارانتی',
    price: 9800000,
    originalPrice: 11000000,
    stock: 8,
    status: 'marketable',
    size: '43',
  },
  {
    productSlug: 'adidas-ultraboost-23-men',
    sellerCode: 'SP001',
    colorTitle: 'خاکستری',
    warrantyTitle: 'بدون گارانتی',
    price: 9000000,
    originalPrice: null,
    stock: 6,
    status: 'marketable',
    size: '44',
  },
];

async function seedVariants() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const existingCount = await Variant.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Variants already exist (${existingCount} found)`);
      console.log('   Run with --force to re-seed\n');
      return;
    }

    if (forceReseed && existingCount > 0) {
      await Variant.deleteMany({});
      console.log(`🗑️  Cleared ${existingCount} existing variants\n`);
    }

    console.log('🏷️  Seeding variants...\n');

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const config of VARIANT_CONFIGS) {
      try {
        // Find references
        const product = await Product.findOne({ slug: config.productSlug });
        const seller = await Seller.findOne({ code: config.sellerCode });
        const color = await Color.findOne({ title: config.colorTitle });
        const warranty = await Warranty.findOne({ titleFa: config.warrantyTitle });

        if (!product) {
          console.log(`⚠️  Product not found: ${config.productSlug}`);
          errorCount++;
          continue;
        }
        if (!seller) {
          console.log(`⚠️  Seller not found: ${config.sellerCode}`);
          errorCount++;
          continue;
        }

        // Generate SKU
        const sku = `${config.productSlug}-${config.sellerCode}-${config.colorTitle}`.substring(0, 50);

        // Check if already exists
        const existing = await Variant.findOne({
          product: product._id,
          seller: seller._id,
          color: color?._id,
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        // Calculate discount percent
        let discountPercent = 0;
        if (config.originalPrice && config.originalPrice > config.price) {
          discountPercent = Math.round(((config.originalPrice - config.price) / config.originalPrice) * 100);
        }

        await Variant.create({
          product: product._id,
          seller: seller._id,
          color: color?._id || null,
          warranty: warranty?._id || null,
          sku,
          size: config.size || '',
          price: config.price,
          originalPrice: config.originalPrice,
          discountPercent,
          stock: config.stock,
          status: config.status,
        });

        insertedCount++;
        console.log(
          `✓ ${config.productSlug.substring(0, 30)}... | ${config.sellerCode} | ${config.colorTitle}`,
        );
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    const totalCount = await Variant.countDocuments();
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`✅ Done!`);
    console.log(`   Inserted: ${insertedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`📊 Total variants: ${totalCount}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { VARIANT_CONFIGS, seedVariants };

if (require.main === module) {
  seedVariants();
}
