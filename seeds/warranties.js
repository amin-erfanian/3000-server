/**
 * Seed Warranties
 * Run: node seeds/warranties.js
 */

const mongoose = require('mongoose');
const Warranty = require('../models/warranty');

const forceReseed = process.argv.includes('--force');

const WARRANTIES = [
  {
    titleFa: 'گارانتی ۱۸ ماهه شرکتی',
    titleEn: '18 Month Official',
    description: 'گارانتی رسمی شرکتی',
    duration: { value: 18, unit: 'month' },
  },
  {
    titleFa: 'گارانتی ۲۴ ماهه شرکتی',
    titleEn: '24 Month Official',
    description: 'گارانتی رسمی دو ساله',
    duration: { value: 24, unit: 'month' },
  },
  {
    titleFa: 'گارانتی ۱۲ ماهه',
    titleEn: '12 Month',
    description: 'گارانتی یک ساله',
    duration: { value: 12, unit: 'month' },
  },
  {
    titleFa: 'گارانتی ۶ ماهه',
    titleEn: '6 Month',
    description: 'گارانتی شش ماهه',
    duration: { value: 6, unit: 'month' },
  },
  {
    titleFa: 'بدون گارانتی',
    titleEn: 'No Warranty',
    description: 'بدون گارانتی',
    duration: { value: 0, unit: 'month' },
  },
  {
    titleFa: 'گارانتی مادام‌العمر',
    titleEn: 'Lifetime',
    description: 'گارانتی مادام‌العمر',
    duration: { value: 100, unit: 'year' },
  },
  {
    titleFa: 'گارانتی ۳۶ ماهه',
    titleEn: '36 Month',
    description: 'گارانتی سه ساله',
    duration: { value: 36, unit: 'month' },
  },
];

async function seedWarranties() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/3000-db';

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const existingCount = await Warranty.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Warranties already exist (${existingCount} found)`);
      console.log('   Run with --force to re-seed\n');
      return;
    }

    if (forceReseed && existingCount > 0) {
      await Warranty.deleteMany({});
      console.log(`🗑️  Cleared ${existingCount} existing warranties\n`);
    }

    console.log('📜 Seeding warranties...\n');

    for (const warranty of WARRANTIES) {
      const existing = await Warranty.findOne({ titleFa: warranty.titleFa });
      if (existing) {
        console.log(`⏭️  Skip: ${warranty.titleFa}`);
        continue;
      }

      await Warranty.create({ ...warranty, isActive: true });
      console.log(`✓ ${warranty.titleFa}`);
    }

    const totalCount = await Warranty.countDocuments();
    console.log(`\n✅ Done! Total warranties: ${totalCount}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { WARRANTIES, seedWarranties };

if (require.main === module) {
  seedWarranties();
}
