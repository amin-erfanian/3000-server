const mongoose = require('mongoose');

const sellerProductSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Unique: one seller can only add a product once
sellerProductSchema.index({ seller: 1, product: 1 }, { unique: true });

const SellerProduct = mongoose.model('SellerProduct', sellerProductSchema);
module.exports = SellerProduct;
