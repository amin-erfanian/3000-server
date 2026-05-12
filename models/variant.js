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

    barcode: {
      type: String,
      default: '',
    },

    sellerVariantId: {
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
      default: null,
    },

    // Stock
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    orderLimit: {
      type: Number,
      required: true,
      min: 1,
    },

    // Shipping
    leadTime: {
      type: Number,
      default: 0,
    },

    shipmentMethods: {
      shipMarket: {
        type: Boolean,
        default: false,
      },
      shipSeller: {
        type: Boolean,
        default: false,
      },
      threeHour: {
        type: Boolean,
        default: false,
      },
      warehouseDelivery: {
        type: String,
        enum: ['1day', '2day', null],
        default: null,
      },
      buyerDelivery: {
        type: String,
        enum: ['sameDay', '1day', '2day', null],
        default: null,
      },
      timeRange: {
        type: String,
        enum: ['2hour', '3hour', '6hour', '9hour', '12hour', null],
        default: null,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

variantSchema.index({ product: 1, seller: 1 });

variantSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

module.exports = mongoose.models.Variant || mongoose.model('Variant', variantSchema);
