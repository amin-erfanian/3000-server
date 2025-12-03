const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Relationships
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Rating & Content
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },

    // Media
    images: {
      type: [
        {
          url: String,
          thumbnailUrl: String,
        },
      ],
      default: [],
    },
    videos: {
      type: [
        {
          url: String,
          thumbnailUrl: String,
        },
      ],
      default: [],
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
