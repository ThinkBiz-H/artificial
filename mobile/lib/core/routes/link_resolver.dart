import '../config/app_config.dart';
import 'route_paths.dart';

/// Translates CMS links (banner buttons, notification links) that were
/// authored for the website into in-app routes. Returns null for external
/// URLs that should open in the browser.
class LinkResolver {
  LinkResolver._();

  static String? toRoute(String raw) {
    var link = raw.trim();
    if (link.isEmpty) return null;
    final web = AppConfig.webBaseUrl;
    if (link.startsWith(web)) link = link.substring(web.length);
    if (link.startsWith('http://') || link.startsWith('https://')) return null;
    if (!link.startsWith('/')) link = '/$link';

    final uri = Uri.tryParse(link);
    if (uri == null) return RoutePaths.products;
    final segments = uri.pathSegments.where((s) => s.isNotEmpty).toList();
    if (segments.isEmpty) return RoutePaths.home;

    final head = segments.first.toLowerCase();
    final tail = segments.length > 1 ? segments[1] : null;
    final q = uri.queryParameters;

    switch (head) {
      case 'product':
      case 'products':
      case 'p':
        if (tail != null) return RoutePaths.product(tail);
        return RoutePaths.productList(
            categoryId: q['category'], keyword: q['keyword'] ?? q['q'], sale: q['sale'] == '1');
      case 'category':
      case 'categories':
      case 'collections':
        return tail != null ? RoutePaths.category(tail) : RoutePaths.browse;
      case 'shop':
        return RoutePaths.productList(
            categoryId: q['category'], keyword: q['keyword'] ?? q['q'], sale: q['sale'] == '1');
      case 'sale':
        return RoutePaths.collection('sale');
      case 'new-arrivals':
      case 'new':
        return RoutePaths.collection('new-arrivals');
      case 'best-sellers':
      case 'bestsellers':
        return RoutePaths.collection('best-sellers');
      case 'trending':
        return RoutePaths.collection('trending');
      case 'search':
        return RoutePaths.productList(keyword: q['q'] ?? q['keyword']);
      case 'cart':
        return RoutePaths.cart;
      case 'wishlist':
        return RoutePaths.wishlist;
      case 'account':
      case 'profile':
        if (tail == 'orders' && segments.length > 2) return RoutePaths.order(segments[2]);
        if (tail == 'orders') return RoutePaths.orders;
        return RoutePaths.account;
      case 'orders':
        return tail != null ? RoutePaths.order(tail) : RoutePaths.orders;
      case 'contact':
        return RoutePaths.contact;
      case 'faq':
      case 'help':
        return RoutePaths.help;
      case 'about':
      case 'about-us':
        return RoutePaths.page('about');
      case 'privacy-policy':
      case 'privacy':
        return RoutePaths.page('privacy');
      case 'terms':
      case 'terms-conditions':
        return RoutePaths.page('terms');
      case 'refund-policy':
        return RoutePaths.page('refund');
      case 'shipping-policy':
        return RoutePaths.page('shipping');
      case 'track-order':
        return RoutePaths.orders;
      case 'checkout':
        return RoutePaths.checkout;
      case 'page':
      case 'pages':
        return tail != null ? RoutePaths.page(tail) : RoutePaths.home;
      default:
        // The website renders any other top-level slug as a CMS page (routes/index.tsx).
        return RoutePaths.page(head);
    }
  }
}
