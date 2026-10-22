const express = require('express');
const router = express.Router();
const { requireFeature } = require('../middlewares/featureFlag.middleware');

const {
  getStats,
  getRecentOrders,
  getTopProducts,
  getLowStockProducts,
  getSalesChart,
  getTopCustomers,
  getCategoryAnalytics,
  getMonthlyRevenue,
} = require('../controllers/dashboard.controller');

const { getUsers, getUserById, updateUserStatus, updateUserPermissions, deleteUser } = require('../controllers/admin.controller');
const { getAuditLogs, getPermissionCatalog } = require('../controllers/auditLog.controller');
const {
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
} = require('../controllers/adminOps.controller');

const {
  getSalesReportCSV,
  getRevenueReportCSV,
  getOrdersReportCSV,
  getCustomersReportCSV,
  getProductsReportCSV,
  getInventoryReportCSV,
  getCouponReportCSV,
  getTaxReportCSV,
  getProfitReportCSV,
} = require('../controllers/report.controller');

const {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  setPageStatus,
  deletePage,
} = require('../controllers/page.controller');

const {
  getAllSections,
  createSection,
  updateSection,
  reorderSections,
  deleteSection,
  addSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
  addReel,
  updateReel,
  deleteReel,
  reorderReels,
} = require('../controllers/homeSection.controller');

const { getAllFaqs, createFaq, updateFaq, reorderFaqs, deleteFaq } = require('../controllers/faq.controller');

const {
  getAllCards,
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
} = require('../controllers/workshopCard.controller');

const {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  reorderAnnouncements,
  deleteAnnouncement,
} = require('../controllers/announcement.controller');

const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  setBlogStatus,
  deleteBlog,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} = require('../controllers/blog.controller');
const { blogValidator, blogUpdateValidator, blogCategoryValidator } = require('../validators/blog.validator');

const {
  getAllSettings,
  updateSettings,
  updateLogo,
  updateFavicon,
  getEnvironmentStatus,
} = require('../controllers/settings.controller');
const { settingsUpdateValidator } = require('../validators/settings.validator');

const {
  createFolder,
  getFolders,
  updateFolder,
  deleteFolder,
  uploadMedia,
  getMedia,
  updateMedia,
  replaceMedia,
  deleteMedia,
} = require('../controllers/media.controller');
const { mediaUpload } = require('../middlewares/mediaUpload.middleware');
const { folderValidator } = require('../validators/media.validator');

const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  broadcastNotification,
} = require('../controllers/notificationAdmin.controller');
const { templateValidator, broadcastValidator } = require('../validators/notificationAdmin.validator');

const upload = require('../middlewares/upload.middleware');
const { homeSectionFields, heroSlideFields, reelFields } = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  pageValidator,
  pageUpdateValidator,
  sectionValidator,
  faqValidator,
  faqUpdateValidator,
  announcementValidator,
  announcementUpdateValidator,
  slideValidator,
  reelValidator,
} = require('../validators/cms.validator');
const {
  workshopCardValidator,
  workshopCardUpdateValidator,
} = require('../validators/workshop.validator');

const { protect, authorize } = require('../middlewares/auth.middleware');
const auditLog = require('../middlewares/auditLog.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');

router.use(protect, authorize('admin'));
router.use(auditLog);

// Dashboard / analytics
router.get('/dashboard/stats', getStats);
router.get('/dashboard/recent-orders', getRecentOrders);
router.get('/dashboard/top-products', getTopProducts);
router.get('/dashboard/low-stock', getLowStockProducts);
router.get('/dashboard/charts', getSalesChart);
router.get('/dashboard/top-customers', getTopCustomers);
router.get('/dashboard/category-analytics', getCategoryAnalytics);
router.get('/dashboard/monthly-revenue', getMonthlyRevenue);

// CSV/Excel reports (?format=csv|excel, default csv)
router.get('/reports/sales', requirePermission('view_reports'), getSalesReportCSV);
router.get('/reports/revenue', requirePermission('view_reports'), getRevenueReportCSV);
router.get('/reports/orders', requirePermission('view_reports'), getOrdersReportCSV);
router.get('/reports/customers', requirePermission('view_reports'), getCustomersReportCSV);
router.get('/reports/products', requirePermission('view_reports'), getProductsReportCSV);
router.get('/reports/inventory', requirePermission('view_reports'), getInventoryReportCSV);
router.get('/reports/coupons', requirePermission('view_reports'), getCouponReportCSV);
router.get('/reports/tax', requirePermission('view_reports'), getTaxReportCSV);
router.get('/reports/profit', requirePermission('view_reports'), getProfitReportCSV);

// User management
// Global search across products, orders, customers, coupons, reviews, blogs
router.get('/search', requirePermission('Dashboard', 'View'), globalSearch);

// Customer 360, verification and devices
router.get('/users/:id/overview', requirePermission('Customers', 'View'), getCustomerOverview);
router.patch('/users/:id/verify', requirePermission('Customers', 'Edit'), setUserVerified);
router.get('/users/:id/sessions', requirePermission('Customers', 'View'), getUserSessions);
router.delete('/users/:id/sessions/:sessionId', requirePermission('Customers', 'Edit'), revokeUserSession);
router.delete('/users/:id/sessions', requirePermission('Customers', 'Edit'), revokeAllUserSessions);

// Payments, returns & refunds
router.get('/transactions', requirePermission('Orders', 'View'), listTransactions);
router.get('/returns', requirePermission('Orders', 'View'), listReturns);
router.patch('/orders/:id/return', requirePermission('Orders', 'Approve'), updateReturn);

