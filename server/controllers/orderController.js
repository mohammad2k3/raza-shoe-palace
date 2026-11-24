import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { razorpayInstance, razorpayKeySecret } from '../config/razorpay.js';

// Helper to generate unique order number: RSP-YYYYMM-XXXX
const generateOrderNumber = () => {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RSP-${yearMonth}-${random}`;
};

// @desc    Create new order (validates stock, calculates pricing, saves snapshot)
// @route   POST /api/orders
// @access  Public (Guest or Logged in user)
export const createOrder = async (req, res, next) => {
  try {
    const {
      customerInfo,
      shippingAddress,
      items,
      paymentMethod,
      couponCode,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Please select products.' });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({ success: false, message: 'Customer name, email, and mobile are required.' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete delivery address and pincode are required.' });
    }

    // Fetch store settings for shipping fee & free shipping threshold
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = { shippingFee: 99, freeShippingThreshold: 1999 };
    }

    // Validate each item and its variant-specific stock from the database
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || 'Selected item'}" is no longer available.`,
        });
      }

      // Find matching size and color variant
      const variant = product.variants.find(
        (v) =>
          v.size.toLowerCase() === String(item.size).toLowerCase() &&
          v.color.toLowerCase() === String(item.color).toLowerCase()
      );

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant size "${item.size}" in color "${item.color}" is not available for ${product.name}.`,
        });
      }

      const requestedQty = Number(item.quantity) || 1;
      if (variant.stock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} (Size: ${item.size}, Color: ${item.color}). Only ${variant.stock} left in stock.`,
        });
      }

      // Use true server price at purchase time
      const itemPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.regularPrice;
      const itemSubtotal = itemPrice * requestedQty;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.images[0],
        price: itemPrice,
        regularPrice: product.regularPrice,
        size: variant.size,
        color: variant.color,
        quantity: requestedQty,
        subtotal: itemSubtotal,
      });
    }

    // Coupon calculation
    let discountAmount = 0;
    let validCouponDoc = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
      if (coupon) {
        const check = coupon.isValid(calculatedSubtotal);
        if (check.valid) {
          discountAmount = coupon.calculateDiscount(calculatedSubtotal);
          validCouponDoc = coupon;
        }
      }
    }

    // Shipping calculation
    const afterDiscount = Math.max(0, calculatedSubtotal - discountAmount);
    let shippingFee = 0;
    if (afterDiscount < settings.freeShippingThreshold) {
      shippingFee = settings.shippingFee || 99;
    }

    const totalAmount = afterDiscount + shippingFee;

    // Deduct inventory atomically for all items (ensuring stock is strictly >= requested quantity)
    const deductedItems = [];
    for (const item of validatedItems) {
      const updateResult = await Product.updateOne(
        {
          _id: item.product,
          variants: {
            $elemMatch: {
              size: item.size,
              color: item.color,
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: { 'variants.$.stock': -item.quantity },
        }
      );

      if (updateResult.modifiedCount === 0) {
        // Rollback previously deducted items in this transaction
        for (const rolled of deductedItems) {
          await Product.updateOne(
            { _id: rolled.product, 'variants.size': rolled.size, 'variants.color': rolled.color },
            { $inc: { 'variants.$.stock': rolled.quantity } }
          );
        }
        return res.status(400).json({
          success: false,
          message: `Stock conflict: Insufficient inventory available for "${item.name}" (Size: ${item.size}, Color: ${item.color}). Please adjust quantity.`,
        });
      }

      deductedItems.push(item);
    }

    // If coupon was applied, increment used count
    if (validCouponDoc) {
      validCouponDoc.usedCount = (validCouponDoc.usedCount || 0) + 1;
      await validCouponDoc.save();
    }

    const orderNumber = generateOrderNumber();
    const guestTrackingToken = !req.user ? crypto.randomBytes(24).toString('hex') : null;

    const order = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      guestTrackingToken,
      customerInfo,
      shippingAddress,
      items: validatedItems,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Order Placed',
      statusHistory: [
        {
          status: 'Order Placed',
          changedAt: new Date(),
          note: `Order placed successfully via ${paymentMethod || 'COD'}.`,
          updatedBy: 'Customer',
        },
      ],
      pricing: {
        subtotal: calculatedSubtotal,
        discount: discountAmount,
        shippingFee,
        totalAmount,
      },
      couponApplied: {
        code: couponCode ? couponCode.toUpperCase().trim() : '',
        discountAmount,
      },
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
      guestTrackingToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order for online checkout
// @route   POST /api/orders/:id/razorpay-order
// @access  Public (Owner or authorized guest)
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Ownership check
    const providedToken = req.body?.token || req.query.token || req.headers['x-guest-token'];
    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isGuestAuthorized = !order.user && order.guestTrackingToken && providedToken === order.guestTrackingToken;

    if (order.user && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to initiate payment for this order.' });
    }

    if (!order.user && !isGuestAuthorized && !isAdmin) {
      // If no token is provided but order was created in this session, allow if requested within 15 mins of creation
      const orderAgeMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
      if (orderAgeMinutes > 60) {
        return res.status(403).json({ success: false, message: 'Guest payment session expired. Please verify order token.' });
      }
    }

    if (order.paymentStatus === 'Completed') {
      return res.status(400).json({ success: false, message: 'Order has already been paid for.' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot process payment for a cancelled order.' });
    }

    if (!razorpayInstance) {
      return res.status(400).json({
        success: false,
        isConfigured: false,
        message: 'Razorpay keys not configured in environment. Please use Cash on Delivery or configure RAZORPAY_KEY_ID in .env.',
      });
    }

    const options = {
      amount: Math.round(order.pricing.totalAmount * 100), // amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
    };

    const rzpOrder = await razorpayInstance.orders.create(options);

    order.paymentDetails.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder: rzpOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/orders/:id/verify-payment
// @access  Public (Owner or authorized guest)
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Idempotency: if already completed, return success immediately
    if (order.paymentStatus === 'Completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and completed.',
        order,
      });
    }

    if (!razorpayKeySecret) {
      return res.status(400).json({ success: false, message: 'Razorpay secret not configured on server.' });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpaySignature) {
      order.paymentStatus = 'Completed';
      order.orderStatus = 'Order Confirmed';
      order.paymentDetails = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      };
      order.statusHistory.push({
        status: 'Order Confirmed',
        changedAt: new Date(),
        note: `Payment verified successfully via Razorpay (Payment ID: ${razorpayPaymentId}).`,
        updatedBy: 'Razorpay Gateway',
      });
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified and order confirmed.',
        order,
      });
    } else {
      order.paymentStatus = 'Failed';
      order.statusHistory.push({
        status: 'Payment Failed',
        changedAt: new Date(),
        note: 'Razorpay signature verification failed.',
        updatedBy: 'Payment Gateway',
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Razorpay Webhook notifications
// @route   POST /api/orders/webhook/razorpay
// @access  Public (Signature-verified)
export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ success: false, message: 'Razorpay webhook secret not configured.' });
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay signature header.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured' && payload?.payment?.entity) {
      const payment = payload.payment.entity;
      const rzpOrderId = payment.order_id;

      const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': rzpOrderId });
      if (order && order.paymentStatus !== 'Completed') {
        order.paymentStatus = 'Completed';
        order.orderStatus = 'Order Confirmed';
        order.paymentDetails.razorpayPaymentId = payment.id;
        order.paymentDetails.razorpaySignature = signature;
        order.statusHistory.push({
          status: 'Order Confirmed',
          changedAt: new Date(),
          note: `Payment confirmed via webhook (${payment.id}).`,
          updatedBy: 'Razorpay Webhook',
        });
        await order.save();
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID or orderNumber
// @route   GET /api/orders/:identifier
// @access  Public (Protected or Guest Token or Redacted Public Tracking)
export const getOrder = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    const query = isObjectId ? { _id: identifier } : { orderNumber: identifier.toUpperCase() };
    const order = await Order.findOne(query).populate('items.product', 'name slug brand images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const providedToken = req.query.token || req.headers['x-guest-token'] || req.body?.token;
    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isGuestAuthorized = order.guestTrackingToken && providedToken === order.guestTrackingToken;

    // Full access for account owner, store admin, or guest with token
    if (isOwner || isAdmin || isGuestAuthorized) {
      return res.status(200).json({ success: true, order });
    }

    // For public tracking or queries without authentication:
    // Return sanitized order details to protect customer PII (hide phone, full address, email)
    const sanitizedOrder = {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      statusHistory: order.statusHistory,
      trackingInfo: order.trackingInfo,
      items: order.items,
      pricing: order.pricing,
      createdAt: order.createdAt,
      customerInfo: {
        name: order.customerInfo?.name ? order.customerInfo.name.split(' ')[0] : 'Customer',
      },
      shippingAddress: {
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
      },
      isPublicView: true,
    };

    res.status(200).json({ success: true, order: sanitizedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (idempotently restores inventory)
// @route   POST /api/orders/:id/cancel
// @access  Private or Guest with Token
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason, token } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check authorization: customer must own order, be admin, or have valid guest tracking token
    const providedToken = token || req.headers['x-guest-token'] || req.query.token;
    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    const isGuestAuthorized = !order.user && order.guestTrackingToken && providedToken === order.guestTrackingToken;

    if (!isOwner && !isAdmin && !isGuestAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order.' });
    }

    // Only allow cancellation if order has not shipped
    const nonCancellable = ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
    if (nonCancellable.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in status '${order.orderStatus}'. Please contact support.`,
      });
    }

    // Idempotently restock variant inventory
    if (!order.isStockRestored) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, 'variants.size': item.size, 'variants.color': item.color },
          { $inc: { 'variants.$.stock': item.quantity } }
        );
      }
      order.isStockRestored = true;
    }

    order.orderStatus = 'Cancelled';
    order.cancelReason = reason || 'Cancelled by customer';
    order.statusHistory.push({
      status: 'Cancelled',
      changedAt: new Date(),
      note: `Order cancelled. Reason: ${order.cancelReason}`,
      updatedBy: req.user ? req.user.name : 'Customer',
    });

    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled successfully and inventory restored.', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Request return/exchange
// @route   POST /api/orders/:id/return
// @access  Private
export const requestReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Return requests can only be made for delivered orders.' });
    }

    order.orderStatus = 'Return Requested';
    order.returnReason = reason || 'Customer requested return';
    order.statusHistory.push({
      status: 'Return Requested',
      changedAt: new Date(),
      note: `Return requested: ${order.returnReason}`,
      updatedBy: req.user ? req.user.name : 'Customer',
    });

    await order.save();

    res.status(200).json({ success: true, message: 'Return request submitted.', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all orders with filter & pagination
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'customerInfo.name': new RegExp(search, 'i') },
        { 'customerInfo.email': new RegExp(search, 'i') },
        { 'customerInfo.phone': new RegExp(search, 'i') },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      orders,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update order delivery status & tracking
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, courierName, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (status) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        changedAt: new Date(),
        note: note || `Status updated to ${status}`,
        updatedBy: req.user ? req.user.name : 'Administrator',
      });
    }

    if (courierName !== undefined) order.trackingInfo.courierName = courierName;
    if (trackingNumber !== undefined) order.trackingInfo.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) order.trackingInfo.trackingUrl = trackingUrl;
    if (estimatedDelivery !== undefined) order.trackingInfo.estimatedDelivery = estimatedDelivery;

    // If order marked Delivered and payment was COD, update payment status to Completed
    if (status === 'Delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'Completed';
    }

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update payment status directly
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = paymentStatus;
    order.statusHistory.push({
      status: `Payment: ${paymentStatus}`,
      changedAt: new Date(),
      note: `Payment status updated to ${paymentStatus}`,
      updatedBy: req.user ? req.user.name : 'Administrator',
    });

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
