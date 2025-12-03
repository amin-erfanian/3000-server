/**
 * Seed Colors
 * Run: node seeds/colors.js
 */

const mongoose = require('mongoose');
const Color = require('../models/color');

const forceReseed = process.argv.includes('--force');

const COLORS = [
  { title: 'مشکی', titleEn: 'Black', hexCode: '#000000' },
  { title: 'سفید', titleEn: 'White', hexCode: '#FFFFFF' },
  { title: 'خاکستری', titleEn: 'Gray', hexCode: '#808080' },
  { title: 'نقره‌ای', titleEn: 'Silver', hexCode: '#C0C0C0' },
  { title: 'طلایی', titleEn: 'Gold', hexCode: '#FFD700' },
  { title: 'آبی', titleEn: 'Blue', hexCode: '#0066CC' },
  { title: 'آبی تیره', titleEn: 'Dark Blue', hexCode: '#00008B' },
  { title: 'آبی آسمانی', titleEn: 'Sky Blue', hexCode: '#87CEEB' },
  { title: 'قرمز', titleEn: 'Red', hexCode: '#FF0000' },
  { title: 'صورتی', titleEn: 'Pink', hexCode: '#FFC0CB' },
  { title: 'بنفش', titleEn: 'Purple', hexCode: '#800080' },
  { title: 'سبز', titleEn: 'Green', hexCode: '#008000' },
  { title: 'سبز تیره', titleEn: 'Dark Green', hexCode: '#006400' },
  { title: 'نارنجی', titleEn: 'Orange', hexCode: '#FFA500' },
  { title: 'زرد', titleEn: 'Yellow', hexCode: '#FFFF00' },
  { title: 'قهوه‌ای', titleEn: 'Brown', hexCode: '#8B4513' },
  { title: 'بژ', titleEn: 'Beige', hexCode: '#F5F5DC' },
  { title: 'کرم', titleEn: 'Cream', hexCode: '#FFFDD0' },
  { title: 'تیتانیوم', titleEn: 'Titanium', hexCode: '#878681' },
  { title: 'رزگلد', titleEn: 'Rose Gold', hexCode: '#B76E79' },
];

async function seedColors() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/3000-db';

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const existingCount = await Color.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Colors already exist (${existingCount} found)`);
      console.log('   Run with --force to re-seed\n');
      return;
    }

    if (forceReseed && existingCount > 0) {
      await Color.deleteMany({});
      console.log(`🗑️  Cleared ${existingCount} existing colors\n`);
    }

    console.log('🎨 Seeding colors...\n');

    for (const color of COLORS) {
      const existing = await Color.findOne({ hexCode: color.hexCode });
      if (existing) {
        console.log(`⏭️  Skip: ${color.title}`);
        continue;
      }

      await Color.create({ ...color, isActive: true });
      console.log(`✓ ${color.title} (${color.hexCode})`);
    }

    const totalCount = await Color.countDocuments();
    console.log(`\n✅ Done! Total colors: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { COLORS, seedColors };

if (require.main === module) {
  seedColors();
}

