const mongoose = require('mongoose');

const processRuleSchema = new mongoose.Schema(
  {
    widthFrom: { type: Number, required: true },
    widthTo: { type: Number, required: true },
    heightFrom: { type: Number, required: true },
    heightTo: { type: Number, required: true },
    lengthFrom: { type: Number, required: true },
    lengthTo: { type: Number, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ProcessRule', processRuleSchema);
