export const validateEnv = () => {
  const missing = [];

  if (!process.env.MONGODB_URI) {
    console.warn('[Config Warning] MONGODB_URI not specified. Using default: mongodb://127.0.0.1:27017/raza_shoe_palace');
  }

  if (!process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  } else if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    console.warn('[Security Warning] JWT_SECRET in production should be at least 32 characters for HMAC SHA-256 safety.');
  }

  // Non-fatal third-party services warnings
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.info('[Payment Gateway] Razorpay keys not configured. System will default to Cash on Delivery (COD).');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.info('[Media Storage] Cloudinary keys not configured. System will use secure local disk storage (/uploads).');
  }

  if (missing.length > 0) {
    throw new Error(`CRITICAL CONFIGURATION ERROR: Missing required environment variable(s): ${missing.join(', ')}`);
  }
};
