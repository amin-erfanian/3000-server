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

    sku: {
      type: String,
      default: '',
      index: true,
    },

    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    weight: {
      type: Number,
      default: 0,
    },

    // Pricing
    referencePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
    },

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
    },

    minBasketQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    marketStatus: {
      type: String,
      enum: ['marketable', 'non-marketable', 'limited', 'pre-order'],
      default: 'marketable',
    },

    // Approval/Rejection fields
    rejectionReason: {
      field: {
        type: String,
        default: '',
      },
      message: {
        type: String,
        default: '',
      },
      rejectedAt: {
        type: Date,
      },
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      },
    },

    rejectionIssues: {
      type: [
        {
          field: String,
          message: String,
        },
      ],
      default: [],
    },

    approvalHistory: {
      type: [
        {
          action: {
            type: String,
            enum: ['approved', 'rejected'],
            required: true,
          },
          performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
          },
          performedAt: {
            type: Date,
            default: Date.now,
          },
          reason: {
            type: String,
            default: '',
          },
          field: {
            type: String,
            default: '',
          },
          issues: {
            type: [
              {
                field: String,
                message: String,
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    approvedAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'inactive'],
      default: 'pending',
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

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
