/**
 * Seed Colors
 * Run: node seeds/colors.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Color = require('../models/color');

const forceReseed = process.argv.includes('--force');

// Use same connection as main app
const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

const COLORS = [
  { name: 'مشکی', nameEn: 'Black', hexCode: '#000000' },
  { name: 'سفید', nameEn: 'White', hexCode: '#FFFFFF' },
  { name: 'خاکستری', nameEn: 'Gray', hexCode: '#808080' },
  { name: 'نقره‌ای', nameEn: 'Silver', hexCode: '#C0C0C0' },
  { name: 'طلایی', nameEn: 'Gold', hexCode: '#FFD700' },
  { name: 'آبی', nameEn: 'Blue', hexCode: '#0066CC' },
  { name: 'آبی تیره', nameEn: 'Dark Blue', hexCode: '#00008B' },
  { name: 'آبی آسمانی', nameEn: 'Sky Blue', hexCode: '#87CEEB' },
  { name: 'قرمز', nameEn: 'Red', hexCode: '#FF0000' },
  { name: 'صورتی', nameEn: 'Pink', hexCode: '#FFC0CB' },
  { name: 'بنفش', nameEn: 'Purple', hexCode: '#800080' },
  { name: 'سبز', nameEn: 'Green', hexCode: '#008000' },
  { name: 'سبز تیره', nameEn: 'Dark Green', hexCode: '#006400' },
  { name: 'نارنجی', nameEn: 'Orange', hexCode: '#FFA500' },
  { name: 'زرد', nameEn: 'Yellow', hexCode: '#FFFF00' },
  { name: 'قهوه‌ای', nameEn: 'Brown', hexCode: '#8B4513' },
  { name: 'بژ', nameEn: 'Beige', hexCode: '#F5F5DC' },
  { name: 'کرم', nameEn: 'Cream', hexCode: '#FFFDD0' },
  { name: 'تیتانیوم', nameEn: 'Titanium', hexCode: '#878681' },
  { name: 'رزگلد', nameEn: 'Rose Gold', hexCode: '#B76E79' },
];

async function seedColors() {
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
        console.log(`⏭️  Skip: ${color.name}`);
        continue;
      }

      await Color.create({ ...color, isActive: true });
      console.log(`✓ ${color.name} (${color.hexCode})`);
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
