const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: '',
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientPhone: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      default: '',
    },
    addressLine: {
      type: String,
      required: true,
    },
    houseNumber: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
    postalCode: {
      type: String,
      default: '',
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      default: '',
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        default: '',
      },
      avatar: {
        type: String,
        default: '',
      },
      gender: {
        type: String,
        enum: ['', 'male', 'female', 'other'],
        default: '',
      },
      birthdate: {
        type: String,
        default: '',
      },
      nationalId: {
        type: String,
        default: '',
      },
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    favorites: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      default: [],
    },
    notifications: {
      sms: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
