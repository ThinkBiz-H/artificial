const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Blog = require("../models/Blog");
const Session = require("../models/Session");
const LoginHistory = require("../models/LoginHistory");
const PaymentTransaction = require("../models/PaymentTransaction");
const ContactInquiry = require("../models/ContactInquiry");
const NotificationJob = require("../models/NotificationJob");
const Notification = require("../models/Notification");
const sessionService = require("../services/session.service");
const { enqueue } = require("../services/notificationQueue.service");

const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pageParams = (q) => {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
const paginated = (total, page, limit) => ({ total, page, limit, totalPages: Math.ceil(total / limit) });

// ---------------------------------------------------------------- Customers

// @desc    Customer 360: profile + order stats + last login + recent orders
// @route   GET /api/v1/admin/users/:id/overview
const getCustomerOverview = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  const [statsAgg, recentOrders, lastLogin, activeSessions] = await Promise.all([
    Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          // Money actually received: paid orders (online, or COD once collected).
          totalSpent: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$grandTotal", 0] } },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]),
    Order.find({ user: user._id })
      .sort("-createdAt")
      .limit(20)
      .select("orderNumber grandTotal orderStatus paymentStatus paymentMethod createdAt items.title items.quantity"),
    LoginHistory.findOne({ user: user._id, success: true }).sort("-createdAt"),
    Session.countDocuments({ user: user._id, revokedAt: null, expiresAt: { $gt: new Date() } }),
  ]);
  const stats = statsAgg[0] || { orderCount: 0, totalSpent: 0, lastOrderAt: null };
  sendResponse(
    res,
    200,
    {
      user,
      stats: { orderCount: stats.orderCount, totalSpent: stats.totalSpent, lastOrderAt: stats.lastOrderAt },
      lastLogin: lastLogin ? { at: lastLogin.createdAt, method: lastLogin.method, ip: lastLogin.ip, userAgent: lastLogin.userAgent } : null,
      activeSessions,
      recentOrders,
    },
    "Customer overview fetched successfully",
  );
});

// @desc    Mark a customer verified / unverified
// @route   PATCH /api/v1/admin/users/:id/verify   { isVerified }
const setUserVerified = asyncHandler(async (req, res) => {
  const isVerified = !!req.body.isVerified;
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
  if (!user) throw new ApiError(404, "User not found");
  sendResponse(res, 200, { user }, `User marked ${isVerified ? "verified" : "unverified"}`);
});

// @desc    A customer's active sessions (devices)
// @route   GET /api/v1/admin/users/:id/sessions
const getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await sessionService.listActiveSessions(req.params.id);
  sendResponse(
    res,
    200,
    {
      sessions: sessions.map((s) => ({
        _id: s._id,
        deviceLabel: s.deviceLabel,
        userAgent: s.userAgent,
        ip: s.ip,
        lastUsedAt: s.lastUsedAt,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    },
    "Sessions fetched successfully",
  );
});

// @desc    Log a customer out of one device
// @route   DELETE /api/v1/admin/users/:id/sessions/:sessionId
const revokeUserSession = asyncHandler(async (req, res) => {
  const result = await sessionService.revokeSession(req.params.sessionId, req.params.id);
  if (!result.matchedCount) throw new ApiError(404, "Session not found");
  sendResponse(res, 200, {}, "Device logged out");
});

// @desc    Log a customer out of every device
// @route   DELETE /api/v1/admin/users/:id/sessions
const revokeAllUserSessions = asyncHandler(async (req, res) => {
  const result = await sessionService.revokeAllSessions(req.params.id);
  sendResponse(res, 200, { revoked: result.modifiedCount }, "All devices logged out");
});

// ---------------------------------------------------------------- Transactions

// @desc    Payment & refund transactions (PaymentTransaction log)
// @route   GET /api/v1/admin/transactions?status=&type=&method=&q=&from=&to=&page=&limit=
const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.method) filter.method = req.query.method;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(`${req.query.to}T23:59:59.999Z`);
  }
  if (req.query.q) {
    const q = escapeRegex(req.query.q.trim());
    const orders = await Order.find({ orderNumber: new RegExp(q, "i") }).select("_id").limit(50);
    filter.$or = [
      { razorpayPaymentId: new RegExp(q, "i") },
      { razorpayOrderId: new RegExp(q, "i") },
      { razorpayRefundId: new RegExp(q, "i") },
      { order: { $in: orders.map((o) => o._id) } },
    ];
  }
  const [transactions, total] = await Promise.all([
    PaymentTransaction.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("order", "orderNumber grandTotal paymentMethod paymentStatus returnRequest.refund.status")
      .populate("user", "name email mobile")
      .select("-gatewayResponse -razorpaySignature"),
    PaymentTransaction.countDocuments(filter),
  ]);
  sendResponse(res, 200, { transactions, pagination: paginated(total, page, limit) }, "Transactions fetched successfully");
});

