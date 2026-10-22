/// Central route table. Use these helpers instead of hand-written strings.
class RoutePaths {
  RoutePaths._();

  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String otp = '/otp';
  static const String maintenance = '/maintenance';

  // Bottom-navigation tabs
  static const String home = '/home';
  static const String categories = '/categories';
  static const String wishlist = '/wishlist';
  static const String cart = '/cart';
  static const String account = '/account';

  static const String search = '/search';
  static const String products = '/products';
  static const String checkout = '/checkout';
  static const String orders = '/orders';
  static const String addresses = '/addresses';
  static const String addressForm = '/addresses/form';
  static const String notifications = '/notifications';
  static const String editProfile = '/profile/edit';
  static const String settings = '/settings';
  static const String sessions = '/settings/sessions';
  static const String help = '/help';
  static const String contact = '/contact';
  static const String recentlyViewed = '/recently-viewed';
  static const String collections = '/collections';

  /// Category menu (all collections), opened from the Shop tab.
  static const String browse = '/browse';
  static const String coupons = '/coupons';
  static const String support = '/support';

  static String product(String slug) => '/product/${Uri.encodeComponent(slug)}';
  static String category(String slug) => '/category/${Uri.encodeComponent(slug)}';
  static String collection(String type) => '/collection/$type';
  static String order(String id) => '/orders/$id';
  static String trackOrder(String id) => '/orders/$id/track';
  static String orderSuccess(String id) => '/order-success/$id';
  static String page(String key) => '/page/$key';
  static String reviews(String productId) => '/reviews/$productId';

  /// Contact form prefilled for an order (returns are handled by the store team).
  static String contactAboutOrder(String orderNumber) =>
      '$contact?order=${Uri.encodeComponent(orderNumber)}';

  static String loginWithRedirect(String? from) =>
      from == null || from.isEmpty ? login : '$login?from=${Uri.encodeComponent(from)}';

  static String productList({
    String? categoryId,
    String? brandId,
    String? title,
    String? keyword,
    bool sale = false,
  }) {
    final params = <String, String>{
      if (categoryId != null && categoryId.isNotEmpty) 'category': categoryId,
      if (brandId != null && brandId.isNotEmpty) 'brand': brandId,
      if (title != null && title.isNotEmpty) 'title': title,
      if (keyword != null && keyword.isNotEmpty) 'q': keyword,
      if (sale) 'sale': '1',
    };
    return Uri(path: products, queryParameters: params.isEmpty ? null : params).toString();
  }

  /// Routes that require an authenticated session.
  static const List<String> protectedPrefixes = [
    orders,
    addresses,
    notifications,
    editProfile,
    sessions,
  ];
}
