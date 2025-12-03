const mongoose = require('mongoose');
const Category = require('../models/category');
const { CATEGORY_TREE } = require('../constants');

// Check for --force flag
const forceReseed = process.argv.includes('--force');

async function seedCategories() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/3000-db';

  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Check if categories already exist
    const existingCount = await Category.countDocuments();

    if (existingCount > 0 && !forceReseed) {
      console.log(`ℹ️  Categories already exist (${existingCount} found)`);
      console.log('   Run with --force flag to clear and re-seed');
      console.log('   Example: node seeds/seed-categories.js --force\n');
      return;
    }

    if (forceReseed && existingCount > 0) {
      await Category.deleteMany({});
      console.log(`🗑️  Cleared ${existingCount} existing categories\n`);
    }

    let insertedCount = 0;

    // Recursive function to insert categories with proper parent references
    async function insertCategory(categoryData, parentId = null, depth = 0) {
      const indent = '  '.repeat(depth);

      // Check if already exists (by slug)
      const existing = await Category.findOne({ slug: categoryData.slug });
      if (existing) {
        console.log(`${indent}⏭️  Skip: ${categoryData.titleFa} (already exists)`);

        // Still process children with existing parent
        if (categoryData.children && categoryData.children.length > 0) {
          for (const child of categoryData.children) {
            await insertCategory(child, existing._id, depth + 1);
          }
        }
        return existing;
      }

      // Create new category
      const category = await Category.create({
        titleFa: categoryData.titleFa,
        titleEn: categoryData.titleEn || '',
        slug: categoryData.slug,
        parent: parentId,
        image: categoryData.image || '',
        returnReasonAlert: categoryData.returnReasonAlert || '',
        isActive: true,
      });

      insertedCount++;
      console.log(`${indent}✓ ${categoryData.titleFa}`);

      // Insert children recursively
      if (categoryData.children && categoryData.children.length > 0) {
        for (const child of categoryData.children) {
          await insertCategory(child, category._id, depth + 1);
        }
      }

      return category;
    }

    console.log('📂 Seeding categories...\n');

    // Insert all root categories
    for (const rootCategory of CATEGORY_TREE) {
      await insertCategory(rootCategory);
      console.log(''); // Empty line between root categories
    }

    // Final summary
    const totalCount = await Category.countDocuments();
    console.log('─'.repeat(40));
    console.log(`✅ Done! Inserted ${insertedCount} new categories`);
    console.log(`📊 Total categories in database: ${totalCount}`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

// Run the seeder
seedCategories();
