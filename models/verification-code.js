const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    panel: {
      type: String,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
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

VerificationCodeSchema.index({ phone: 1, panel: 1 }, { unique: true });
// Mongo removes expired codes on its own (checked about once a minute)
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);
