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
    logo: {
      type: String,
      default: '',
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

brandSchema.index({ categories: 1, isActive: 1 });

const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
