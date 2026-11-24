import express from 'express';
import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getOrder,
  getMyOrders,
  cancelOrder,
  requestReturn,
  getAllOrdersAdmin,
  updateOrderStatus,
  updatePaymentStatus,
} from '../controllers/orderController.js';
import { protect, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { orderLimiter } from '../middleware/security.js';

const router = express.Router();

// Order creation & online payment endpoints (protected by orderLimiter)
router.post('/', orderLimiter, optionalAuth, createOrder);
router.post('/:id/razorpay-order', orderLimiter, optionalAuth, createRazorpayOrder);
router.post('/:id/verify-payment', orderLimiter, optionalAuth, verifyRazorpayPayment);

// Razorpay asynchronous Webhook receiver
router.post('/webhook/razorpay', handleRazorpayWebhook);

// Order tracking and retrieval
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', protect, requireAdmin, getAllOrdersAdmin);
router.get('/:identifier', optionalAuth, getOrder);

// Order lifecycle actions
router.post('/:id/cancel', optionalAuth, cancelOrder);
router.post('/:id/return', protect, requestReturn);

// Admin-only order status controls
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);
router.put('/:id/payment-status', protect, requireAdmin, updatePaymentStatus);

export default router;
