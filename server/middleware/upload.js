import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// Ensure uploads folder exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local disk storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, AVIF) are permitted.'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per image
  fileFilter,
});

// Helper to handle uploaded file to Cloudinary if configured, else return local URL
export const processUploadedFile = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'raza_shoe_palace',
        use_filename: true,
      });
      // Optionally clean up local temp file
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}
      return result.secure_url;
    } catch (err) {
      console.error('[Cloudinary] Upload failed, falling back to local file:', err.message);
      return `/uploads/${path.basename(file.path)}`;
    }
  }

  // Fallback to local URL
  return `/uploads/${path.basename(file.path)}`;
};

// Helper to remove obsolete or replaced images from Cloudinary or local disk
export const deleteUploadedFile = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;

  try {
    if (imageUrl.includes('cloudinary.com') && isCloudinaryConfigured) {
      // Extract public_id from Cloudinary URL (e.g. folder/filename without extension)
      const parts = imageUrl.split('/');
      const fileName = parts.pop().split('.')[0];
      const folderName = parts.pop();
      const publicId = `${folderName}/${fileName}`;
      await cloudinary.uploader.destroy(publicId);
    } else if (imageUrl.startsWith('/uploads/')) {
      const localPath = path.resolve('uploads', path.basename(imageUrl));
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  } catch (err) {
    console.warn('[Image Deletion Warning] Could not remove old image asset:', err.message);
  }
};
