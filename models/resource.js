const mongoose = require('mongoose');
const CustomError = require('../classes/custom-error');
const { safeDecrypt } = require('../utilities/crypto');

const ResourceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    currentBalance: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['bank', 'cash'],
      default: 'bank',
    },
    cardNumber: {
      type: String,
    },
    lastModified: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
    },
  },
  {
    versionKey: false,
  },
);

ResourceSchema.methods.toJSON = function () {
  const obj = this.toObject();

  try {
    obj.name = safeDecrypt(obj.name);
    obj.currentBalance = Number(safeDecrypt(obj.currentBalance));
  } catch (error) {
    throw new CustomError(
      500,
      'DECRYPTION_FAIL',
      {
        fa: 'رمزگشایی اطلاعات منبع مالی با خطا مواجه شد',
        en: 'Resource decryption failed.',
      },
      error,
    );
  }

  return obj;
};

module.exports = mongoose.model('Resource', ResourceSchema);
