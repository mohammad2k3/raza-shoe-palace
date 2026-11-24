import express from 'express';
import {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  getAllCustomers,
} from '../controllers/authController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/admin-login', authLimiter, adminLogin);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

router.get('/customers', protect, requireAdmin, getAllCustomers);

export default router;
