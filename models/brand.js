const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
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
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],
    sellers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        index: true,
      },
    ],
    logo: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Approval/Rejection fields
    rejectionReason: {
      propertyKeys: {
        type: [String],
        default: [],
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

    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

brandSchema.index({ categories: 1, isActive: 1 });

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
