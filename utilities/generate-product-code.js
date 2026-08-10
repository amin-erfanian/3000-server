const Product = require('../models/product');

function generateCode() {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `stp-${digits}`;
}

async function generateProductCode() {
  let code = generateCode();
  let exists = await Product.exists({ code });

  while (exists) {
    code = generateCode();
    exists = await Product.exists({ code });
  }

  return code;
}

module.exports = generateProductCode;
