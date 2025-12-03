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

const Color = mongoose.model('Color', colorSchema);
module.exports = Color;
