import express from 'express';
import {
  getProductReviews,
  addReview,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, addReview);

router.get('/admin/all', protect, requireAdmin, getAllReviewsAdmin);
router.patch('/:id/status', protect, requireAdmin, updateReviewStatus);
router.delete('/:id', protect, requireAdmin, deleteReview);

export default router;
