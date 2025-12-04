const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const CustomError = require('../classes/custom-error');

// GET all reviews
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, status, product, user, rating } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (product) {
    filter.product = product;
  }

  if (user) {
    filter.user = user;
  }

  if (rating) {
    filter.rating = parseInt(rating);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('product', 'titleFa titleEn slug images.main')
      .populate('user', 'profile.firstName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments(filter),
  ]);

  res.json({
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET review by ID
router.get('/:id', async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('product', 'titleFa titleEn slug images.main')
    .populate('user', 'profile.firstName');

  if (!review) {
    throw new CustomError(404, 'NOT_FOUND', {
      fa: 'نظر یافت نشد.',
      en: 'Review not found.',
    });
  }

  res.json(review);
});

module.exports = router;

