/**
 * Renames the product `sku` field to `pid`, including admin rejection reasons
 * that point at it, and drops the old `sku` index.
 * Safe to run more than once: already migrated products are not matched.
 *
 * Usage:
 *   node seeds/migrate-product-pid.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const DB_PORT = process.env.DB_PORT;
const DB_PASS = process.env.DB_PASS;

async function migrate() {
  await mongoose.connect(`mongodb://admin:${DB_PASS}@localhost:${DB_PORT}/store3000?authSource=admin`);

  // Uses the raw collection, because the Product model no longer has `sku`
  const products = mongoose.connection.collection('products');

  const renamed = await products.updateMany({ sku: { $exists: true } }, { $rename: { sku: 'pid' } });
  const rejections = await products.updateMany(
    { 'rejectionReasons.property': 'sku' },
    { $set: { 'rejectionReasons.$[reason].property': 'pid' } },
    { arrayFilters: [{ 'reason.property': 'sku' }] },
  );

  await products.updateMany(
    { 'approvalHistory.rejectionReasons.property': 'sku' },
    { $set: { 'approvalHistory.$[].rejectionReasons.$[reason].property': 'pid' } },
    { arrayFilters: [{ 'reason.property': 'sku' }] },
  );

  if (await products.indexExists('sku_1')) await products.dropIndex('sku_1');

  console.log(`✓ Renamed sku on ${renamed.modifiedCount} products`);
  console.log(`✓ Updated rejection reasons on ${rejections.modifiedCount} products`);
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
