/// Every path below exists in the uploaded backend (routes/*.routes.js),
/// relative to AppConfig.apiBaseUrl (/api/v1).
class ApiEndpoints {
  ApiEndpoints._();

  // Auth — routes/auth.routes.js
  static const String mobileRegister = '/auth/mobile/register';
  static const String mobileLogin = '/auth/mobile/login';
  static const String mobileVerify = '/auth/mobile/verify';
  static const String mobileResendOtp = '/auth/mobile/resend-otp';
  static const String refreshToken = '/auth/refresh-token';
  static const String logout = '/auth/logout';
  static const String logoutAll = '/auth/logout-all';
  static const String me = '/auth/me';
  static const String sessions = '/auth/sessions';
  static String session(String id) => '/auth/sessions/$id';
  static const String loginHistory = '/auth/login-history';

  // Checkout OTP — routes/checkout.routes.js
  static const String checkoutRequestOtp = '/checkout/request-otp';
  static const String checkoutResendOtp = '/checkout/resend-otp';
  static const String checkoutVerifyOtp = '/checkout/verify-otp';
  static const String checkoutLookupCustomer = '/checkout/lookup-customer';
  static const String checkoutQuote = '/checkout/quote';

  // Users — routes/user.routes.js
  static const String profile = '/users/profile';
  static const String profileImage = '/users/profile/image';
  static const String deleteAccount = '/users/account';
  static const String addresses = '/users/address';
  static String address(String id) => '/users/address/$id';

  // Catalogue — routes/product.routes.js, category.routes.js
  static const String products = '/products';
  static const String featuredProducts = '/products/featured/list';
  static const String newArrivals = '/products/new-arrivals/list';
  static const String trendingProducts = '/products/trending/list';
  static const String bestSellers = '/products/bestsellers/list';
  static const String topRated = '/products/top-rated/list';
  static const String recentlyViewed = '/products/me/recently-viewed';
  static String productBySlug(String slug) => '/products/$slug';
  static String productById(String id) => '/products/id/$id';
  static String relatedProducts(String id) => '/products/$id/related';
  static String trackView(String id) => '/products/$id/view';
  static String productVariants(String id) => '/products/$id/variants';
  static String reviews(String productId) => '/products/$productId/reviews';
  static String review(String productId, String reviewId) =>
      '/products/$productId/reviews/$reviewId';
  static String ratingDistribution(String productId) =>
      '/products/$productId/reviews/rating-distribution';

  static const String categories = '/categories';
  static String categoryBySlug(String slug) => '/categories/$slug';
  static String categoryBanner(String categoryId) =>
      '/category-banners/by-category/$categoryId';
  static const String brands = '/brands';

  // Wishlist / cart
  static const String wishlist = '/wishlist';
  static String wishlistItem(String productId) => '/wishlist/$productId';
  static String wishlistMoveToCart(String productId) =>
      '/wishlist/$productId/move-to-cart';
  static const String cart = '/cart';
  static String cartItem(String productId) => '/cart/$productId';
  static const String applyCoupon = '/cart/apply-coupon';
  static const String removeCoupon = '/cart/remove-coupon';

  // Shipping — mounted at /api/v1/shipping in app.js
  static const String shippingCalculate = '/shipping/calculate';

  // Orders / payments
  static const String orders = '/orders';
  static const String myOrders = '/orders/my-orders';
  static String order(String id) => '/orders/$id';
  static String cancelOrder(String id) => '/orders/$id/cancel';
  static String trackOrder(String id) => '/orders/$id/track';
  static String invoice(String id) => '/orders/$id/invoice';
  static const String verifyPayment = '/payments/verify';
  static const String paymentIntent = '/payments/intent';
  static const String confirmPaymentIntent = '/payments/intent/confirm';
  static const String paymentFailure = '/payments/failure';
  static const String paymentCancelled = '/payments/cancelled';
  static String retryPayment(String orderId) => '/payments/$orderId/retry';
  static String transactions(String orderId) =>
      '/payments/$orderId/transactions';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationsReadAll = '/notifications/read-all';
  static String notificationRead(String id) => '/notifications/$id/read';
  static String notification(String id) => '/notifications/$id';
  static const String pushToken = '/notifications/push-token';

  // CMS / settings
  static const String settings = '/settings';
  static const String homeSections = '/home-sections';
  static const String announcements = '/announcements';
  static const String workshopCards = '/workshop-cards';
  static const String pages = '/pages';
  static String page(String slug) => '/pages/$slug';
  static const String faqs = '/faqs';
  static const String contact = '/contact';
}
