import express from 'express';
import {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getActiveBanners);
router.get('/admin/all', protect, requireAdmin, getAllBannersAdmin);

router.post('/', protect, requireAdmin, createBanner);
router.put('/:id', protect, requireAdmin, updateBanner);
router.delete('/:id', protect, requireAdmin, deleteBanner);

export default router;
