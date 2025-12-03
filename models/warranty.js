const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema(
  {
    titleFa: {
      type: String,
      required: true,
    },
    titleEn: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      value: {
        type: Number,
        default: 0,
      },
      unit: {
        type: String,
        enum: ['day', 'month', 'year'],
        default: 'month',
      },
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

const Warranty = mongoose.model('Warranty', warrantySchema);
module.exports = Warranty;
