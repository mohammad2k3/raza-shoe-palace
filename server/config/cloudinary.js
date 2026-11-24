import { v2 as cloudinary } from 'cloudinary';

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Configured successfully with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Cloudinary] Credentials not provided; using built-in local static uploads directory as fallback.');
}

export { cloudinary, isConfigured as isCloudinaryConfigured };
