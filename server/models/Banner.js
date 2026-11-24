import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
    },
    mobileImageUrl: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: 'Shop Now',
      trim: true,
    },
    link: {
      type: String,
      default: '/shop',
      trim: true,
    },
    type: {
      type: String,
      enum: ['hero', 'promo', 'announcement'],
      default: 'hero',
      index: true,
    },
    displayOrder: {
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

export const Banner = mongoose.model('Banner', bannerSchema);
