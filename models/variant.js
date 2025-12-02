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

    // Variant Identification
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
    themes: {
      type: [
        {
          label: String,
          type: {
            type: String,
            enum: ['colored', 'text', 'image'],
          },
          value: mongoose.Schema.Types.Mixed,
          isMain: Boolean,
        },
      ],
      default: [],
    },

    // Pricing
    price: {
      sellingPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      rrpPrice: {
        type: Number,
        default: 0,
      },
      costPrice: {
        type: Number,
        default: 0,
      },
      discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      isIncredible: {
        type: Boolean,
        default: false,
      },
      isPromotion: {
        type: Boolean,
        default: false,
      },
    },

    // Order limits
    orderLimit: {
      min: {
        type: Number,
        default: 1,
      },
      max: {
        type: Number,
        default: 10,
      },
    },

    // Inventory
    stock: {
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
      reservedQuantity: {
        type: Number,
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
      },
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

    // Properties
    properties: {
      isFastShipping: {
        type: Boolean,
        default: false,
      },
      isShipBySeller: {
        type: Boolean,
        default: false,
      },
      isMultiWarehouse: {
        type: Boolean,
        default: false,
      },
      hasSimilarVariants: {
        type: Boolean,
        default: false,
      },
      isRural: {
        type: Boolean,
        default: false,
      },
      inDigikalaWarehouse: {
        type: Boolean,
        default: false,
      },
      isShipBySellerRestricted: {
        type: Boolean,
        default: false,
      },
    },

    // Ranking
    rank: {
      type: Number,
      default: 0,
    },
    rate: {
      type: Number,
      default: 0,
    },

    // Statistics
    statistics: {
      salesCount: {
        type: Number,
        default: 0,
      },
      viewCount: {
        type: Number,
        default: 0,
      },
    },

    // Images specific to this variant
    images: {
      type: [
        {
          url: String,
          webpUrl: String,
        },
      ],
      default: [],
    },

    // Badges
    badges: {
      type: [
        {
          type: String,
          title: String,
          icon: String,
        },
      ],
      default: [],
    },

    // Price history tracking
    hasImporterPrice: {
      type: Boolean,
      default: false,
    },
    manufacturePriceNotExist: {
      type: Boolean,
      default: false,
    },
    hasBestPriceInLastMonth: {
      type: Boolean,
      default: false,
    },
    minPriceInLastMonth: {
      type: Number,
      default: 0,
    },

    // Admin
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Compound indexes for common queries
variantSchema.index({ product: 1, seller: 1 });
variantSchema.index({ product: 1, status: 1, 'price.sellingPrice': 1 });
variantSchema.index({ seller: 1, status: 1 });
variantSchema.index({ product: 1, color: 1 });

// Pre-save hook to calculate discount
variantSchema.pre('save', function (next) {
  if (this.price.rrpPrice > 0 && this.price.sellingPrice < this.price.rrpPrice) {
    this.price.discountPercent = Math.round(
      ((this.price.rrpPrice - this.price.sellingPrice) / this.price.rrpPrice) * 100,
    );
  } else {
    this.price.discountPercent = 0;
  }
  next();
});

// Post-save hook to update product price range
variantSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  if (product) {
    await product.updatePriceRange();
  }
});

// Method to check stock availability
variantSchema.methods.isAvailable = function (quantity = 1) {
  const availableStock = this.stock.quantity - this.stock.reservedQuantity;
  return this.status === 'marketable' && availableStock >= quantity;
};

// Method to reserve stock
variantSchema.methods.reserveStock = async function (quantity) {
  if (!this.isAvailable(quantity)) {
    throw new Error('Insufficient stock');
  }
  this.stock.reservedQuantity += quantity;
  await this.save();
};

// Method to release reserved stock
variantSchema.methods.releaseStock = async function (quantity) {
  this.stock.reservedQuantity = Math.max(0, this.stock.reservedQuantity - quantity);
  await this.save();
};

// Method to confirm sale (deduct stock)
variantSchema.methods.confirmSale = async function (quantity) {
  this.stock.quantity -= quantity;
  this.stock.reservedQuantity -= quantity;
  this.statistics.salesCount += quantity;

  // Update status if out of stock
  if (this.stock.quantity <= 0) {
    this.status = 'out_of_stock';
  }

  await this.save();
};

// Static method to find best variant for a product (Buy Box)
variantSchema.statics.getBuyBox = async function (productId) {
  return this.findOne({
    product: productId,
    status: 'marketable',
    isActive: true,
    isDeleted: false,
  })
    .sort({ 'price.sellingPrice': 1, rank: -1 })
    .populate('seller', 'title code rating stars grade properties')
    .populate('color')
    .populate('warranty');
};

// Static method to get all active variants for a product
variantSchema.statics.getProductVariants = async function (productId) {
  return this.find({
    product: productId,
    isActive: true,
    isDeleted: false,
  })
    .sort({ 'price.sellingPrice': 1 })
    .populate('seller', 'title code rating stars grade properties')
    .populate('color')
    .populate('warranty');
};

const Variant = mongoose.model('Variant', variantSchema);
module.exports = Variant;
