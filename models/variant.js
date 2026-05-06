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

    // Field-specific rejection issues
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

module.exports = mongoose.models.Variant || mongoose.model('Variant', variantSchema);
