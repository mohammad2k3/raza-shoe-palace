import { Banner } from '../models/Banner.js';

// @desc    Get active banners for storefront
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;

    const banners = await Banner.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all banners
// @route   GET /api/banners/admin/all
// @access  Private/Admin
export const getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: create banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, tagline, imageUrl, mobileImageUrl, buttonText, link, type, displayOrder, isActive } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and image URL are required.' });
    }

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle || '',
      tagline: tagline || '',
      imageUrl,
      mobileImageUrl: mobileImageUrl || '',
      buttonText: buttonText || 'Shop Now',
      link: link || '/shop',
      type: type || 'hero',
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    const { title, subtitle, tagline, imageUrl, mobileImageUrl, buttonText, link, type, displayOrder, isActive } = req.body;

    if (title) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (tagline !== undefined) banner.tagline = tagline;
    if (imageUrl) banner.imageUrl = imageUrl;
    if (mobileImageUrl !== undefined) banner.mobileImageUrl = mobileImageUrl;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (link !== undefined) banner.link = link;
    if (type !== undefined) banner.type = type;
    if (displayOrder !== undefined) banner.displayOrder = Number(displayOrder);
    if (isActive !== undefined) banner.isActive = Boolean(isActive);

    await banner.save();

    res.status(200).json({ success: true, banner });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }
    res.status(200).json({ success: true, message: 'Banner removed successfully.' });
  } catch (error) {
    next(error);
  }
};
