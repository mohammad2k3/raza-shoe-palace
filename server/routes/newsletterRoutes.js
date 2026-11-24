import express from 'express';
import { subscribeNewsletter, getSubscribers } from '../controllers/newsletterController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', protect, requireAdmin, getSubscribers);

export default router;
