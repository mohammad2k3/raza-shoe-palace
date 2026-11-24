import express from 'express';
import { getDashboardStats, getDetailedReports } from '../controllers/analyticsController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, requireAdmin, getDashboardStats);
router.get('/reports', protect, requireAdmin, getDetailedReports);

export default router;
