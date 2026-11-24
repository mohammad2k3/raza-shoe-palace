import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  colorCode: {
    type: String,
    default: '#151515',
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  sku: {
    type: String,
    trim: true,
  },
});

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'Please provide base product SKU'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide brand name'],
      trim: true,
      default: 'Raza Palace Collection',
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please assign a category'],
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    regularPrice: {
      type: Number,
      required: [true, 'Please set regular price'],
      min: [0, 'Price must be positive'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be positive'],
      default: null,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one image',
      },
    },
    variants: [variantSchema],
    specifications: [specificationSchema],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total stock across all variants
productSchema.virtual('totalStock').get(function () {
  if (!this.variants || this.variants.length === 0) return 0;
  return this.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
});

// Compound and performance indexes for MongoDB Atlas
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isNewArrival: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