// ---------------------------------------------------------------- Returns & refunds

// @desc    Orders with a return request (Order.returnRequest)
// @route   GET /api/v1/admin/returns?status=&refundStatus=&page=&limit=
const listReturns = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const filter = { returnRequest: { $ne: null } };
  if (req.query.status) filter["returnRequest.status"] = req.query.status;
  if (req.query.refundStatus) filter["returnRequest.refund.status"] = req.query.refundStatus;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort("-returnRequest.requestedAt")
      .skip(skip)
      .limit(limit)
      .populate("user", "name email mobile")
      .select("orderNumber user grandTotal paymentMethod paymentStatus orderStatus items deliveredAt returnRequest createdAt"),
    Order.countDocuments(filter),
  ]);
  sendResponse(res, 200, { orders, pagination: paginated(total, page, limit) }, "Return requests fetched successfully");
});

const RETURN_STATUSES = ["Requested", "Approved", "Rejected", "Picked Up", "Received", "Completed"];
const REFUND_STATUSES = ["Not Applicable", "Pending", "Processing", "Completed", "Failed"];

// @desc    Approve / reject / progress a return and record its refund
// @route   PATCH /api/v1/admin/orders/:id/return
//          { status?, adminComment?, refund?: { status?, amount?, method?, note? } }
const updateReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (!order.returnRequest) throw new ApiError(400, "This order has no return request");
  const { status, adminComment, refund } = req.body || {};
  const rr = order.returnRequest;

  if (status !== undefined) {
    if (!RETURN_STATUSES.includes(status)) throw new ApiError(400, "Invalid return status");
    rr.status = status;
    rr.reviewedBy = req.user._id;
    rr.reviewedAt = new Date();
  }
  if (adminComment !== undefined) rr.adminComment = String(adminComment).trim();

  if (refund) {
    if (refund.status !== undefined && !REFUND_STATUSES.includes(refund.status)) throw new ApiError(400, "Invalid refund status");
    if (refund.amount !== undefined) {
      const amount = Number(refund.amount);
      if (!(amount >= 0) || amount > order.grandTotal) throw new ApiError(400, "Refund amount must be between 0 and the order total");
      rr.refund.amount = amount;
    }
    if (refund.method !== undefined) rr.refund.method = refund.method || null;
    if (refund.status !== undefined) {
      rr.refund.status = refund.status;
      if (refund.status === "Completed") rr.refund.processedAt = new Date();
    }
    rr.refund.history.push({ status: rr.refund.status, amount: rr.refund.amount, note: String(refund.note || "").trim() });
  }

  // Keep the order status in step with the return outcome.
  if (rr.status === "Completed" && order.orderStatus === "Delivered") {
    order.orderStatus = "Returned";
    order.statusHistory.push({ status: "Returned", changedBy: req.user._id, note: "Return completed" });
  }
  if (rr.refund.status === "Completed" && ["Returned", "Cancelled"].includes(order.orderStatus)) {
    order.paymentStatus = "Refunded";
  }

  await order.save();
  sendResponse(res, 200, { order }, "Return updated successfully");
});

// ---------------------------------------------------------------- Support tickets

// @desc    Support tickets (contact inquiries)
// @route   GET /api/v1/admin/inquiries?status=&priority=&assignedTo=&q=&page=&limit=
const listInquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo === "none" ? null : req.query.assignedTo;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q.trim()), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { subject: rx }, { message: rx }];
  }
  const [inquiries, total, counts] = await Promise.all([
    ContactInquiry.find(filter).sort("-createdAt").skip(skip).limit(limit).populate("assignedTo", "name email"),
    ContactInquiry.countDocuments(filter),
    ContactInquiry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  sendResponse(
    res,
    200,
    {
      inquiries,
      counts: Object.fromEntries(counts.map((c) => [c._id || "Open", c.count])),
      pagination: paginated(total, page, limit),
    },
    "Support tickets fetched successfully",
  );
});

// @desc    Update a ticket's status / priority / assignee
// @route   PATCH /api/v1/admin/inquiries/:id   { status?, priority?, assignedTo? }
const updateInquiry = asyncHandler(async (req, res) => {
  const patch = {};
  ["status", "priority"].forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });
  if (req.body.assignedTo !== undefined) {
    if (req.body.assignedTo) {
      const staff = await User.findOne({ _id: req.body.assignedTo, role: "admin" });
      if (!staff) throw new ApiError(400, "Tickets can only be assigned to staff accounts");
    }
    patch.assignedTo = req.body.assignedTo || null;
  }
  const inquiry = await ContactInquiry.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true }).populate(
    "assignedTo",
    "name email",
  );
  if (!inquiry) throw new ApiError(404, "Ticket not found");
  sendResponse(res, 200, { inquiry }, "Ticket updated successfully");
});

