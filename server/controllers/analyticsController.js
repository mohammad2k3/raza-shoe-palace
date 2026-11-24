import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';

// @desc    Admin: get live database dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Total revenue from completed payments
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Pending orders
    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ['Order Placed', 'Order Confirmed', 'Processing'] },
    });

    // Low stock products count (variant stock <= 5)
    const lowStockProducts = await Product.find({
      'variants.stock': { $lte: 5 },
    }).select('name sku variants images');

    // Recent 6 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('orderNumber customerInfo pricing orderStatus paymentStatus paymentMethod createdAt');

    // Monthly sales data (past 6 months) from real database orders
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySalesAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: { $ne: 'Failed' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = monthlySalesAgg.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      orders: item.orderCount,
      revenue: item.revenue,
    }));

    // Top best-selling products from actual orders
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalUnitsSold: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.subtotal' },
          productName: { $first: '$items.name' },
          productImage: { $first: '$items.image' },
        },
      },
      { $sort: { totalUnitsSold: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalCategories,
        totalOrders,
        totalCustomers,
        totalRevenue,
        pendingOrders: pendingOrdersCount,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      lowStockProducts,
      monthlySales,
      topProducts: topProductsAgg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get detailed reports
// @route   GET /api/analytics/reports
// @access  Private/Admin
export const getDetailedReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    const matchObj = {};
    if (startDate || endDate) {
      matchObj.createdAt = dateQuery;
    }

    const orderStats = await Order.aggregate([
      { $match: matchObj },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.totalAmount' },
        },
      },
    ]);

    const paymentStats = await Order.aggregate([
      { $match: matchObj },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.totalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      orderStats,
      paymentStats,
    });
  } catch (error) {
    next(error);
  }
};
