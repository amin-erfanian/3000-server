/**
 * Seed Sellers
 * Run: node seeds/sellers.js
 * 
 * Note: Requires users to exist first, or creates dummy user references
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Seller = require('../models/seller');

const forceReseed = process.argv.includes('--force');

// Use same connection as main app
const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

// We'll create ObjectIds for user references (in real app, link to actual users)
const createUserId = () => new mongoose.Types.ObjectId();

const SELLERS = [
  {
    code: 'DK001',
    title: 'دیجی‌کالا',
    slug: 'digikala',
    description: 'فروشگاه رسمی دیجی‌کالا - بزرگترین فروشگاه آنلاین ایران',
    logo: '/images/sellers/digikala.png',
    contactInfo: {
      phone: '02161930000',
      email: 'support@digikala.com',
      address: 'تهران، بزرگراه آیت‌الله سعیدی',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.8, count: 125000 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'MS001',
    title: 'موبایل استور',
    slug: 'mobile-store',
    description: 'فروشگاه تخصصی موبایل و لوازم جانبی',
    logo: '/images/sellers/mobile-store.png',
    contactInfo: {
      phone: '02188776655',
      email: 'info@mobilestore.ir',
      address: 'تهران، خیابان ولیعصر',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.5, count: 8900 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'TE001',
    title: 'تکنو لند',
    slug: 'techno-land',
    description: 'فروشگاه تخصصی لپ‌تاپ و کامپیوتر',
    logo: '/images/sellers/techno-land.png',
    contactInfo: {
      phone: '02144556677',
      email: 'sales@technoland.ir',
      address: 'تهران، خیابان انقلاب',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.6, count: 5600 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'AP001',
    title: 'اپل استور ایران',
    slug: 'apple-store-iran',
    description: 'نماینده رسمی محصولات اپل',
    logo: '/images/sellers/apple-store.png',
    contactInfo: {
      phone: '02122334455',
      email: 'info@applestore.ir',
      address: 'تهران، سعادت آباد',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.9, count: 12000 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'SM001',
    title: 'سامسونگ مارکت',
    slug: 'samsung-market',
    description: 'فروشنده رسمی محصولات سامسونگ',
    logo: '/images/sellers/samsung-market.png',
    contactInfo: {
      phone: '02133445566',
      email: 'info@samsungmarket.ir',
      address: 'تهران، میرداماد',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.7, count: 9500 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'HA001',
    title: 'هایپر لوازم خانگی',
    slug: 'hyper-home',
    description: 'فروشگاه بزرگ لوازم خانگی',
    logo: '/images/sellers/hyper-home.png',
    contactInfo: {
      phone: '02155667788',
      email: 'info@hyperhome.ir',
      address: 'تهران، شهرک غرب',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.4, count: 3200 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'SP001',
    title: 'اسپرت مارکت',
    slug: 'sport-market',
    description: 'فروشگاه پوشاک و لوازم ورزشی',
    logo: '/images/sellers/sport-market.png',
    contactInfo: {
      phone: '02177889900',
      email: 'info@sportmarket.ir',
      address: 'تهران، ونک',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.3, count: 2100 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'BE001',
    title: 'بیوتی شاپ',
    slug: 'beauty-shop',
    description: 'فروشگاه محصولات آرایشی و بهداشتی',
    logo: '/images/sellers/beauty-shop.png',
    contactInfo: {
      phone: '02166778899',
      email: 'info@beautyshop.ir',
      address: 'تهران، تجریش',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.5, count: 4500 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'GA001',
    title: 'گیمر شاپ',
    slug: 'gamer-shop',
    description: 'فروشگاه تخصصی گیمینگ',
    logo: '/images/sellers/gamer-shop.png',
    contactInfo: {
      phone: '02199001122',
      email: 'info@gamershop.ir',
      address: 'تهران، پاسداران',
      city: 'تهران',
      province: 'تهران',
    },
    rating: { score: 4.6, count: 6700 },
    status: 'active',
    isVerified: true,
  },
  {
    code: 'NW001',
    title: 'فروشگاه جدید',
    slug: 'new-seller',
    description: 'فروشنده جدید - در حال ارزیابی',
    logo: '/images/sellers/default.png',
    contactInfo: {
      phone: '09121234567',
      email: 'new@seller.ir',
      address: 'اصفهان',
      city: 'اصفهان',
      province: 'اصفهان',
    },
    rating: { score: 0, count: 0 },
    status: 'pending',
    isVerified: false,
  },
];

async function seedSellers() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const existingCount = await Seller.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Sellers already exist (${existingCount} found)`);
      console.log('   Run with --force to re-seed\n');
      return;
    }

    if (forceReseed && existingCount > 0) {
      await Seller.deleteMany({});
      console.log(`🗑️  Cleared ${existingCount} existing sellers\n`);
    }

    console.log('🏪 Seeding sellers...\n');

    for (const seller of SELLERS) {
      const existing = await Seller.findOne({ code: seller.code });
      if (existing) {
        console.log(`⏭️  Skip: ${seller.title}`);
        continue;
      }

      await Seller.create({
        ...seller,
        user: createUserId(), // Creates dummy user reference
        isActive: true,
      });
      console.log(`✓ ${seller.title} (${seller.code})`);
    }

    const totalCount = await Seller.countDocuments();
    console.log(`\n✅ Done! Total sellers: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { SELLERS, seedSellers };

if (require.main === module) {
  seedSellers();
}

