const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    webpUrl: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const specificationAttributeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    values: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const specificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    attributes: {
      type: [specificationAttributeSchema],
      default: [],
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    titleFa: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
    },

    // Relationships
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      index: true,
    },

    // Status
    status: {
      type: String,
      enum: ['draft', 'pending', 'marketable', 'out_of_stock', 'discontinued'],
      default: 'draft',
      index: true,
    },
    productType: {
      type: String,
      enum: ['product', 'service', 'digital'],
      default: 'product',
    },

    // Media
    images: {
      main: imageSchema,
      gallery: {
        type: [imageSchema],
        default: [],
      },
    },
    videos: {
      type: [
        {
          url: String,
          thumbnailUrl: String,
          title: String,
        },
      ],
      default: [],
    },

    // Specifications
    specifications: {
      type: [specificationSchema],
      default: [],
    },

    // Review Attributes (Quick specs shown in listing)
    reviewAttributes: {
      type: [specificationAttributeSchema],
      default: [],
    },

    // Pros and Cons
    advantages: {
      type: [String],
      default: [],
    },
    disadvantages: {
      type: [String],
      default: [],
    },

    // Expert Review
    expertReview: {
      description: {
        type: String,
        default: '',
      },
      shortReview: {
        type: String,
        default: '',
      },
    },

    // Rating & Stats
    rating: {
      rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    suggestion: {
      count: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    questionsCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },

    // Product Properties/Flags
    properties: {
      isFastShipping: {
        type: Boolean,
        default: false,
      },
      isShipBySeller: {
        type: Boolean,
        default: false,
      },
      freeShippingBadge: {
        type: Boolean,
        default: false,
      },
      isMultiWarehouse: {
        type: Boolean,
        default: false,
      },
      isFake: {
        type: Boolean,
        default: false,
      },
      hasGift: {
        type: Boolean,
        default: false,
      },
      isNonInventory: {
        type: Boolean,
        default: false,
      },
      isAd: {
        type: Boolean,
        default: false,
      },
      isJetEligible: {
        type: Boolean,
        default: false,
      },
      isMedicalSupplement: {
        type: Boolean,
        default: false,
      },
      hasPrintedPrice: {
        type: Boolean,
        default: false,
      },
      hasTrueToSize: {
        type: Boolean,
        default: false,
      },
      hasSizeGuide: {
        type: Boolean,
        default: false,
      },
    },

    // Available colors for this product
    colors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Color',
      },
    ],

    // Tags for search
    tags: {
      type: [String],
      default: [],
    },

    // SEO
    seo: {
      title: {
        type: String,
        default: '',
      },
      description: {
        type: String,
        default: '',
      },
      canonicalUrl: {
        type: String,
        default: '',
      },
    },

    // Badges
    badges: {
      type: [
        {
          type: String,
          title: String,
          icon: String,
          color: String,
        },
      ],
      default: [],
    },

    // Digiplus services
    digiplus: {
      services: {
        type: [String],
        default: [],
      },
      isJetEligible: {
        type: Boolean,
        default: false,
      },
      cashBack: {
        type: Number,
        default: 0,
      },
    },

    // Price range (calculated from variants)
    priceRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },

    // Default variant reference (for quick access to best offer)
    defaultVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
    },

    // Admin & Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
productSchema.index({ titleFa: 'text', titleEn: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ 'priceRange.min': 1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ 'rating.rate': -1 });
productSchema.index({ createdAt: -1 });

// Virtual for variants
productSchema.virtual('variants', {
  ref: 'Variant',
  localField: '_id',
  foreignField: 'product',
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Method to update rating
productSchema.methods.updateRating = async function () {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: this._id, isApproved: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
        recommendCount: {
          $sum: { $cond: ['$isRecommended', 1, 0] },
        },
      },
    },
  ]);

  if (stats.length > 0) {
    this.rating.rate = Math.round(stats[0].avgRating * 10) / 10;
    this.rating.count = stats[0].count;
    this.suggestion.count = stats[0].recommendCount;
    this.suggestion.percentage = Math.round((stats[0].recommendCount / stats[0].count) * 100);
  } else {
    this.rating = { rate: 0, count: 0 };
    this.suggestion = { count: 0, percentage: 0 };
  }

  await this.save();
};

// Method to update price range from variants
productSchema.methods.updatePriceRange = async function () {
  const Variant = mongoose.model('Variant');
  const stats = await Variant.aggregate([
    { $match: { product: this._id, status: 'marketable' } },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price.sellingPrice' },
        maxPrice: { $max: '$price.sellingPrice' },
      },
    },
  ]);

  if (stats.length > 0) {
    this.priceRange.min = stats[0].minPrice;
    this.priceRange.max = stats[0].maxPrice;
  } else {
    this.priceRange = { min: 0, max: 0 };
  }

  await this.save();
};

// Static method to get full product with populated data
productSchema.statics.getFullProduct = async function (productId) {
  return this.findById(productId)
    .populate('category')
    .populate('brand')
    .populate('colors')
    .populate({
      path: 'variants',
      populate: [
        { path: 'seller', select: 'title code rating stars grade properties' },
        { path: 'color' },
        { path: 'warranty' },
      ],
    });
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
