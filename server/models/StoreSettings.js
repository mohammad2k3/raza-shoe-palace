import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'RAZA SHOE PALACE',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Step Into Style.',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: 'contact@razashoepalace.com',
      trim: true,
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    address: {
      type: String,
      default: 'Main Market Road, Footwear Galleria, Suite 101',
      trim: true,
    },
    city: {
      type: String,
      default: 'Mumbai',
      trim: true,
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true,
    },
    pincode: {
      type: String,
      default: '400001',
      trim: true,
    },
    shippingFee: {
      type: Number,
      default: 99,
    },
    freeShippingThreshold: {
      type: Number,
      default: 1999,
    },
    announcementText: {
      type: String,
      default: '✨ Step Into Style — Free Express Shipping on orders above ₹1,999 | Handcrafted Quality',
      trim: true,
    },
    announcementActive: {
      type: Boolean,
      default: true,
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    returnWindowDays: {
      type: Number,
      default: 7,
    },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com' },
      facebook: { type: String, default: 'https://facebook.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      whatsapp: { type: String, default: '+919876543210' },
    },
  },
  {
    timestamps: true,
  }
);

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
