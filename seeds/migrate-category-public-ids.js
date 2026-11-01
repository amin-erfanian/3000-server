/**
 * Converts category publicIds from strings to { id, description } objects.
 * Safe to run more than once: entries that are already objects are kept as is.
 *
 * Usage:
 *   node seeds/migrate-category-public-ids.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const DB_PORT = process.env.DB_PORT;
const DB_PASS = process.env.DB_PASS;

async function migrate() {
  await mongoose.connect(`mongodb://admin:${DB_PASS}@localhost:${DB_PORT}/store3000?authSource=admin`);

  // Uses the raw collection, because the Category model can't read the old format
  const categories = mongoose.connection.collection('categories');
  const legacyCategories = await categories.find({ publicIds: { $type: 'string' } }).toArray();

  for (const category of legacyCategories) {
    const publicIds = category.publicIds.map((publicId) =>
      typeof publicId === 'string' ? { id: publicId, description: '' } : publicId,
    );
    await categories.updateOne({ _id: category._id }, { $set: { publicIds } });
  }

  console.log(`✓ Migrated ${legacyCategories.length} categories`);
}

migrate()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
