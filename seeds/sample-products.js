/**
 * Sample Product Data with Nested Related Objects
 * This file provides example data structures for the e-commerce models
 */

// ============================================
// SAMPLE CATEGORIES
// ============================================
const sampleCategories = [
  {
    _id: '507f1f77bcf86cd799439011',
    titleFa: 'موبایل',
    titleEn: 'Mobile',
    code: 'mobile-phone',
    parent: null,
    level: 0,
    icon: 'smartphone',
    description: 'انواع گوشی موبایل',
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: '507f1f77bcf86cd799439012',
    titleFa: 'گوشی موبایل',
    titleEn: 'Mobile Phone',
    code: 'category-mobile-phone',
    parent: '507f1f77bcf86cd799439011',
    level: 1,
    icon: 'phone',
    description: 'گوشی‌های هوشمند',
    returnReasonAlert: 'کالا باید در شرایط اولیه باشد',
    isActive: true,
    sortOrder: 1,
  },
];

// ============================================
// SAMPLE BRANDS
// ============================================
const sampleBrands = [
  {
    _id: '507f1f77bcf86cd799439021',
    titleFa: 'اپل',
    titleEn: 'Apple',
    code: 'apple',
    logo: {
      url: 'https://example.com/brands/apple-logo.png',
      thumbnailUrl: 'https://example.com/brands/apple-logo-thumb.png',
    },
    description: 'شرکت اپل، تولیدکننده آیفون',
    website: 'https://www.apple.com',
    isPremium: true,
    isMiscellaneous: false,
    isVisible: true,
    isActive: true,
  },
  {
    _id: '507f1f77bcf86cd799439022',
    titleFa: 'سامسونگ',
    titleEn: 'Samsung',
    code: 'samsung',
    logo: {
      url: 'https://example.com/brands/samsung-logo.png',
      thumbnailUrl: 'https://example.com/brands/samsung-logo-thumb.png',
    },
    description: 'شرکت سامسونگ',
    website: 'https://www.samsung.com',
    isPremium: true,
    isMiscellaneous: false,
    isVisible: true,
    isActive: true,
  },
];

// ============================================
// SAMPLE COLORS
// ============================================
const sampleColors = [
  {
    _id: '507f1f77bcf86cd799439031',
    title: 'مشکی',
    titleEn: 'Black',
    hexCode: '#000000',
    isMultiColor: false,
    isActive: true,
  },
  {
    _id: '507f1f77bcf86cd799439032',
    title: 'سفید',
    titleEn: 'White',
    hexCode: '#FFFFFF',
    isMultiColor: false,
    isActive: true,
  },
  {
    _id: '507f1f77bcf86cd799439033',
    title: 'آبی تیتانیوم',
    titleEn: 'Blue Titanium',
    hexCode: '#394E6A',
    isMultiColor: false,
    isActive: true,
  },
];

// ============================================
// SAMPLE WARRANTIES
// ============================================
const sampleWarranties = [
  {
    _id: '507f1f77bcf86cd799439041',
    titleFa: 'گارانتی ۱۸ ماهه شرکتی',
    titleEn: '18 Months Official Warranty',
    description: 'گارانتی رسمی شرکت سازنده',
    duration: {
      value: 18,
      unit: 'month',
    },
    coverage: ['تعمیر رایگان', 'تعویض قطعات', 'پشتیبانی فنی'],
    isActive: true,
  },
  {
    _id: '507f1f77bcf86cd799439042',
    titleFa: 'گارانتی اصالت و سلامت فیزیکی کالا',
    titleEn: 'Authenticity & Physical Health Guarantee',
    description: 'تضمین اصالت کالا و سلامت فیزیکی',
    duration: {
      value: 7,
      unit: 'day',
    },
    coverage: ['تضمین اصالت', 'سلامت فیزیکی'],
    isActive: true,
  },
];