// Support tickets (contact inquiries)
router.get('/inquiries', requirePermission('Customers', 'View'), listInquiries);
router.patch('/inquiries/:id', requirePermission('Customers', 'Edit'), updateInquiry);
router.post('/inquiries/:id/reply', requirePermission('Customers', 'Edit'), replyInquiry);

// Notification delivery stats
router.get('/notifications/stats', requirePermission('Notifications', 'View'), notificationStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/permissions', requirePermission('manage_users'), updateUserPermissions);
router.delete('/users/:id', deleteUser);

router.get('/permissions', getPermissionCatalog);
router.get('/audit-logs', getAuditLogs);

// CMS — Pages (Phase 10)
router.get('/pages', getAllPages);
router.get('/pages/:id', getPageById);
router.post('/pages', upload.single('featuredImage'), pageValidator, validate, createPage);
router.put('/pages/:id', upload.single('featuredImage'), pageUpdateValidator, validate, updatePage);
router.patch('/pages/:id/status', setPageStatus);
router.delete('/pages/:id', deletePage);

// CMS — Home sections (Phase 10)
router.get('/home-sections', getAllSections);
router.post('/home-sections', homeSectionFields, sectionValidator, validate, createSection);
router.put('/home-sections/:id', homeSectionFields, updateSection);
router.patch('/home-sections/reorder', reorderSections);
router.delete('/home-sections/:id', deleteSection);

// CMS — Home sections: hero slides (Homepage Builder upgrade)
router.post('/home-sections/:sectionId/slides', heroSlideFields, slideValidator, validate, addSlide);
router.put('/home-sections/:sectionId/slides/:slideId', heroSlideFields, slideValidator, validate, updateSlide);
router.patch('/home-sections/:sectionId/slides/reorder', reorderSlides);
router.delete('/home-sections/:sectionId/slides/:slideId', deleteSlide);

// CMS — Home sections: reels (Homepage Builder upgrade)
router.post('/home-sections/:sectionId/reels', reelFields, reelValidator, validate, addReel);
router.put('/home-sections/:sectionId/reels/:reelId', reelFields, reelValidator, validate, updateReel);
router.patch('/home-sections/:sectionId/reels/reorder', reorderReels);
router.delete('/home-sections/:sectionId/reels/:reelId', deleteReel);

// CMS — FAQs (Phase 10)
router.get('/faqs', getAllFaqs);
router.post('/faqs', faqValidator, validate, createFaq);
router.put('/faqs/:id', faqUpdateValidator, validate, updateFaq);
router.patch('/faqs/reorder', reorderFaqs);
router.delete('/faqs/:id', deleteFaq);

// CMS — Workshop
router.get('/workshop-cards', getAllCards);
router.post('/workshop-cards', upload.single('image'), workshopCardValidator, validate, createCard);
router.put('/workshop-cards/:id', upload.single('image'), workshopCardUpdateValidator, validate, updateCard);
router.patch('/workshop-cards/reorder', reorderCards);
router.delete('/workshop-cards/:id', deleteCard);

// CMS — Announcement bar (Homepage redesign, Phase 1)
router.get('/announcements', getAllAnnouncements);
router.post('/announcements', announcementValidator, validate, createAnnouncement);
router.put('/announcements/:id', announcementUpdateValidator, validate, updateAnnouncement);
router.patch('/announcements/reorder', reorderAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);

// Blog (Phase 11)
router.get('/blogs', getAllBlogs);
router.get('/blogs/:id', getBlogById);
router.post('/blogs', upload.single('featuredImage'), blogValidator, validate, createBlog);
router.put('/blogs/:id', upload.single('featuredImage'), blogUpdateValidator, validate, updateBlog);
router.patch('/blogs/:id/status', setBlogStatus);
router.delete('/blogs/:id', deleteBlog);

router.post('/blog-categories', blogCategoryValidator, validate, createBlogCategory);
router.put('/blog-categories/:id', updateBlogCategory);
router.delete('/blog-categories/:id', deleteBlogCategory);

// Settings (Phase 15)
router.get('/settings', requirePermission('manage_settings'), getAllSettings);
router.put('/settings', requirePermission('manage_settings'), settingsUpdateValidator, validate, updateSettings);
router.put('/settings/logo', requirePermission('manage_settings'), upload.single('logo'), updateLogo);
router.put('/settings/favicon', requirePermission('manage_settings'), upload.single('favicon'), updateFavicon);
router.get('/settings/environment-status', requirePermission('manage_settings'), getEnvironmentStatus);

// Media Manager (Phase 12)
router.get('/media/folders', getFolders);
router.post('/media/folders', folderValidator, validate, createFolder);
router.put('/media/folders/:id', updateFolder);
router.delete('/media/folders/:id', deleteFolder);

router.get('/media', getMedia);
router.post('/media/upload', mediaUpload.array('files', 20), uploadMedia);
router.put('/media/:id', updateMedia);
router.put('/media/:id/replace', mediaUpload.single('file'), replaceMedia);
router.delete('/media/:id', deleteMedia);

// Notifications (Phase 16)
router.get('/notification-templates', getTemplates);
router.post('/notification-templates', templateValidator, validate, createTemplate);
router.put('/notification-templates/:id', updateTemplate);
router.delete('/notification-templates/:id', deleteTemplate);
router.post('/notifications/broadcast', requireFeature('notifications', 'Notifications are switched off in Settings > Feature flags.'), broadcastValidator, validate, broadcastNotification);

module.exports = router;
