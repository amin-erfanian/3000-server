// utilities/generate-seller-code.js
const Seller = require('../models/seller');

/**
 * Generates a unique 6-digit code for a seller.
 * Checks for uniqueness in the database before returning.
 * @returns {Promise<string>} A unique 6-digit code
 */
async function generateSellerCode() {
  let code;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 6-digit number
    code = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if this code already exists
    const existingSeller = await Seller.findOne({ code });
    if (!existingSeller) {
      isUnique = true;
    }
  }

  return code;
}

module.exports = { generateSellerCode };
