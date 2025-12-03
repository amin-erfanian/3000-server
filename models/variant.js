const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    // Relationships
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Color',
    },
    warranty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warranty',
    },

    // Variant attributes
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    barcode: {
      type: String,
      default: '',
    },

    // Size/Theme attributes
    size: {
      type: String,
      default: '',
    },

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },

    // Stock
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['marketable', 'out_of_stock', 'discontinued', 'pending'],
      default: 'pending',
      index: true,
    },

    // Shipping
    leadTime: {
      type: Number,
      default: 0,
    },
    shipmentMethods: {
      description: {
        type: String,
        default: '',
      },
      hasLeadTime: {
        type: Boolean,
        default: false,
      },
      providers: {
        type: [
          {
            type: {
              type: String,
              enum: ['3000', 'seller', 'express', 'post'],
            },
            title: String,
            description: String,
            shippingMode: String,
            deliveryDay: String,
            price: {
              value: Number,
              isFree: Boolean,
              text: String,
            },
          },
        ],
        default: [],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Compound index for product-seller combination
variantSchema.index({ product: 1, seller: 1 });

// Virtual for stock status
variantSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

const Variant = mongoose.model('Variant', variantSchema);
module.exports = Variant;
