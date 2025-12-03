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
    alt: {
      type: String,
      default: '',
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
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
      required: true,
      unique: true,
      index: true,
    },
    description: {
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

    // Images (array of URLs)
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

    // Rating (aggregated from reviews)
    rating: {
      average: {
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

    properties: {
      isFastShipping: {
        type: Boolean,
        default: false,
      },
      isFake: {
        type: Boolean,
        default: false,
      },
      isAd: {
        type: Boolean,
        default: false,
      },
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'inactive'],
      default: 'draft',
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

// Text search index
productSchema.index({ titleFa: 'text', titleEn: 'text', description: 'text' });

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

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
