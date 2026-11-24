import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  regularPrice: { type: Number },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: String, default: 'System' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, default: '' },
    },
    items: [orderItemSchema],
    paymentMethod: {
      type: String,
      enum: ['COD', 'Razorpay'],
      required: true,
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true,
    },
    paymentDetails: {
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' },
    },
    orderStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Order Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Return Requested',
        'Returned',
        'Refunded',
      ],
      default: 'Order Placed',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    couponApplied: {
      code: { type: String, default: '' },
      discountAmount: { type: Number, default: 0 },
    },
    notes: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
    returnReason: { type: String, default: '' },
    isStockRestored: { type: Boolean, default: false },
    guestTrackingToken: { type: String, default: null, index: true },
    trackingInfo: {
      courierName: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      estimatedDelivery: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound indexes for customer query filters and admin dashboards
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ 'paymentDetails.razorpayOrderId': 1 });

export const Order = mongoose.model('Order', orderSchema);