// ============================================
// SAMPLE SELLERS
// ============================================
const sampleSellers = [
  {
    _id: '507f1f77bcf86cd799439051',
    user: '507f1f77bcf86cd799439001', // Reference to User
    code: 'DK3M5',
    title: 'موبایل مرکزی',
    slug: 'mobile-markazi',
    description: 'فروشگاه تخصصی موبایل با بیش از ۱۰ سال سابقه',
    logo: 'https://example.com/sellers/mobile-markazi.png',
    contactInfo: {
      phone: '02112345678',
      email: 'info@mobilemarkazi.com',
      address: 'تهران، خیابان ولیعصر',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1234567890',
    },
    rating: {
      totalRate: 92,
      totalCount: 15420,
      commitment: 98,
      noReturn: 96.5,
      onTimeShipping: 94.2,
    },
    stars: 4.6,
    grade: {
      label: 'عالی',
      color: '#00a049',
    },
    properties: {
      isTrusted: true,
      isOfficial: false,
      isRoosta: false,
      isNew: false,
    },
    status: 'active',
    isActive: true,
    registrationDate: new Date('2020-03-15'),
  },
  {
    _id: '507f1f77bcf86cd799439052',
    user: '507f1f77bcf86cd799439002',
    code: 'AP1K8',
    title: 'اپل استور رسمی',
    slug: 'apple-store-official',
    description: 'نماینده رسمی محصولات اپل',
    logo: 'https://example.com/sellers/apple-store.png',
    contactInfo: {
      phone: '02187654321',
      email: 'info@applestore.ir',
      address: 'تهران، سعادت آباد',
      city: 'تهران',
      province: 'تهران',
      postalCode: '1987654321',
    },
    rating: {
      totalRate: 96,
      totalCount: 8750,
      commitment: 100,
      noReturn: 98.2,
      onTimeShipping: 97.5,
    },
    stars: 4.8,
    grade: {
      label: 'عالی',
      color: '#00a049',
    },
    properties: {
      isTrusted: true,
      isOfficial: true,
      isRoosta: false,
      isNew: false,
    },
    status: 'active',
    isActive: true,
    registrationDate: new Date('2019-06-20'),
  },
];

