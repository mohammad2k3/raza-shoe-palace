import express from 'express';
import { upload, processUploadedFile } from '../middleware/upload.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Single image upload
router.post('/single', protect, requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }
    const url = await processUploadedFile(req.file);
    res.status(200).json({ success: true, url });
  } catch (error) {
    next(error);
  }
});

// Multiple images upload (up to 6 images at once)
router.post('/multiple', protect, requireAdmin, upload.array('images', 6), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }
    const urls = await Promise.all(req.files.map((file) => processUploadedFile(file)));
    res.status(200).json({ success: true, urls });
  } catch (error) {
    next(error);
  }
});

export default router;
