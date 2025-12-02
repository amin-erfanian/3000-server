const User = require('./user');
const Asset = require('./asset');
const Budget = require('./budget');
const Loan = require('./loan');
const Notification = require('./notification');
const Resource = require('./resource');
const Subscription = require('./subscription');
const Transaction = require('./transaction');
const VerificationCode = require('./verification-code');

// E-commerce Models (Digikala-style)
const Brand = require('./brand');
const Category = require('./category');
const Color = require('./color');
const Product = require('./product');
const Review = require('./review');
const Seller = require('./seller');
const Variant = require('./variant');
const Warranty = require('./warranty');

module.exports = {
  // Core Models
  User,
  Asset,
  Budget,
  Loan,
  Notification,
  Resource,
  Subscription,
  Transaction,
  VerificationCode,

  // E-commerce Models
  Brand,
  Category,
  Color,
  Product,
  Review,
  Seller,
  Variant,
  Warranty,
};
