const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/ApiResponse');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Variant = require('../models/Variant');
const User = require('../models/User');
const Session = require('../models/Session');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get dashboard summary statistics
// @route   GET /api/v1/admin/dashboard/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const paidFilter = { paymentStatus: 'Paid' };

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [totalSalesAgg, todaySalesAgg, totalOrders, totalProducts, totalCustomers, todayOrders, pendingOrders, activeUserIds] = await Promise.all([
    Order.aggregate([{ $match: paidFilter }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Order.aggregate([
      { $match: { ...paidFilter, createdAt: { $gte: startOfToday() } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.countDocuments(),
    Product.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: 'user' }),
    Order.countDocuments({ createdAt: { $gte: startOfToday() } }),
    Order.countDocuments({ orderStatus: 'Pending' }),
    // Signed-in shoppers with a session used in the last 24 hours.
    Session.distinct('user', { revokedAt: null, lastUsedAt: { $gte: dayAgo } }),
  ]);
  const activeUsers = activeUserIds.length
    ? await User.countDocuments({ _id: { $in: activeUserIds }, role: 'user' })
    : 0;

  const revenue = totalSalesAgg[0]?.total || 0;
  const todaySales = todaySalesAgg[0]?.total || 0;

  sendResponse(
    res,
    200,
    {
      totalSales: revenue,
      todaySales,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenue,
      todayOrders,
      pendingOrders,
      activeUsers,
    },
    'Dashboard stats fetched successfully'
  );
});

// @desc    Get recent orders
// @route   GET /api/v1/admin/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt').limit(10);
  sendResponse(res, 200, { orders }, 'Recent orders fetched successfully');
});

// @desc    Get top selling products
// @route   GET /api/v1/admin/dashboard/top-products
// @access  Private/Admin
const getTopProducts = asyncHandler(async (req, res) => {
  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        thumbnail: { $first: '$items.thumbnail' },
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  sendResponse(res, 200, { topProducts }, 'Top products fetched successfully');
});

// @desc    Get low stock products — non-variant products checked on their
//          own stock; for a product with variants (hasVariants=true), stock
//          lives on each Variant instead, so those are checked separately.
// @route   GET /api/v1/admin/dashboard/low-stock
// @access  Private/Admin
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = parseInt(req.query.threshold, 10) || 10;

  const products = await Product.find({ isDeleted: false, hasVariants: false, stock: { $lte: threshold } })
    .select('title stock thumbnail SKU')
    .sort('stock');

  const variants = await Variant.find({ status: 'active', stock: { $lte: threshold } })
    .select('sku stock product')
    .populate('product', 'title thumbnail isDeleted')
    .sort('stock');
  const lowStockVariants = variants.filter((v) => v.product && !v.product.isDeleted);

  sendResponse(res, 200, { products, variants: lowStockVariants, threshold }, 'Low stock products fetched successfully');
});

// @desc    Get sales chart data (last 7 / 30 days)
// @route   GET /api/v1/admin/dashboard/charts?range=7|30
// @access  Private/Admin
const getSalesChart = asyncHandler(async (req, res) => {
  const range = parseInt(req.query.range, 10) === 30 ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - range);
  startDate.setHours(0, 0, 0, 0);

  const salesData = await Order.aggregate([
    { $match: { paymentStatus: 'Paid', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$grandTotal' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendResponse(res, 200, { range, salesData }, 'Sales chart data fetched successfully');
});

// @desc    Get top customers by total spend (paid orders only)
// @route   GET /api/v1/admin/dashboard/top-customers
// @access  Private/Admin
const getTopCustomers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const topCustomers = await Order.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$grandTotal' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$user._id',
        name: '$user.name',
        email: '$user.email',
        totalSpent: 1,
        orderCount: 1,
      },
    },
  ]);

  sendResponse(res, 200, { topCustomers }, 'Top customers fetched successfully');
});

// @desc    Revenue and order-count breakdown by product category
// @route   GET /api/v1/admin/dashboard/category-analytics
// @access  Private/Admin
const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const categoryAnalytics = await Order.aggregate([
    { $match: { paymentStatus: 'Paid' } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDoc',
      },
    },
    { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$productDoc.category',
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        unitsSold: { $sum: '$items.quantity' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
        totalRevenue: 1,
        unitsSold: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  sendResponse(res, 200, { categoryAnalytics }, 'Category analytics fetched successfully');
});

// @desc    Monthly revenue breakdown for the last N months (default 12)
// @route   GET /api/v1/admin/dashboard/monthly-revenue?months=12
// @access  Private/Admin
const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const months = Math.min(Number(req.query.months) || 12, 24);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (months - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'Paid', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalRevenue: { $sum: '$grandTotal' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendResponse(res, 200, { months, monthlyRevenue }, 'Monthly revenue fetched successfully');
});

module.exports = {
  getStats,
  getRecentOrders,
  getTopProducts,
  getLowStockProducts,
  getSalesChart,
  getTopCustomers,
  getCategoryAnalytics,
  getMonthlyRevenue,
};
