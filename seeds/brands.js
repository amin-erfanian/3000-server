/**
 * Seed Brands
 * Run: node seeds/brands.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('../models/brand');

const forceReseed = process.argv.includes('--force');

// Use same connection as main app
const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

const BRANDS = [
  // Mobile & Electronics
  { titleFa: 'اپل', titleEn: 'Apple', slug: 'apple', logo: '/images/brands/apple.png' },
  { titleFa: 'سامسونگ', titleEn: 'Samsung', slug: 'samsung', logo: '/images/brands/samsung.png' },
  { titleFa: 'شیائومی', titleEn: 'Xiaomi', slug: 'xiaomi', logo: '/images/brands/xiaomi.png' },
  { titleFa: 'هواوی', titleEn: 'Huawei', slug: 'huawei', logo: '/images/brands/huawei.png' },
  { titleFa: 'سونی', titleEn: 'Sony', slug: 'sony', logo: '/images/brands/sony.png' },
  { titleFa: 'ال جی', titleEn: 'LG', slug: 'lg', logo: '/images/brands/lg.png' },
  
  // Laptops
  { titleFa: 'ایسوس', titleEn: 'ASUS', slug: 'asus', logo: '/images/brands/asus.png' },
  { titleFa: 'لنوو', titleEn: 'Lenovo', slug: 'lenovo', logo: '/images/brands/lenovo.png' },
  { titleFa: 'اچ پی', titleEn: 'HP', slug: 'hp', logo: '/images/brands/hp.png' },
  { titleFa: 'دل', titleEn: 'Dell', slug: 'dell', logo: '/images/brands/dell.png' },
  { titleFa: 'مایکروسافت', titleEn: 'Microsoft', slug: 'microsoft', logo: '/images/brands/microsoft.png' },
  
  // Audio
  { titleFa: 'جی بی ال', titleEn: 'JBL', slug: 'jbl', logo: '/images/brands/jbl.png' },
  { titleFa: 'انکر', titleEn: 'Anker', slug: 'anker', logo: '/images/brands/anker.png' },
  
  // Home Appliances
  { titleFa: 'بوش', titleEn: 'Bosch', slug: 'bosch', logo: '/images/brands/bosch.png' },
  { titleFa: 'پاناسونیک', titleEn: 'Panasonic', slug: 'panasonic', logo: '/images/brands/panasonic.png' },
  
  // Fashion & Beauty
  { titleFa: 'نایک', titleEn: 'Nike', slug: 'nike', logo: '/images/brands/nike.png' },
  { titleFa: 'آدیداس', titleEn: 'Adidas', slug: 'adidas', logo: '/images/brands/adidas.png' },
  { titleFa: 'لورآل', titleEn: "L'Oreal", slug: 'loreal', logo: '/images/brands/loreal.png' },
];

async function seedBrands() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const existingCount = await Brand.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Brands already exist (${existingCount} found)`);
      console.log('   Run with --force to re-seed\n');
      return;
    }

    if (forceReseed && existingCount > 0) {
      await Brand.deleteMany({});
      console.log(`🗑️  Cleared ${existingCount} existing brands\n`);
    }

    console.log('🏷️  Seeding brands...\n');

    for (const brand of BRANDS) {
      const existing = await Brand.findOne({ slug: brand.slug });
      if (existing) {
        console.log(`⏭️  Skip: ${brand.titleFa}`);
        continue;
      }

      await Brand.create({ ...brand, isActive: true });
      console.log(`✓ ${brand.titleFa} (${brand.titleEn})`);
    }

    const totalCount = await Brand.countDocuments();
    console.log(`\n✅ Done! Total brands: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { BRANDS, seedBrands };

if (require.main === module) {
  seedBrands();
}

