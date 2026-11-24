import { Coupon } from '../models/Coupon.js';

// @desc    Validate coupon code during checkout
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    const check = coupon.isValid(Number(subtotal) || 0);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }

    const discountAmount = coupon.calculateDiscount(Number(subtotal) || 0);

    res.status(200).json({
      success: true,
      message: `Coupon applied! You saved ₹${discountAmount}.`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: create coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, validFrom, validUntil, usageLimit, isActive } = req.body;

    if (!code || !discountValue || !validUntil) {
      return res.status(400).json({ success: false, message: 'Code, discount value, and expiry date are required.' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A coupon with this code already exists.' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const { code, discountType, discountValue, minOrderValue, maxDiscount, validFrom, validUntil, usageLimit, isActive } = req.body;

    if (code) coupon.code = code.toUpperCase().trim();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (validFrom) coupon.validFrom = new Date(validFrom);
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    res.status(200).json({ success: true, message: `Coupon '${coupon.code}' deleted.` });
  } catch (error) {
    next(error);
  }
};
