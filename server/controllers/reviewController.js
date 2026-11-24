import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved',
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews, count: reviews.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review (verified purchase required)
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Rating, title, and review comments are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this product.' });
    }

    // Check verified purchase in completed / delivered orders
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      orderStatus: 'Delivered',
      'items.product': productId,
    });

    if (!deliveredOrder) {
      return res.status(403).json({
        success: false,
        message: 'Only customers who have purchased and received this product can submit a verified review.',
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      isVerifiedPurchase: true,
      status: 'approved', // verified buyer auto approved or pending moderation
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your verified review!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all reviews for moderation
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name images slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update review status (approve/reject)
// @route   PATCH /api/reviews/:id/status
// @access  Private/Admin
export const updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.status = status;
    await review.save();

    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Trigger average rating recalculation
    await Review.calculateAverageRating(review.product);

    res.status(200).json({ success: true, message: 'Review removed successfully.' });
  } catch (error) {
    next(error);
  }
};
