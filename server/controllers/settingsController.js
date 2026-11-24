import { StoreSettings } from '../models/StoreSettings.js';

// @desc    Get store business settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update store business settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};
