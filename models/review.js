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
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },

    // Rating
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review Content
    title: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Recommendation
    isRecommended: {
      type: Boolean,
      default: true,
    },

    // Pros and Cons
    advantages: {
      type: [String],
      default: [],
    },
    disadvantages: {
      type: [String],
      default: [],
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

    // Verification
    isPurchaseVerified: {
      type: Boolean,
      default: false,
    },

    // Moderation
    isApproved: {
      type: Boolean,
      default: false,
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    moderationNote: {
      type: String,
      default: '',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: {
      type: Date,
    },

    // Helpfulness
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulVotes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        isHelpful: Boolean,
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Seller Response
    sellerResponse: {
      comment: {
        type: String,
        default: '',
      },
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // Admin
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ helpfulCount: -1 });

// Post-save hook to update product rating
reviewSchema.post('save', async function () {
  if (this.isApproved) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    if (product) {
      await product.updateRating();
    }
  }
});

// Post-remove hook to update product rating
reviewSchema.post('remove', async function () {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  if (product) {
    await product.updateRating();
  }
});

// Method to vote helpful
reviewSchema.methods.voteHelpful = async function (userId, isHelpful) {
  // Check if user already voted
  const existingVoteIndex = this.helpfulVotes.findIndex(
    (v) => v.user.toString() === userId.toString()
  );

  if (existingVoteIndex > -1) {
    const oldVote = this.helpfulVotes[existingVoteIndex];
    
    // Remove old vote counts
    if (oldVote.isHelpful) {
      this.helpfulCount--;
    } else {
      this.notHelpfulCount--;
    }

    // Update vote
    this.helpfulVotes[existingVoteIndex].isHelpful = isHelpful;
    this.helpfulVotes[existingVoteIndex].votedAt = new Date();
  } else {
    // Add new vote
    this.helpfulVotes.push({
      user: userId,
      isHelpful,
      votedAt: new Date(),
    });
  }

  // Update counts
  if (isHelpful) {
    this.helpfulCount++;
  } else {
    this.notHelpfulCount++;
  }

  await this.save();
};

// Static method to get product reviews with pagination
reviewSchema.statics.getProductReviews = async function (productId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    rating = null,
    hasImages = null,
  } = options;

  const query = {
    product: productId,
    isApproved: true,
    isActive: true,
    isDeleted: false,
  };

  if (rating) {
    query.rating = rating;
  }

  if (hasImages === true) {
    query['images.0'] = { $exists: true };
  }

  const reviews = await this.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'profile.firstName')
    .lean();

  const total = await this.countDocuments(query);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Static method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function (productId) {
  const distribution = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
        isActive: true,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  // Format result
  const result = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((d) => {
    result[d._id] = d.count;
  });

  return result;
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

