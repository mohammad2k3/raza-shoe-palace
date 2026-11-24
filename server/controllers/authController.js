import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';

// Helper to issue JWT and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be configured in environment variables.');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses || [],
      },
    });
};

// @desc    Register a customer account
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Always create as customer (admin accounts cannot be registered publicly)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'customer',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user / admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin specific login
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Log out current user
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add delivery address
// @route   POST /api/auth/address
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, street, city, state, pincode, landmark, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    } else if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }

    user.addresses.push({ name, phone, street, city, state, pincode, landmark, isDefault: Boolean(isDefault) });
    await user.save();

    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId);
    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin get all registered customers
// @route   GET /api/auth/customers
// @access  Private/Admin
export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

    // Aggregate orders for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (cust) => {
        const orderCount = await Order.countDocuments({ user: cust._id });
        const orders = await Order.find({ user: cust._id, paymentStatus: 'Completed' });
        const totalSpent = orders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
        return {
          _id: cust._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          addressesCount: cust.addresses?.length || 0,
          isActive: cust.isActive,
          createdAt: cust.createdAt,
          orderCount,
          totalSpent,
        };
      })
    );

    res.status(200).json({ success: true, customers: customersWithStats });
  } catch (error) {
    next(error);
  }
};