// @desc    Reply to a ticket (emailed to the customer through the notification queue)
// @route   POST /api/v1/admin/inquiries/:id/reply   { message }
const replyInquiry = asyncHandler(async (req, res) => {
  const message = String(req.body.message || "").trim();
  if (!message) throw new ApiError(400, "Reply message is required");
  const inquiry = await ContactInquiry.findById(req.params.id);
  if (!inquiry) throw new ApiError(404, "Ticket not found");

  const job = await enqueue({
    channel: "email",
    to: inquiry.email,
    subject: `Re: ${inquiry.subject}`,
    body: `<p>Hi ${inquiry.name},</p><p>${message.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p><hr><p style="color:#777">Your message: ${inquiry.message
      .replace(/</g, "&lt;")
      .slice(0, 500)}</p>`,
  });
  inquiry.replies.push({ message, by: req.user._id, byName: req.user.name || "", emailed: !!job });
  if (inquiry.status === "Open") inquiry.status = "In Progress";
  await inquiry.save();
  await inquiry.populate("assignedTo", "name email");
  sendResponse(res, 200, { inquiry }, "Reply sent");
});

// ---------------------------------------------------------------- Notifications

// @desc    Delivery stats: queued email/SMS/push jobs + in-app notifications
// @route   GET /api/v1/admin/notifications/stats?days=30
const notificationStats = asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [jobs, inApp] = await Promise.all([
    NotificationJob.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { channel: "$channel", status: "$status" }, count: { $sum: 1 } } },
    ]),
    Notification.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: null, sent: { $sum: 1 }, read: { $sum: { $cond: ["$isRead", 1, 0] } } } },
    ]),
  ]);
  const byChannel = {};
  jobs.forEach(({ _id, count }) => {
    byChannel[_id.channel] = byChannel[_id.channel] || { pending: 0, processing: 0, sent: 0, failed: 0 };
    byChannel[_id.channel][_id.status] = count;
  });
  const totals = Object.values(byChannel).reduce(
    (t, c) => ({ sent: t.sent + c.sent, failed: t.failed + c.failed, queued: t.queued + c.pending + c.processing }),
    { sent: 0, failed: 0, queued: 0 },
  );
  sendResponse(
    res,
    200,
    { days, totals, byChannel, inApp: { sent: inApp[0]?.sent || 0, read: inApp[0]?.read || 0 } },
    "Notification stats fetched successfully",
  );
});

// ---------------------------------------------------------------- Global search

// @desc    Search products, orders, customers, coupons, reviews and blogs
// @route   GET /api/v1/admin/search?q=
const globalSearch = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return sendResponse(res, 200, { results: {} }, "Query too short");
  const rx = new RegExp(escapeRegex(q), "i");
  const LIMIT = 5;
  const [products, orders, customers, coupons, reviewed, blogs] = await Promise.all([
    Product.find({ isDeleted: false, $or: [{ title: rx }, { SKU: rx }, { slug: rx }] })
      .select("title slug SKU price salePrice stock status thumbnail")
      .limit(LIMIT),
    Order.find({ $or: [{ orderNumber: rx }, { "shippingAddress.fullName": rx }, { "shippingAddress.mobile": rx }] })
      .select("orderNumber grandTotal orderStatus paymentStatus createdAt shippingAddress.fullName")
      .sort("-createdAt")
      .limit(LIMIT),
    User.find({ role: "user", $or: [{ name: rx }, { email: rx }, { mobile: rx }] }).select("name email mobile isActive").limit(LIMIT),
    Coupon.find({ code: rx }).select("code discount type isActive expiry").limit(LIMIT),
    Product.find({ isDeleted: false, "reviews.comment": rx }).select("title slug reviews").limit(LIMIT),
    Blog.find({ $or: [{ title: rx }, { slug: rx }] }).select("title slug status createdAt").limit(LIMIT),
  ]);
  const reviews = reviewed
    .flatMap((p) =>
      (p.reviews || [])
        .filter((r) => rx.test(r.comment || ""))
        .map((r) => ({ _id: r._id, productId: p._id, productTitle: p.title, rating: r.rating, comment: r.comment, createdAt: r.createdAt })),
    )
    .slice(0, LIMIT);
  sendResponse(res, 200, { results: { products, orders, customers, coupons, reviews, blogs } }, "Search results");
});

module.exports = {
  getCustomerOverview,
  setUserVerified,
  getUserSessions,
  revokeUserSession,
  revokeAllUserSessions,
  listTransactions,
  listReturns,
  updateReturn,
  listInquiries,
  updateInquiry,
  replyInquiry,
  notificationStats,
  globalSearch,
};