// ============================================
// SAMPLE PRODUCTS (Fully Nested)
// ============================================
const sampleProducts = [
  {
    _id: '507f1f77bcf86cd799439101',
    titleFa: 'گوشی موبایل اپل مدل iPhone 15 Pro Max دو سیم‌کارت ظرفیت 256 گیگابایت',
    titleEn: 'Apple iPhone 15 Pro Max Dual SIM 256GB',
    slug: 'apple-iphone-15-pro-max-dual-sim-256gb',
    sku: 'APL-IP15PM-256',
    description: `
      آیفون 15 پرو مکس، پرچمدار جدید اپل با تراشه A17 Pro و دوربین 48 مگاپیکسلی.
      این گوشی با صفحه نمایش 6.7 اینچی Super Retina XDR و بدنه تیتانیومی عرضه می‌شود.
    `,
    shortDescription: 'آیفون 15 پرو مکس با تراشه A17 Pro',

    // Nested Category
    category: {
      _id: '507f1f77bcf86cd799439012',
      titleFa: 'گوشی موبایل',
      titleEn: 'Mobile Phone',
      code: 'category-mobile-phone',
      parent: {
        _id: '507f1f77bcf86cd799439011',
        titleFa: 'موبایل',
        titleEn: 'Mobile',
        code: 'mobile-phone',
      },
      level: 1,
    },

    // Nested Brand
    brand: {
      _id: '507f1f77bcf86cd799439021',
      titleFa: 'اپل',
      titleEn: 'Apple',
      code: 'apple',
      logo: {
        url: 'https://example.com/brands/apple-logo.png',
      },
      isPremium: true,
    },

    status: 'marketable',
    productType: 'product',

    // Images
    images: {
      main: {
        url: 'https://example.com/products/iphone-15-pro-max-main.jpg',
        thumbnailUrl: 'https://example.com/products/iphone-15-pro-max-thumb.jpg',
        webpUrl: 'https://example.com/products/iphone-15-pro-max-main.webp',
        alt: 'آیفون 15 پرو مکس',
        isMain: true,
        sortOrder: 0,
      },
      gallery: [
        {
          url: 'https://example.com/products/iphone-15-pro-max-1.jpg',
          webpUrl: 'https://example.com/products/iphone-15-pro-max-1.webp',
          alt: 'نمای جلو',
          sortOrder: 1,
        },
        {
          url: 'https://example.com/products/iphone-15-pro-max-2.jpg',
          webpUrl: 'https://example.com/products/iphone-15-pro-max-2.webp',
          alt: 'نمای پشت',
          sortOrder: 2,
        },
        {
          url: 'https://example.com/products/iphone-15-pro-max-3.jpg',
          webpUrl: 'https://example.com/products/iphone-15-pro-max-3.webp',
          alt: 'دوربین',
          sortOrder: 3,
        },
      ],
    },

    // Specifications
    specifications: [
      {
        title: 'مشخصات کلی',
        attributes: [
          { title: 'ابعاد', values: ['159.9 × 76.7 × 8.25 میلی‌متر'] },
          { title: 'وزن', values: ['221 گرم'] },
          { title: 'ساختار بدنه', values: ['تیتانیوم'] },
          { title: 'استاندارد مقاومت', values: ['IP68'] },
        ],
      },
      {
        title: 'صفحه نمایش',
        attributes: [
          { title: 'اندازه', values: ['6.7 اینچ'] },
          { title: 'نوع', values: ['Super Retina XDR OLED'] },
          { title: 'رزولوشن', values: ['2796 × 1290 پیکسل'] },
          { title: 'نرخ نوسازی', values: ['120 هرتز ProMotion'] },
        ],
      },
      {
        title: 'سخت‌افزار',
        attributes: [
          { title: 'پردازنده', values: ['Apple A17 Pro'] },
          { title: 'حافظه رم', values: ['8 گیگابایت'] },
          { title: 'حافظه داخلی', values: ['256 گیگابایت'] },
        ],
      },
      {
        title: 'دوربین',
        attributes: [
          { title: 'دوربین اصلی', values: ['48 مگاپیکسل'] },
          { title: 'دوربین فوق عریض', values: ['12 مگاپیکسل'] },
          { title: 'دوربین تله‌فوتو', values: ['12 مگاپیکسل با زوم اپتیکال 5x'] },
          { title: 'دوربین سلفی', values: ['12 مگاپیکسل'] },
        ],
      },
    ],

    // Review Attributes (Quick specs)
    reviewAttributes: [
      { title: 'حافظه داخلی', values: ['256 گیگابایت'] },
      { title: 'شبکه ارتباطی', values: ['5G'] },
      { title: 'سیستم عامل', values: ['iOS 17'] },
    ],

    // Pros and Cons
    advantages: [
      'پردازنده قدرتمند A17 Pro',
      'دوربین با کیفیت استثنایی',
      'صفحه نمایش ProMotion 120 هرتز',
      'بدنه تیتانیومی مقاوم',
      'پورت USB-C',
    ],
    disadvantages: [
      'قیمت بالا',
      'شارژر در جعبه نیست',
      'سنگین',
    ],

    // Expert Review
    expertReview: {
      description: 'آیفون 15 پرو مکس بهترین گوشی اپل تا به امروز است...',
      shortReview: 'پرچمدار بی‌نقص اپل',
    },

    // Rating & Stats
    rating: {
      rate: 4.7,
      count: 2845,
    },
    suggestion: {
      count: 2560,
      percentage: 90,
    },
    commentsCount: 1250,
    questionsCount: 89,
    viewCount: 125000,
    salesCount: 3200,

    // Properties
    properties: {
      isFastShipping: true,
      isShipBySeller: false,
      freeShippingBadge: true,
      isMultiWarehouse: true,
      isFake: false,
      hasGift: false,
      isNonInventory: false,
      isAd: false,
      isJetEligible: true,
      isMedicalSupplement: false,
      hasPrintedPrice: false,
      hasTrueToSize: false,
      hasSizeGuide: false,
    },

    // Available Colors
    colors: [
      {
        _id: '507f1f77bcf86cd799439031',
        title: 'مشکی',
        hexCode: '#000000',
      },
      {
        _id: '507f1f77bcf86cd799439032',
        title: 'سفید',
        hexCode: '#FFFFFF',
      },
      {
        _id: '507f1f77bcf86cd799439033',
        title: 'آبی تیتانیوم',
        hexCode: '#394E6A',
      },
    ],

    tags: ['آیفون', 'اپل', 'گوشی هوشمند', 'iPhone 15', 'پرو مکس'],

    // SEO
    seo: {
      title: 'خرید گوشی آیفون 15 پرو مکس | قیمت iPhone 15 Pro Max',
      description: 'خرید اینترنتی گوشی موبایل اپل آیفون 15 پرو مکس با گارانتی اصلی',
      canonicalUrl: 'https://example.com/product/apple-iphone-15-pro-max',
    },

    // Badges
    badges: [
      {
        type: 'best_seller',
        title: 'پرفروش',
        icon: 'fire',
        color: '#ff5722',
      },
    ],

    // Price Range (calculated from variants)
    priceRange: {
      min: 89000000,
      max: 95000000,
    },

    // Variants (Nested with Seller)
    variants: [
      {
        _id: '507f1f77bcf86cd799439201',
        product: '507f1f77bcf86cd799439101',

        // Nested Seller
        seller: {
          _id: '507f1f77bcf86cd799439052',
          code: 'AP1K8',
          title: 'اپل استور رسمی',
          rating: {
            totalRate: 96,
            totalCount: 8750,
            commitment: 100,
            noReturn: 98.2,
            onTimeShipping: 97.5,
          },
          stars: 4.8,
          grade: {
            label: 'عالی',
            color: '#00a049',
          },
          properties: {
            isTrusted: true,
            isOfficial: true,
          },
        },

        // Nested Color
        color: {
          _id: '507f1f77bcf86cd799439033',
          title: 'آبی تیتانیوم',
          hexCode: '#394E6A',
        },

        // Nested Warranty
        warranty: {
          _id: '507f1f77bcf86cd799439041',
          titleFa: 'گارانتی ۱۸ ماهه شرکتی',
          duration: { value: 18, unit: 'month' },
        },

        sku: 'APL-IP15PM-256-BT-AP1K8',
        size: '',

        price: {
          sellingPrice: 89000000,
          rrpPrice: 92000000,
          costPrice: 85000000,
          discountPercent: 3,
          isIncredible: false,
          isPromotion: false,
        },

        orderLimit: {
          min: 1,
          max: 3,
        },

        stock: {
          quantity: 25,
          reservedQuantity: 3,
          lowStockThreshold: 5,
        },

        status: 'marketable',
        leadTime: 0,

        shipmentMethods: {
          description: 'موجود در انبار',
          hasLeadTime: false,
          providers: [
            {
              type: '3000',
              title: 'ارسال اکسپرس',
              description: 'ارسال امروز',
              shippingMode: 'express',
              deliveryDay: 'today',
              price: { value: 0, isFree: true, text: 'رایگان' },
            },
          ],
        },

        properties: {
          isFastShipping: true,
          isShipBySeller: false,
          isMultiWarehouse: false,
          inDigikalaWarehouse: true,
        },

        rank: 98.5,
        statistics: {
          salesCount: 1250,
          viewCount: 45000,
        },

        isActive: true,
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        _id: '507f1f77bcf86cd799439202',
        product: '507f1f77bcf86cd799439101',

        seller: {
          _id: '507f1f77bcf86cd799439051',
          code: 'DK3M5',
          title: 'موبایل مرکزی',
          rating: {
            totalRate: 92,
            totalCount: 15420,
          },
          stars: 4.6,
          grade: {
            label: 'عالی',
            color: '#00a049',
          },
          properties: {
            isTrusted: true,
            isOfficial: false,
          },
        },

        color: {
          _id: '507f1f77bcf86cd799439031',
          title: 'مشکی',
          hexCode: '#000000',
        },

        warranty: {
          _id: '507f1f77bcf86cd799439041',
          titleFa: 'گارانتی ۱۸ ماهه شرکتی',
          duration: { value: 18, unit: 'month' },
        },

        sku: 'APL-IP15PM-256-BK-DK3M5',

        price: {
          sellingPrice: 91500000,
          rrpPrice: 92000000,
          discountPercent: 1,
          isIncredible: false,
          isPromotion: false,
        },

        orderLimit: {
          min: 1,
          max: 5,
        },

        stock: {
          quantity: 42,
          reservedQuantity: 5,
          lowStockThreshold: 10,
        },

        status: 'marketable',
        leadTime: 2,

        shipmentMethods: {
          description: 'موجود در انبار فروشنده',
          hasLeadTime: true,
          providers: [
            {
              type: '3000',
              title: 'ارسال عادی',
              description: 'ارسال از 2 روز کاری دیگر',
              shippingMode: 'normal',
              deliveryDay: 'other_days',
              price: { value: 50000, isFree: false, text: '۵۰,۰۰۰ تومان' },
            },
          ],
        },

        properties: {
          isFastShipping: false,
          isShipBySeller: true,
          inDigikalaWarehouse: false,
        },

        rank: 85.2,
        statistics: {
          salesCount: 890,
          viewCount: 32000,
        },

        isActive: true,
        createdAt: new Date('2024-09-20'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        _id: '507f1f77bcf86cd799439203',
        product: '507f1f77bcf86cd799439101',

        seller: {
          _id: '507f1f77bcf86cd799439052',
          code: 'AP1K8',
          title: 'اپل استور رسمی',
          stars: 4.8,
          grade: { label: 'عالی', color: '#00a049' },
        },

        color: {
          _id: '507f1f77bcf86cd799439032',
          title: 'سفید',
          hexCode: '#FFFFFF',
        },

        warranty: {
          _id: '507f1f77bcf86cd799439041',
          titleFa: 'گارانتی ۱۸ ماهه شرکتی',
        },

        sku: 'APL-IP15PM-256-WH-AP1K8',

        price: {
          sellingPrice: 89500000,
          rrpPrice: 92000000,
          discountPercent: 3,
          isIncredible: true,
          isPromotion: false,
        },

        stock: {
          quantity: 8,
          reservedQuantity: 2,
          lowStockThreshold: 5,
        },

        status: 'marketable',
        leadTime: 0,

        properties: {
          isFastShipping: true,
          inDigikalaWarehouse: true,
        },

        badges: [
          { type: 'incredible', title: 'شگفت‌انگیز', icon: 'flash' },
        ],

        rank: 95.0,
        isActive: true,
      },
    ],

    // Reviews (Sample nested)
    reviews: [
      {
        _id: '507f1f77bcf86cd799439301',
        product: '507f1f77bcf86cd799439101',
        user: {
          _id: '507f1f77bcf86cd799439003',
          profile: { firstName: 'علی' },
        },
        rating: 5,
        title: 'عالی',
        comment: 'بهترین گوشی که تا حالا داشتم. دوربین فوق‌العاده و سرعت بالا.',
        isRecommended: true,
        advantages: ['دوربین عالی', 'سرعت بالا', 'صفحه نمایش زیبا'],
        disadvantages: ['قیمت بالا'],
        isPurchaseVerified: true,
        isApproved: true,
        helpfulCount: 45,
        notHelpfulCount: 3,
        createdAt: new Date('2024-10-15'),
      },
      {
        _id: '507f1f77bcf86cd799439302',
        product: '507f1f77bcf86cd799439101',
        user: {
          _id: '507f1f77bcf86cd799439004',
          profile: { firstName: 'مریم' },
        },
        rating: 4,
        title: 'راضی هستم',
        comment: 'گوشی خیلی خوبه ولی قیمتش واقعاً بالاست.',
        isRecommended: true,
        advantages: ['کیفیت ساخت', 'iOS روان'],
        disadvantages: ['قیمت', 'سنگین'],
        isPurchaseVerified: true,
        isApproved: true,
        helpfulCount: 23,
        notHelpfulCount: 2,
        createdAt: new Date('2024-11-02'),
      },
    ],

    isActive: true,
    isDeleted: false,
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-12-01'),
  },
];

// ============================================
// EXPORT FOR SEEDING
// ============================================
module.exports = {
  sampleCategories,
  sampleBrands,
  sampleColors,
  sampleWarranties,
  sampleSellers,
  sampleProducts,
};

// ============================================
// SEEDER FUNCTION
// ============================================
const mongoose = require('mongoose');

async function seedDatabase() {
  const {
    Category,
    Brand,
    Color,
    Warranty,
    Seller,
    Product,
    Variant,
  } = require('../models');

  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Color.deleteMany({}),
      Warranty.deleteMany({}),
      // Seller.deleteMany({}), // Be careful with this in production
      Product.deleteMany({}),
      Variant.deleteMany({}),
    ]);

    // Seed Categories
    const categories = await Category.insertMany(
      sampleCategories.map(({ _id, ...rest }) => rest)
    );
    console.log(`✅ Seeded ${categories.length} categories`);

    // Seed Brands
    const brands = await Brand.insertMany(
      sampleBrands.map(({ _id, ...rest }) => rest)
    );
    console.log(`✅ Seeded ${brands.length} brands`);

    // Seed Colors
    const colors = await Color.insertMany(
      sampleColors.map(({ _id, ...rest }) => rest)
    );
    console.log(`✅ Seeded ${colors.length} colors`);

    // Seed Warranties
    const warranties = await Warranty.insertMany(
      sampleWarranties.map(({ _id, ...rest }) => rest)
    );
    console.log(`✅ Seeded ${warranties.length} warranties`);

    // Create a product
    const product = await Product.create({
      titleFa: sampleProducts[0].titleFa,
      titleEn: sampleProducts[0].titleEn,
      slug: sampleProducts[0].slug,
      sku: sampleProducts[0].sku,
      description: sampleProducts[0].description,
      shortDescription: sampleProducts[0].shortDescription,
      category: categories[1]._id, // Mobile Phone category
      brand: brands[0]._id, // Apple
      status: 'marketable',
      images: sampleProducts[0].images,
      specifications: sampleProducts[0].specifications,
      reviewAttributes: sampleProducts[0].reviewAttributes,
      advantages: sampleProducts[0].advantages,
      disadvantages: sampleProducts[0].disadvantages,
      colors: colors.map((c) => c._id),
      tags: sampleProducts[0].tags,
      seo: sampleProducts[0].seo,
      properties: sampleProducts[0].properties,
    });
    console.log(`✅ Seeded product: ${product.titleFa}`);

    // Note: Variants require a Seller, which requires a User
    // In production, you would create sellers first, then variants

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return seedDatabase();
    })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports.seedDatabase = seedDatabase;

