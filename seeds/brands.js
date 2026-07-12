/**
 * Seed Brands
 * Run: node seeds/brands.js
 * Run: node seeds/brands.js --patch(update categories on existing brands)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('../models/brand');

const forceReseed = process.argv.includes('--force');
const patchOnly = process.argv.includes('--patch');

const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

// Category ObjectIds from DB
const CAT = {
  // Mobile
  mobile: '6a53ec19e1704b858db56a90',
  mobilePhone: '6a53ec19e1704b858db56a93',
  applePhone: '6a53ec1ae1704b858db56a96',
  samsungPhone: '6a53ec1ae1704b858db56a99',
  xiaomiPhone: '6a53ec1ae1704b858db56a9c',
  huaweiPhone: '6a53ec1ae1704b858db56a9f',

  // Mobile accessories
  mobileAccessories: '6a53ec1be1704b858db56ab4',
  phoneCharger: '6a53ec1be1704b858db56ab7',
  wirelessCharger: '6a53ec1be1704b858db56aba',
  chargingCable: '6a53ec1be1704b858db56ac3',
  powerBank: '6a53ec1be1704b858db56ac6',

  // Headphones
  headphones: '6a53ec1ce1704b858db56acf',
  appleAirpods: '6a53ec1ce1704b858db56ad8',
  samsungBuds: '6a53ec1ce1704b858db56adb',
  sonyHeadphones: '6a53ec1ce1704b858db56ade',
  jblHeadphones: '6a53ec1ce1704b858db56ae1',

  // Smart watch
  smartWatch: '6a53ec1ce1704b858db56ae4',
  appleWatch: '6a53ec1ce1704b858db56ae7',
  samsungWatch: '6a53ec1ce1704b858db56aea',
  xiaomiWatch: '6a53ec1ce1704b858db56aed',

  // Laptop
  laptop: '6a53ec1de1704b858db56af3',
  laptopAsus: '6a53ec1de1704b858db56af6',
  asusVivobook: '6a53ec1de1704b858db56af9',
  asusZenbook: '6a53ec1de1704b858db56afc',
  asusTuf: '6a53ec1de1704b858db56aff',
  asusRog: '6a53ec1de1704b858db56b02',
  laptopLenovo: '6a53ec1de1704b858db56b05',
  lenovoIdeapad: '6a53ec1ee1704b858db56b08',
  lenovoThinkpad: '6a53ec1ee1704b858db56b0b',
  lenovoLoq: '6a53ec1ee1704b858db56b0e',
  lenovoLegion: '6a53ec1ee1704b858db56b11',
  macbook: '6a53ec1ee1704b858db56b14',
  macbookAir: '6a53ec1ee1704b858db56b17',
  macbookPro: '6a53ec1ee1704b858db56b1a',
  surfaceLaptop: '6a53ec1ee1704b858db56b1d',
  laptopHp: '6a53ec1fe1704b858db56b20',
  laptopDell: '6a53ec1fe1704b858db56b23',

  // Gaming
  gamingConsole: '6a53ec20e1704b858db56b47',
  xbox: '6a53ec20e1704b858db56b50',

  // Tablet
  tablet: '6a53ec21e1704b858db56b65',
  ipad: '6a53ec21e1704b858db56b68',
  tabletSamsung: '6a53ec21e1704b858db56b6b',
  tabletXiaomi: '6a53ec21e1704b858db56b6e',
  surface: '6a53ec22e1704b858db56b71',

  // Monitor
  monitor: '6a53ec23e1704b858db56b9e',

  // Speaker
  speaker: '6a53ec23e1704b858db56baa',
  bluetoothSpeaker: '6a53ec23e1704b858db56bad',
  jblSpeaker: '6a53ec24e1704b858db56bb0',

  // Camera
  camera: '6a53ec24e1704b858db56bb6',
  digitalCamera: '6a53ec24e1704b858db56bb9',
};

const BRANDS = [
  {
    titleFa: 'اپل',
    titleEn: 'Apple',
    slug: 'apple',
    logo: '/images/brands/apple.png',
    categories: [
      CAT.mobilePhone,
      CAT.applePhone,
      CAT.appleAirpods,
      CAT.appleWatch,
      CAT.macbook,
      CAT.macbookAir,
      CAT.macbookPro,
      CAT.ipad,
      CAT.tablet,
      CAT.gamingConsole,
    ],
  },
  {
    titleFa: 'سامسونگ',
    titleEn: 'Samsung',
    slug: 'samsung',
    logo: '/images/brands/samsung.png',
    categories: [
      CAT.mobilePhone,
      CAT.samsungPhone,
      CAT.samsungBuds,
      CAT.smartWatch,
      CAT.samsungWatch,
      CAT.tabletSamsung,
      CAT.tablet,
    ],
  },
  {
    titleFa: 'شیائومی',
    titleEn: 'Xiaomi',
    slug: 'xiaomi',
    logo: '/images/brands/xiaomi.png',
    categories: [
      CAT.mobilePhone,
      CAT.xiaomiPhone,
      CAT.smartWatch,
      CAT.xiaomiWatch,
      CAT.tabletXiaomi,
      CAT.tablet,
    ],
  },
  {
    titleFa: 'هواوی',
    titleEn: 'Huawei',
    slug: 'huawei',
    logo: '/images/brands/huawei.png',
    categories: [CAT.mobilePhone, CAT.huaweiPhone, CAT.laptop, CAT.tablet],
  },
  {
    titleFa: 'سونی',
    titleEn: 'Sony',
    slug: 'sony',
    logo: '/images/brands/sony.png',
    categories: [CAT.mobilePhone, CAT.headphones, CAT.sonyHeadphones, CAT.camera, CAT.digitalCamera],
  },
  {
    titleFa: 'ال جی',
    titleEn: 'LG',
    slug: 'lg',
    logo: '/images/brands/lg.png',
    categories: [CAT.mobilePhone],
  },
  {
    titleFa: 'ایسوس',
    titleEn: 'ASUS',
    slug: 'asus',
    logo: '/images/brands/asus.png',
    categories: [
      CAT.laptop,
      CAT.laptopAsus,
      CAT.asusVivobook,
      CAT.asusZenbook,
      CAT.asusTuf,
      CAT.asusRog,
      CAT.monitor,
    ],
  },
  {
    titleFa: 'لنوو',
    titleEn: 'Lenovo',
    slug: 'lenovo',
    logo: '/images/brands/lenovo.png',
    categories: [
      CAT.laptop,
      CAT.laptopLenovo,
      CAT.lenovoIdeapad,
      CAT.lenovoThinkpad,
      CAT.lenovoLoq,
      CAT.lenovoLegion,
    ],
  },
  {
    titleFa: 'اچ پی',
    titleEn: 'HP',
    slug: 'hp',
    logo: '/images/brands/hp.png',
    categories: [CAT.laptop, CAT.laptopHp, CAT.monitor],
  },
  {
    titleFa: 'دل',
    titleEn: 'Dell',
    slug: 'dell',
    logo: '/images/brands/dell.png',
    categories: [CAT.laptop, CAT.laptopDell, CAT.monitor],
  },
  {
    titleFa: 'مایکروسافت',
    titleEn: 'Microsoft',
    slug: 'microsoft',
    logo: '/images/brands/microsoft.png',
    categories: [CAT.laptop, CAT.surfaceLaptop, CAT.surface, CAT.tablet, CAT.gamingConsole, CAT.xbox],
  },
  {
    titleFa: 'جی بیال',
    titleEn: 'JBL',
    slug: 'jbl',
    logo: '/images/brands/jbl.png',
    categories: [CAT.headphones, CAT.jblHeadphones, CAT.speaker, CAT.bluetoothSpeaker, CAT.jblSpeaker],
  },
  {
    titleFa: 'انکر',
    titleEn: 'Anker',
    slug: 'anker',
    logo: '/images/brands/anker.png',
    categories: [
      CAT.mobileAccessories,
      CAT.phoneCharger,
      CAT.wirelessCharger,
      CAT.chargingCable,
      CAT.powerBank,
    ],
  },
  {
    titleFa: 'بوش',
    titleEn: 'Bosch',
    slug: 'bosch',
    logo: '/images/brands/bosch.png',
    categories: [],
  },
  {
    titleFa: 'پاناسونیک',
    titleEn: 'Panasonic',
    slug: 'panasonic',
    logo: '/images/brands/panasonic.png',
    categories: [],
  },
  {
    titleFa: 'نایک',
    titleEn: 'Nike',
    slug: 'nike',
    logo: '/images/brands/nike.png',
    categories: [],
  },
  {
    titleFa: 'آدیداس',
    titleEn: 'Adidas',
    slug: 'adidas',
    logo: '/images/brands/adidas.png',
    categories: [],
  },
  {
    titleFa: 'لورآل',
    titleEn: "L'Oreal",
    slug: 'loreal',
    logo: '/images/brands/loreal.png',
    categories: [],
  },
];

async function patchBrandCategories() {
  console.log('🔧 Patching brand categories...\n');
  for (const brand of BRANDS) {
    const result = await Brand.updateOne({ slug: brand.slug }, { $set: { categories: brand.categories } });
    if (result.matchedCount === 0) {
      console.log(`⚠️  Not found: ${brand.titleFa}`);
    } else {
      console.log(`✓ Patched: ${brand.titleFa}`);
    }
  }
  console.log('\n✅ Patch complete!');
}

async function seedBrands() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    if (patchOnly) {
      await patchBrandCategories();
      return;
    }

    const existingCount = await Brand.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Brands already exist (${existingCount} found)`);
      console.log('   Run with --force to re-seed, or --patch to update categories\n');
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
