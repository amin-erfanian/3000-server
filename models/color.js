const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      default: '',
    },
    hexCode: {
      type: String,
      required: true,
    },
    isMultiColor: {
      type: Boolean,
      default: false,
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

const Color = mongoose.model('Color', colorSchema);
module.exports = Color;

