const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const categoryBannerRoutes = require('./categoryBanner.routes');
const brandRoutes = require('./brand.routes');
const unitRoutes = require('./unit.routes');
const warehouseRoutes = require('./warehouse.routes');
const inventoryRoutes = require('./inventory.routes');
const pageRoutes = require('./page.routes');
const homeSectionRoutes = require('./homeSection.routes');
const announcementRoutes = require('./announcement.routes');
const faqRoutes = require('./faq.routes');
const settingsRoutes = require('./settings.routes');
const blogRoutes = require('./blog.routes');
const productRoutes = require('./product.routes');
const wishlistRoutes = require('./wishlist.routes');
const cartRoutes = require('./cart.routes');
const checkoutRoutes = require('./checkout.routes');
const couponRoutes = require('./coupon.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const webhookRoutes = require('./webhook.routes');
const notificationRoutes = require('./notification.routes');
const roleRoutes = require('./role.routes');
const staffRoutes = require('./staff.routes');
const contactRoutes = require('./contact.routes');
const workshopRoutes = require('./workshop.routes');
const maintenanceMode = require('../middlewares/maintenance.middleware');

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Commerce API v1 is running',
    data: { version: '1.0.0' },
    error: null,
  });
});

// Mounted BEFORE the maintenance-mode gate, deliberately: an admin must
// always be able to log in and manage the store (and turn maintenance mode
// back off) while it's active, warehouse/inventory operations are internal
// (not storefront-facing), and payment/shipping webhooks must never be
// dropped mid-maintenance.
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/roles', roleRoutes);
router.use('/staff', staffRoutes);

// Everything below is customer/storefront-facing and honors maintenance mode.
router.use(maintenanceMode);

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/category-banners', categoryBannerRoutes);
router.use('/brands', brandRoutes);
router.use('/units', unitRoutes);
router.use('/pages', pageRoutes);
router.use('/home-sections', homeSectionRoutes);
router.use('/announcements', announcementRoutes);
router.use('/faqs', faqRoutes);
router.use('/settings', settingsRoutes);
router.use('/blogs', blogRoutes);
router.use('/products', productRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/coupons', couponRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/contact', contactRoutes);
router.use('/workshop-cards', workshopRoutes);

module.exports = router;
