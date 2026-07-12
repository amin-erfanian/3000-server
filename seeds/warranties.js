/**
 * Seed Warranties
 * Run: node seeds/warranties.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Warranty = require('../models/warranty');

const forceReseed = process.argv.includes('--force');

// Use same connection as main app
const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

const WARRANTIES = [
  {
    name: 'گارانتی ۱۸ ماهه شرکتی',
    nameEn: '18 Month Official',
    description: 'گارانتی رسمی شرکتی',
    duration: { value: 18, unit: 'month' },
  },
  {
    name: 'گارانتی ۲۴ ماهه شرکتی',
    nameEn: '24 Month Official',
    description: 'گارانتی رسمی دو ساله',
    duration: { value: 24, unit: 'month' },
  },
  {
    name: 'گارانتی ۱۲ ماهه',
    nameEn: '12 Month',
    description: 'گارانتی یک ساله',
    duration: { value: 12, unit: 'month' },
  },
  {
    name: 'گارانتی ۶ ماهه',
    nameEn: '6 Month',
    description: 'گارانتی شش ماهه',
    duration: { value: 6, unit: 'month' },
  },
  {
    name: 'بدون گارانتی',
    nameEn: 'No Warranty',
    description: 'بدون گارانتی',
    duration: { value: 0, unit: 'month' },
  },
  {
    name: 'گارانتی مادام‌العمر',
    nameEn: 'Lifetime',
    description: 'گارانتی مادام‌العمر',
    duration: { value: 100, unit: 'year' },
  },
  {
    name: 'گارانتی ۳۶ ماهه',
    nameEn: '36 Month',
    description: 'گارانتی سه ساله',
    duration: { value: 36, unit: 'month' },
  },
];

async function seedWarranties() {
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
      const existing = await Warranty.findOne({ name: warranty.name });
      if (existing) {
        console.log(`⏭️  Skip: ${warranty.name}`);
        continue;
      }

      await Warranty.create({ ...warranty, isActive: true });
      console.log(`✓ ${warranty.name}`);
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
