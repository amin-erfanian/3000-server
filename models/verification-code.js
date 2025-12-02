const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    password: {
      type: String,
    },
    profile: {
      firstName: { type: String },
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);
