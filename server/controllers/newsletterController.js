import { Newsletter } from '../models/Newsletter.js';

// @desc    Subscribe to store newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(200).json({ success: true, message: 'You are already subscribed to Raza Shoe Palace updates!' });
    }

    await Newsletter.create({ email: email.toLowerCase().trim() });

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You will receive our latest curated footwear updates.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all newsletter subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, subscribers, count: subscribers.length });
  } catch (error) {
    next(error);
  }
};
