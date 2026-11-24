import express from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', protect, requireAdmin, getAllCoupons);
router.post('/', protect, requireAdmin, createCoupon);
router.put('/:id', protect, requireAdmin, updateCoupon);
router.delete('/:id', protect, requireAdmin, deleteCoupon);

export default router;
