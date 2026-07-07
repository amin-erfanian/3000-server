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
  mobile: '69319145d1116f8f16421247',
  mobilePhone: '69319145d1116f8f16421250',
  mobileAccessories: '69319145d1116f8f16421279',
  // Mobile brands
  applePhone: '69319145d1116f8f16421257',
  samsungPhone: '69319145d1116f8f1642125b',
  xiaomiPhone: '69319145d1116f8f1642125e',
  huaweiPhone: '69319145d1116f8f16421261',
  // Headphones
  headphones: '69319145d1116f8f16421295',
  sonyHeadphones: '69319145d1116f8f164212a4',
  jblHeadphones: '69319145d1116f8f164212a7',
  samsungBuds: '69319145d1116f8f164212a1',
  appleAirpods: '69319145d1116f8f1642129e',
  // Smart watch
  smartWatch: '69319145d1116f8f164212aa',
  appleWatch: '69319145d1116f8f164212ad',
  samsungWatch: '69319145d1116f8f164212b0',
  xiaomiWatch: '69319145d1116f8f164212b3',
  // Laptop
  laptop: '69319145d1116f8f164212b9',
  laptopAsus: '69319145d1116f8f164212bc',
  asusVivobook: '69319145d1116f8f164212bf',
  asusZenbook: '69319145d1116f8f164212c2',
  asusTuf: '69319145d1116f8f164212c5',
  asusRog: '69319145d1116f8f164212c8',
  laptopLenovo: '69319145d1116f8f164212cb',
  lenovoIdeapad: '69319145d1116f8f164212ce',
  lenovoThinkpad: '69319145d1116f8f164212d1',
  lenovoLoq: '69319145d1116f8f164212d4',
  lenovoLegion: '69319145d1116f8f164212d7',
  macbook: '69319145d1116f8f164212da',
  macbookAir: '69319145d1116f8f164212dd',
  macbookPro: '69319145d1116f8f164212e0',
  surfaceLaptop: '69319145d1116f8f164212e3',
  laptopHp: '69319145d1116f8f164212e6',
  laptopDell: '69319145d1116f8f164212e9',
  // Tablet
  tablet: '69319145d1116f8f1642132b',
  ipad: '69319145d1116f8f1642132e',
  tabletSamsung: '69319145d1116f8f16421331',
  tabletXiaomi: '69319145d1116f8f16421334',
  surface: '69319145d1116f8f16421337',
  // Gaming
  gamingConsole: '69319145d1116f8f1642130d',
  xbox: '69319145d1116f8f16421316',
  // Monitor
  monitor: '69319145d1116f8f16421364',
  // Speaker
  speaker: '69319145d1116f8f16421370',
  bluetoothSpeaker: '69319145d1116f8f16421373',
  jblSpeaker: '69319145d1116f8f16421376',
  // Camera
  camera: '69319145d1116f8f1642137c',
  digitalCamera: '69319145d1116f8f1642137f',
  // Charger / accessories
  phoneCharger: '69319145d1116f8f1642127c',
  wirelessCharger: '69319145d1116f8f16421280',
  chargingCable: '69319145d1116f8f16421289',
  powerBank: '69319145d1116f8f1642128c',
  // Home Appliances
  homeAppliances: '69319146d1116f8f164213a3',
  television: '69319146d1116f8f164213a6',
  samsungTv: '69319146d1116f8f164213a9',
  lgTv: '69319146d1116f8f164213ac',
  sonyTv: '69319146d1116f8f164213af',
  xiaomiTv: '69319146d1116f8f164213b2',
  refrigerator: '69319146d1116f8f164213bb',
  washingMachine: '69319146d1116f8f164213be',
  dishwasher: '69319146d1116f8f164213c1',
  kitchenAppliances: '69319146d1116f8f164213d0',
  // Fashion
  fashion: '69319146d1116f8f164213f4',
  sportsClothing: '69319146d1116f8f164214a5',
  shoes: '69319145d1116f8f16421412',
  sportsShoes: '69319145d1116f8f1642141b',
  // Beauty
  beautyHealth: '69319146d1116f8f1642142a',
  makeup: '69319146d1116f8f1642142d',
  skinCare: '69319146d1116f8f1642143c',
  hairCare: '69319146d1116f8f16421448',
  perfume: '69319146d1116f8f16421454',
  // Tools
  tools: '69319146d1116f8f164214c3',
  powerTools: '69319146d1116f8f164214c6',
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
      CAT.television,
      CAT.samsungTv,
      CAT.homeAppliances,
      CAT.washingMachine,
      CAT.refrigerator,
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
      CAT.television,
      CAT.xiaomiTv,
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
    categories: [
      CAT.mobilePhone,
      CAT.headphones,
      CAT.sonyHeadphones,
      CAT.television,
      CAT.sonyTv,
      CAT.camera,
      CAT.digitalCamera,
    ],
  },
  {
    titleFa: 'ال جی',
    titleEn: 'LG',
    slug: 'lg',
    logo: '/images/brands/lg.png',
    categories: [
      CAT.mobilePhone,
      CAT.television,
      CAT.lgTv,
      CAT.homeAppliances,
      CAT.washingMachine,
      CAT.refrigerator,
    ],
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
    categories: [
      CAT.homeAppliances,
      CAT.washingMachine,
      CAT.dishwasher,
      CAT.kitchenAppliances,
      CAT.tools,
      CAT.powerTools,
    ],
  },
  {
    titleFa: 'پاناسونیک',
    titleEn: 'Panasonic',
    slug: 'panasonic',
    logo: '/images/brands/panasonic.png',
    categories: [CAT.homeAppliances, CAT.television, CAT.kitchenAppliances],
  },
  {
    titleFa: 'نایک',
    titleEn: 'Nike',
    slug: 'nike',
    logo: '/images/brands/nike.png',
    categories: [CAT.fashion, CAT.sportsClothing, CAT.shoes, CAT.sportsShoes],
  },
  {
    titleFa: 'آدیداس',
    titleEn: 'Adidas',
    slug: 'adidas',
    logo: '/images/brands/adidas.png',
    categories: [CAT.fashion, CAT.sportsClothing, CAT.shoes, CAT.sportsShoes],
  },
  {
    titleFa: 'لورآل',
    titleEn: "L'Oreal",
    slug: 'loreal',
    logo: '/images/brands/loreal.png',
    categories: [CAT.beautyHealth, CAT.makeup, CAT.skinCare, CAT.hairCare, CAT.perfume],
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
