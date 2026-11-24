import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value must be positive'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to check validity
couponSchema.methods.isValid = function (orderSubtotal) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'This coupon is inactive.' };
  if (this.validFrom && now < this.validFrom) return { valid: false, message: 'Coupon is not active yet.' };
  if (this.validUntil && now > this.validUntil) return { valid: false, message: 'Coupon has expired.' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached.' };
  if (orderSubtotal < (this.minOrderValue || 0)) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${this.minOrderValue} required for this coupon.`,
    };
  }
  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function (subtotal) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = Math.min(this.discountValue, subtotal);
  }
  return Math.round(discount);
};

export const Coupon = mongoose.model('Coupon', couponSchema);
