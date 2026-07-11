/**
 * Master Seed Runner
 * Runs all seeds in the correct dependency order
 *
 * Usage:
 *   node seeds/index.js           # Seed all (skip existing)
 *   node seeds/index.js --force   # Clear and re-seed all
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Use same connection as main app
const DB_PORT = process.env.DB_PORT || 27017;
const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:${DB_PORT}/3000`;

// Import all seed functions
const { seedColors } = require('./colors');
const { seedWarranties } = require('./warranties');
const { seedBrands } = require('./brands');
const { seedSellers } = require('./sellers');
const { seedCategories } = require('./categories');
const { seedProducts } = require('./products');
const { seedVariants } = require('./variants');

const forceReseed = process.argv.includes('--force');

async function runAllSeeds() {
  if (forceReseed) {
    console.log('⚠️  FORCE MODE: Will clear and re-seed all data\n');
  }

  try {
    // Connect once for all seeds
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Run seeds in order (with dependencies)
    console.log('═══════════════════════════════════════════════════════');
    console.log('Step 1/7: Categories (no dependencies)');
    console.log('═══════════════════════════════════════════════════════');
    await runSeed(seedCategories, 'Categories');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('Step 2/7: Colors (no dependencies)');
    console.log('═══════════════════════════════════════════════════════');
    await runSeed(seedColors, 'Colors');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('Step 3/7: Warranties (no dependencies)');
    console.log('═══════════════════════════════════════════════════════');
    await runSeed(seedWarranties, 'Warranties');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('Step 4/7: Brands (no dependencies)');
    console.log('═══════════════════════════════════════════════════════');
    await runSeed(seedBrands, 'Brands');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('Step 5/7: Sellers (no dependencies)');
    console.log('═══════════════════════════════════════════════════════');
    await runSeed(seedSellers, 'Sellers');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('Step 6/7: Products (needs: Categories, Brands)');
    console.log('═══════════════════════════════════════════════════════');
    await runSeed(seedProducts, 'Products');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('Step 7/7: Variants (needs: Products, Sellers, Colors, Warranties)');
    console.log('═══════════════════════════════════════════════════════');
    await runSeed(seedVariants, 'Variants');

    // Final summary
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║           ✅ ALL SEEDS COMPLETED                   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    await printSummary();
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

// Helper to run individual seed with shared connection
async function runSeed(seedFn, name) {
  try {
    // Modify the seed function to skip connect/disconnect
    // since we're already connected
    const originalConnect = mongoose.connect;
    const originalDisconnect = mongoose.disconnect;

    mongoose.connect = async () => mongoose.connection;
    mongoose.disconnect = async () => {};

    await seedFn();

    mongoose.connect = originalConnect;
    mongoose.disconnect = originalDisconnect;
  } catch (error) {
    console.error(`❌ Error in ${name}:`, error.message);
  }
}

// Print final summary with counts
async function printSummary() {
  const Category = require('../models/category');
  const Color = require('../models/color');
  const Warranty = require('../models/warranty');
  const Brand = require('../models/brand');
  const Seller = require('../models/seller');
  const Product = require('../models/product');
  const Variant = require('../models/Variant');

  const counts = {
    categories: await Category.countDocuments(),
    colors: await Color.countDocuments(),
    warranties: await Warranty.countDocuments(),
    brands: await Brand.countDocuments(),
    sellers: await Seller.countDocuments(),
    products: await Product.countDocuments(),
    variants: await Variant.countDocuments(),
  };

  console.log('📊 Database Summary:');
  console.log('─'.repeat(40));
  console.log(`   Categories: ${counts.categories}`);
  console.log(`   Colors:     ${counts.colors}`);
  console.log(`   Warranties: ${counts.warranties}`);
  console.log(`   Brands:     ${counts.brands}`);
  console.log(`   Sellers:    ${counts.sellers}`);
  console.log(`   Products:   ${counts.products}`);
  console.log(`   Variants:   ${counts.variants}`);
  console.log('─'.repeat(40));
  console.log(`   Total:      ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
}

// Run
runAllSeeds();
