import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance = null;

if (keyId && keySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('[Razorpay] Initialized with Key ID:', keyId);
  } catch (error) {
    console.warn('[Razorpay] Failed to initialize:', error.message);
  }
} else {
  console.log('[Razorpay] Keys not configured in .env. Razorpay test mode can be enabled by setting RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

export { razorpayInstance, keyId as razorpayKeyId, keySecret as razorpayKeySecret };
