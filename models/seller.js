const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    contactInfo: {
      phone: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: '',
      },
      address: {
        type: String,
        default: '',
      },
      city: {
        type: String,
        default: '',
      },
      province: {
        type: String,
        default: '',
      },
      postalCode: {
        type: String,
        default: '',
      },
    },
    rating: {
      totalRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalCount: {
        type: Number,
        default: 0,
      },
      commitment: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      noReturn: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      onTimeShipping: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    stars: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    grade: {
      label: {
        type: String,
        enum: ['عالی', 'خوب', 'متوسط', 'ضعیف', ''],
        default: '',
      },
      color: {
        type: String,
        default: '#00a049',
      },
    },
    properties: {
      isTrusted: {
        type: Boolean,
        default: false,
      },
      isOfficial: {
        type: Boolean,
        default: false,
      },
      isRoosta: {
        type: Boolean,
        default: false,
      },
      isNew: {
        type: Boolean,
        default: true,
      },
    },
    bankInfo: {
      accountNumber: {
        type: String,
        default: '',
      },
      iban: {
        type: String,
        default: '',
      },
      accountHolder: {
        type: String,
        default: '',
      },
    },
    documents: {
      nationalId: {
        type: String,
        default: '',
      },
      businessLicense: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'rejected'],
      default: 'pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Index for search
sellerSchema.index({ title: 'text' });

// Virtual for formatted registration duration
sellerSchema.virtual('registrationDuration').get(function () {
  const now = new Date();
  const diff = now - this.registrationDate;
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));

  if (years > 0) {
    return `${years} سال و ${months} ماه`;
  }
  return `${months} ماه`;
});

// Method to update rating
sellerSchema.methods.updateRating = async function (newRating) {
  const totalCount = this.rating.totalCount + 1;
  const totalRate = ((this.rating.totalRate * this.rating.totalCount) + newRating) / totalCount;

  this.rating.totalCount = totalCount;
  this.rating.totalRate = Math.round(totalRate * 10) / 10;
  this.stars = Math.round((totalRate / 20) * 10) / 10; // Convert 0-100 to 0-5

  // Update grade based on rating
  if (totalRate >= 80) {
    this.grade = { label: 'عالی', color: '#00a049' };
  } else if (totalRate >= 60) {
    this.grade = { label: 'خوب', color: '#81bc00' };
  } else if (totalRate >= 40) {
    this.grade = { label: 'متوسط', color: '#ffc107' };
  } else {
    this.grade = { label: 'ضعیف', color: '#d32f2f' };
  }

  await this.save();
};

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;

