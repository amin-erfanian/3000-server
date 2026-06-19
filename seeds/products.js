/**
 * Seed Products
 * Run: node seeds/products.js
 *
 * 30 products distributed across categories and brands
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/category');
const Brand = require('../models/brand');

const forceReseed = process.argv.includes('--force');

// Use same connection as main app
const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

// Product definitions with category slug and brand slug references
const PRODUCTS = [
  // ==================== MOBILE PHONES (8) ====================
  {
    titleFa: 'گوشی موبایل اپل مدل iPhone 15 Pro Max ظرفیت 256 گیگابایت',
    titleEn: 'Apple iPhone 15 Pro Max 256GB',
    slug: 'apple-iphone-15-pro-max-256gb',
    description:
      'آیفون 15 پرو مکس، پرچمدار جدید اپل با تراشه A17 Pro و دوربین 48 مگاپیکسلی. طراحی تیتانیومی و نمایشگر Super Retina XDR.',
    categorySlug: 'mobile-phone',
    brandSlug: 'apple',
    images: {
      main: { url: '/images/products/iphone-15-pro-max.jpg', alt: 'iPhone 15 Pro Max' },
      gallery: [],
    },
    rating: { average: 4.8, count: 1250 },
    status: 'active',
  },
  {
    titleFa: 'گوشی موبایل اپل مدل iPhone 15 ظرفیت 128 گیگابایت',
    titleEn: 'Apple iPhone 15 128GB',
    slug: 'apple-iphone-15-128gb',
    description: 'آیفون 15 با طراحی جدید و Dynamic Island. دوربین 48 مگاپیکسلی و تراشه A16 Bionic.',
    categorySlug: 'mobile-phone',
    brandSlug: 'apple',
    images: { main: { url: '/images/products/iphone-15.jpg', alt: 'iPhone 15' }, gallery: [] },
    rating: { average: 4.6, count: 890 },
    status: 'active',
  },
  {
    titleFa: 'گوشی موبایل سامسونگ مدل Galaxy S24 Ultra ظرفیت 256 گیگابایت',
    titleEn: 'Samsung Galaxy S24 Ultra 256GB',
    slug: 'samsung-galaxy-s24-ultra-256gb',
    description: 'گلکسی S24 اولترا با قابلیت‌های هوش مصنوعی Galaxy AI، دوربین 200 مگاپیکسلی و قلم S Pen.',
    categorySlug: 'mobile-phone',
    brandSlug: 'samsung',
    images: { main: { url: '/images/products/galaxy-s24-ultra.jpg', alt: 'Galaxy S24 Ultra' }, gallery: [] },
    rating: { average: 4.7, count: 980 },
    status: 'active',
  },
  {
    titleFa: 'گوشی موبایل سامسونگ مدل Galaxy A54 ظرفیت 128 گیگابایت',
    titleEn: 'Samsung Galaxy A54 128GB',
    slug: 'samsung-galaxy-a54-128gb',
    description: 'گلکسی A54 5G با نمایشگر Super AMOLED و باتری 5000 میلی‌آمپری.',
    categorySlug: 'mobile-phone',
    brandSlug: 'samsung',
    images: { main: { url: '/images/products/galaxy-a54.jpg', alt: 'Galaxy A54' }, gallery: [] },
    rating: { average: 4.4, count: 650 },
    status: 'active',
  },
  {
    titleFa: 'گوشی موبایل شیائومی مدل Redmi Note 13 Pro ظرفیت 256 گیگابایت',
    titleEn: 'Xiaomi Redmi Note 13 Pro 256GB',
    slug: 'xiaomi-redmi-note-13-pro-256gb',
    description: 'ردمی نوت 13 پرو با دوربین 200 مگاپیکسلی و شارژ سریع 67 واتی.',
    categorySlug: 'mobile-phone',
    brandSlug: 'xiaomi',
    images: {
      main: { url: '/images/products/redmi-note-13-pro.jpg', alt: 'Redmi Note 13 Pro' },
      gallery: [],
    },
    rating: { average: 4.5, count: 420 },
    status: 'active',
  },
  {
    titleFa: 'گوشی موبایل شیائومی مدل Poco X6 Pro ظرفیت 256 گیگابایت',
    titleEn: 'Xiaomi Poco X6 Pro 256GB',
    slug: 'xiaomi-poco-x6-pro-256gb',
    description: 'پوکو X6 پرو با تراشه Dimensity 8300 Ultra و نمایشگر 120Hz AMOLED.',
    categorySlug: 'mobile-phone',
    brandSlug: 'xiaomi',
    images: { main: { url: '/images/products/poco-x6-pro.jpg', alt: 'Poco X6 Pro' }, gallery: [] },
    rating: { average: 4.3, count: 280 },
    status: 'active',
  },
  {
    titleFa: 'گوشی موبایل هواوی مدل Nova 12 Pro ظرفیت 256 گیگابایت',
    titleEn: 'Huawei Nova 12 Pro 256GB',
    slug: 'huawei-nova-12-pro-256gb',
    description: 'هواوی نوا 12 پرو با دوربین سلفی 60 مگاپیکسلی و شارژ سریع 100 واتی.',
    categorySlug: 'mobile-phone',
    brandSlug: 'huawei',
    images: { main: { url: '/images/products/nova-12-pro.jpg', alt: 'Nova 12 Pro' }, gallery: [] },
    rating: { average: 4.2, count: 150 },
    status: 'active',
  },
  {
    titleFa: 'گوشی موبایل سامسونگ مدل Galaxy Z Fold5 ظرفیت 256 گیگابایت',
    titleEn: 'Samsung Galaxy Z Fold5 256GB',
    slug: 'samsung-galaxy-z-fold5-256gb',
    description: 'گلکسی زد فولد 5 تاشو با نمایشگر 7.6 اینچی و پردازنده Snapdragon 8 Gen 2.',
    categorySlug: 'mobile-phone',
    brandSlug: 'samsung',
    images: { main: { url: '/images/products/galaxy-z-fold5.jpg', alt: 'Galaxy Z Fold5' }, gallery: [] },
    rating: { average: 4.6, count: 320 },
    status: 'active',
  },

  // ==================== LAPTOPS (6) ====================
  {
    titleFa: 'لپ تاپ ایسوس مدل ROG Strix G16 پردازنده Core i9 رم 32 گیگابایت',
    titleEn: 'ASUS ROG Strix G16 Core i9 32GB',
    slug: 'asus-rog-strix-g16-i9-32gb',
    description: 'لپ تاپ گیمینگ قدرتمند با پردازنده نسل 14 اینتل و کارت گرافیک RTX 4070.',
    categorySlug: 'laptop-gaming',
    brandSlug: 'asus',
    images: { main: { url: '/images/products/rog-strix-g16.jpg', alt: 'ROG Strix G16' }, gallery: [] },
    rating: { average: 4.7, count: 180 },
    status: 'active',
  },
  {
    titleFa: 'لپ تاپ ایسوس مدل VivoBook 15 پردازنده Core i5 رم 8 گیگابایت',
    titleEn: 'ASUS VivoBook 15 Core i5 8GB',
    slug: 'asus-vivobook-15-i5-8gb',
    description: 'لپ تاپ سبک و همه‌کاره برای کارهای روزمره و دانشجویی.',
    categorySlug: 'laptop-asus',
    brandSlug: 'asus',
    images: { main: { url: '/images/products/vivobook-15.jpg', alt: 'VivoBook 15' }, gallery: [] },
    rating: { average: 4.3, count: 450 },
    status: 'active',
  },
  {
    titleFa: 'لپ تاپ لنوو مدل ThinkPad X1 Carbon پردازنده Core i7 رم 16 گیگابایت',
    titleEn: 'Lenovo ThinkPad X1 Carbon Core i7 16GB',
    slug: 'lenovo-thinkpad-x1-carbon-i7-16gb',
    description: 'لپ تاپ بیزینسی حرفه‌ای با کیبورد عالی و طراحی سبک.',
    categorySlug: 'lenovo-thinkpad',
    brandSlug: 'lenovo',
    images: { main: { url: '/images/products/thinkpad-x1.jpg', alt: 'ThinkPad X1 Carbon' }, gallery: [] },
    rating: { average: 4.8, count: 290 },
    status: 'active',
  },
  {
    titleFa: 'لپ تاپ اپل مدل MacBook Air M3 رم 8 گیگابایت حافظه 256 گیگابایت',
    titleEn: 'Apple MacBook Air M3 8GB 256GB',
    slug: 'apple-macbook-air-m3-8gb-256gb',
    description: 'مک‌بوک ایر جدید با تراشه M3 اپل، نمایشگر Liquid Retina و عمر باتری 18 ساعته.',
    categorySlug: 'macbook-air',
    brandSlug: 'apple',
    images: { main: { url: '/images/products/macbook-air-m3.jpg', alt: 'MacBook Air M3' }, gallery: [] },
    rating: { average: 4.9, count: 560 },
    status: 'active',
  },
  {
    titleFa: 'لپ تاپ اچ پی مدل Pavilion 15 پردازنده Ryzen 5 رم 8 گیگابایت',
    titleEn: 'HP Pavilion 15 Ryzen 5 8GB',
    slug: 'hp-pavilion-15-ryzen5-8gb',
    description: 'لپ تاپ مناسب برای کار و تفریح با پردازنده AMD Ryzen 5.',
    categorySlug: 'laptop-hp',
    brandSlug: 'hp',
    images: { main: { url: '/images/products/hp-pavilion-15.jpg', alt: 'HP Pavilion 15' }, gallery: [] },
    rating: { average: 4.2, count: 320 },
    status: 'active',
  },
  {
    titleFa: 'لپ تاپ دل مدل XPS 15 پردازنده Core i7 رم 16 گیگابایت',
    titleEn: 'Dell XPS 15 Core i7 16GB',
    slug: 'dell-xps-15-i7-16gb',
    description: 'لپ تاپ پریمیوم با نمایشگر 4K OLED و طراحی فوق‌العاده.',
    categorySlug: 'laptop-dell',
    brandSlug: 'dell',
    images: { main: { url: '/images/products/dell-xps-15.jpg', alt: 'Dell XPS 15' }, gallery: [] },
    rating: { average: 4.6, count: 210 },
    status: 'active',
  },

  // ==================== HEADPHONES (4) ====================
  {
    titleFa: 'هدفون بی‌سیم اپل مدل AirPods Pro نسل دوم',
    titleEn: 'Apple AirPods Pro 2nd Generation',
    slug: 'apple-airpods-pro-2',
    description: 'ایرپادز پرو نسل دوم با قابلیت حذف نویز فعال و صدای فضایی.',
    categorySlug: 'apple-airpods',
    brandSlug: 'apple',
    images: { main: { url: '/images/products/airpods-pro-2.jpg', alt: 'AirPods Pro 2' }, gallery: [] },
    rating: { average: 4.8, count: 890 },
    status: 'active',
  },
  {
    titleFa: 'هدفون بی‌سیم سامسونگ مدل Galaxy Buds2 Pro',
    titleEn: 'Samsung Galaxy Buds2 Pro',
    slug: 'samsung-galaxy-buds2-pro',
    description: 'گلکسی بادز 2 پرو با کیفیت صدای Hi-Fi و حذف نویز هوشمند.',
    categorySlug: 'samsung-buds',
    brandSlug: 'samsung',
    images: { main: { url: '/images/products/galaxy-buds2-pro.jpg', alt: 'Galaxy Buds2 Pro' }, gallery: [] },
    rating: { average: 4.5, count: 540 },
    status: 'active',
  },
  {
    titleFa: 'هدفون بی‌سیم سونی مدل WH-1000XM5',
    titleEn: 'Sony WH-1000XM5',
    slug: 'sony-wh-1000xm5',
    description: 'هدفون بی‌سیم سونی با بهترین حذف نویز در جهان و کیفیت صدای استثنایی.',
    categorySlug: 'sony-headphones',
    brandSlug: 'sony',
    images: { main: { url: '/images/products/sony-wh-1000xm5.jpg', alt: 'Sony WH-1000XM5' }, gallery: [] },
    rating: { average: 4.9, count: 1200 },
    status: 'active',
  },
  {
    titleFa: 'هدفون بلوتوثی جی بی ال مدل Tune 770NC',
    titleEn: 'JBL Tune 770NC',
    slug: 'jbl-tune-770nc',
    description: 'هدفون JBL با حذف نویز فعال و 70 ساعت پخش موسیقی.',
    categorySlug: 'jbl-headphones',
    brandSlug: 'jbl',
    images: { main: { url: '/images/products/jbl-tune-770nc.jpg', alt: 'JBL Tune 770NC' }, gallery: [] },
    rating: { average: 4.3, count: 380 },
    status: 'active',
  },

  // ==================== SMART WATCHES (3) ====================
  {
    titleFa: 'ساعت هوشمند اپل مدل Apple Watch Series 9 سایز 45 میلی‌متر',
    titleEn: 'Apple Watch Series 9 45mm',
    slug: 'apple-watch-series-9-45mm',
    description: 'اپل واچ سری 9 با تراشه S9 و قابلیت Double Tap.',
    categorySlug: 'apple-watch',
    brandSlug: 'apple',
    images: { main: { url: '/images/products/apple-watch-9.jpg', alt: 'Apple Watch Series 9' }, gallery: [] },
    rating: { average: 4.7, count: 720 },
    status: 'active',
  },
  {
    titleFa: 'ساعت هوشمند سامسونگ مدل Galaxy Watch6 Classic سایز 47 میلی‌متر',
    titleEn: 'Samsung Galaxy Watch6 Classic 47mm',
    slug: 'samsung-galaxy-watch6-classic-47mm',
    description: 'گلکسی واچ 6 کلاسیک با بزل چرخشی و سنسور BioActive.',
    categorySlug: 'samsung-watch',
    brandSlug: 'samsung',
    images: {
      main: { url: '/images/products/galaxy-watch6.jpg', alt: 'Galaxy Watch6 Classic' },
      gallery: [],
    },
    rating: { average: 4.5, count: 410 },
    status: 'active',
  },
  {
    titleFa: 'ساعت هوشمند شیائومی مدل Watch S3',
    titleEn: 'Xiaomi Watch S3',
    slug: 'xiaomi-watch-s3',
    description: 'شیائومی واچ S3 با نمایشگر AMOLED و بزل قابل تعویض.',
    categorySlug: 'xiaomi-watch',
    brandSlug: 'xiaomi',
    images: { main: { url: '/images/products/xiaomi-watch-s3.jpg', alt: 'Xiaomi Watch S3' }, gallery: [] },
    rating: { average: 4.2, count: 180 },
    status: 'active',
  },

  // ==================== TABLETS (3) ====================
  {
    titleFa: 'تبلت اپل مدل iPad Pro 12.9 اینچ M2 ظرفیت 256 گیگابایت',
    titleEn: 'Apple iPad Pro 12.9 M2 256GB',
    slug: 'apple-ipad-pro-12-9-m2-256gb',
    description: 'آیپد پرو با تراشه M2، نمایشگر Liquid Retina XDR و پشتیبانی از Apple Pencil.',
    categorySlug: 'ipad',
    brandSlug: 'apple',
    images: { main: { url: '/images/products/ipad-pro-12-9.jpg', alt: 'iPad Pro 12.9' }, gallery: [] },
    rating: { average: 4.8, count: 380 },
    status: 'active',
  },
  {
    titleFa: 'تبلت سامسونگ مدل Galaxy Tab S9 Ultra ظرفیت 256 گیگابایت',
    titleEn: 'Samsung Galaxy Tab S9 Ultra 256GB',
    slug: 'samsung-galaxy-tab-s9-ultra-256gb',
    description: 'گلکسی تب S9 اولترا با نمایشگر 14.6 اینچی و قلم S Pen.',
    categorySlug: 'tablet-samsung',
    brandSlug: 'samsung',
    images: {
      main: { url: '/images/products/galaxy-tab-s9-ultra.jpg', alt: 'Galaxy Tab S9 Ultra' },
      gallery: [],
    },
    rating: { average: 4.6, count: 210 },
    status: 'active',
  },
  {
    titleFa: 'تبلت اپل مدل iPad Air نسل پنجم ظرفیت 64 گیگابایت',
    titleEn: 'Apple iPad Air 5th Gen 64GB',
    slug: 'apple-ipad-air-5-64gb',
    description: 'آیپد ایر با تراشه M1 و نمایشگر 10.9 اینچی Liquid Retina.',
    categorySlug: 'ipad',
    brandSlug: 'apple',
    images: { main: { url: '/images/products/ipad-air-5.jpg', alt: 'iPad Air 5' }, gallery: [] },
    rating: { average: 4.5, count: 290 },
    status: 'active',
  },

  // ==================== TVs (2) ====================
  {
    titleFa: 'تلویزیون ال ای دی هوشمند سامسونگ 55 اینچ مدل QN90C',
    titleEn: 'Samsung 55" Neo QLED QN90C',
    slug: 'samsung-tv-55-qn90c',
    description: 'تلویزیون Neo QLED سامسونگ با فناوری Quantum Matrix و پردازنده Neural Quantum.',
    categorySlug: 'samsung-tv',
    brandSlug: 'samsung',
    images: { main: { url: '/images/products/samsung-qn90c.jpg', alt: 'Samsung QN90C' }, gallery: [] },
    rating: { average: 4.7, count: 340 },
    status: 'active',
  },
  {
    titleFa: 'تلویزیون OLED ال جی 65 اینچ مدل C3',
    titleEn: 'LG 65" OLED C3',
    slug: 'lg-oled-65-c3',
    description: 'تلویزیون OLED ال جی با پردازنده α9 AI نسل ششم و Dolby Vision.',
    categorySlug: 'lg-tv',
    brandSlug: 'lg',
    images: { main: { url: '/images/products/lg-oled-c3.jpg', alt: 'LG OLED C3' }, gallery: [] },
    rating: { average: 4.8, count: 280 },
    status: 'active',
  },

  // ==================== SPEAKERS (2) ====================
  {
    titleFa: 'اسپیکر بلوتوثی جی بی ال مدل Flip 6',
    titleEn: 'JBL Flip 6',
    slug: 'jbl-flip-6',
    description: 'اسپیکر قابل حمل JBL با صدای قدرتمند و مقاومت در برابر آب.',
    categorySlug: 'jbl-speaker',
    brandSlug: 'jbl',
    images: { main: { url: '/images/products/jbl-flip-6.jpg', alt: 'JBL Flip 6' }, gallery: [] },
    rating: { average: 4.6, count: 520 },
    status: 'active',
  },
  {
    titleFa: 'اسپیکر بلوتوثی سونی مدل SRS-XB33',
    titleEn: 'Sony SRS-XB33',
    slug: 'sony-srs-xb33',
    description: 'اسپیکر سونی با صدای Extra Bass و نورپردازی LED.',
    categorySlug: 'bluetooth-speaker',
    brandSlug: 'sony',
    images: { main: { url: '/images/products/sony-srs-xb33.jpg', alt: 'Sony SRS-XB33' }, gallery: [] },
    rating: { average: 4.4, count: 310 },
    status: 'active',
  },

  // ==================== SPORTS/FASHION (2) ====================
  {
    titleFa: 'کفش ورزشی مردانه نایک مدل Air Max 270',
    titleEn: 'Nike Air Max 270 Men',
    slug: 'nike-air-max-270-men',
    description: 'کفش ورزشی نایک با تکنولوژی Air Max برای راحتی بیشتر.',
    categorySlug: 'sports-shoes',
    brandSlug: 'nike',
    images: { main: { url: '/images/products/nike-air-max-270.jpg', alt: 'Nike Air Max 270' }, gallery: [] },
    rating: { average: 4.5, count: 890 },
    status: 'active',
  },
  {
    titleFa: 'کفش ورزشی مردانه آدیداس مدل Ultraboost 23',
    titleEn: 'Adidas Ultraboost 23 Men',
    slug: 'adidas-ultraboost-23-men',
    description: 'کفش دویدن آدیداس با فناوری Boost برای بازگشت انرژی.',
    categorySlug: 'sports-shoes',
    brandSlug: 'adidas',
    images: {
      main: { url: '/images/products/adidas-ultraboost-23.jpg', alt: 'Adidas Ultraboost 23' },
      gallery: [],
    },
    rating: { average: 4.6, count: 720 },
    status: 'active',
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const existingCount = await Product.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Products already exist (${existingCount} found)`);
      console.log('   Run with --force to re-seed\n');
      return;
    }

    if (forceReseed && existingCount > 0) {
      await Product.deleteMany({});
      console.log(`🗑️  Cleared ${existingCount} existing products\n`);
    }

    console.log('📦 Seeding products...\n');

    let insertedCount = 0;

    for (const productData of PRODUCTS) {
      // Check if already exists
      const existing = await Product.findOne({ slug: productData.slug });
      if (existing) {
        console.log(`⏭️  Skip: ${productData.titleFa.substring(0, 40)}...`);
        continue;
      }

      // Find category and brand
      const category = await Category.findOne({ slug: productData.categorySlug });
      const brand = await Brand.findOne({ slug: productData.brandSlug });

      if (!category) {
        console.log(`⚠️  Category not found: ${productData.categorySlug} - Skipping ${productData.slug}`);
        continue;
      }

      const { categorySlug, brandSlug, ...rest } = productData;

      await Product.create({
        ...rest,
        category: category._id,
        brand: brand?._id || null,
      });

      insertedCount++;
      console.log(`✓ ${productData.titleFa.substring(0, 50)}...`);
    }

    const totalCount = await Product.countDocuments();
    console.log(`\n✅ Done! Inserted ${insertedCount} products`);
    console.log(`📊 Total products: ${totalCount}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { PRODUCTS, seedProducts };

if (require.main === module) {
  seedProducts();
}
