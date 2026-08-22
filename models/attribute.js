const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    header: {
      type: String,
      index: true,
      required: false,
      default: '',
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: {
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

const Attribute = mongoose.model('Attribute', attributeSchema);
module.exports = Attribute;
