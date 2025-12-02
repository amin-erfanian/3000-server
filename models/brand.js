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
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    logo: {
      url: {
        type: String,
        default: '',
      },
      thumbnailUrl: {
        type: String,
        default: '',
      },
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isMiscellaneous: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Index for search
brandSchema.index({ titleFa: 'text', titleEn: 'text' });

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;

