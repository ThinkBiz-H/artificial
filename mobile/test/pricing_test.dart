import 'package:flutter_test/flutter_test.dart';
import 'package:swastikala/core/models/checkout_quote.dart';
import 'package:swastikala/core/models/product_query.dart';
import 'package:swastikala/core/routes/link_resolver.dart';
import 'package:swastikala/core/routes/route_paths.dart';
import 'package:swastikala/core/utils/formatters.dart';
import 'package:swastikala/core/utils/validators.dart';

void main() {
  group('CheckoutQuote parses POST /checkout/quote', () {
    test('online: prepaid discount, GST included, enabled methods in backend order', () {
      final q = CheckoutQuote.fromJson({
        'subTotal': 1000,
        'couponCode': 'SAVE',
        'couponDiscount': 100,
        'couponError': null,
        'prepaidDiscount': 100,
        'prepaidDiscountPercent': 10,
        'shipping': {'quoted': true, 'charge': 0, 'free': true, 'estimatedDays': 4},
        'tax': 122.03,
        'taxIncluded': true,
        'grandTotal': 800,
        'paymentMethods': [
          {'id': 'razorpay', 'label': 'Pay online', 'description': 'UPI, cards', 'offer': 'Save 10% on prepaid'},
          {'id': 'cod', 'label': 'Cash on delivery', 'description': 'Pay when your order arrives', 'offer': null},
        ],
      });
      expect(q.grandTotal, 800);
      expect(q.taxIncluded, isTrue);
      expect(q.isFreeShipping, isTrue);
      expect(q.estimatedDays, 4);
      expect(q.paymentMethods.map((m) => m.id), ['razorpay', 'cod']);
      expect(q.paymentMethods.last.isCod, isTrue);
      expect(q.paymentMethods.first.offer, 'Save 10% on prepaid');
    });

    test('unquoted shipping and a rejected coupon', () {
      final q = CheckoutQuote.fromJson({
        'subTotal': 500,
        'couponError': 'Coupon expired',
        'shipping': {'quoted': false, 'charge': 0, 'free': false, 'estimatedDays': null},
        'grandTotal': 500,
        'paymentMethods': [
          {'id': 'cod', 'label': 'Cash on delivery', 'description': ''},
        ],
      });
      expect(q.shippingQuoted, isFalse);
      expect(q.isFreeShipping, isFalse);
      expect(q.estimatedDays, isNull);
      expect(q.couponError, 'Coupon expired');
      expect(q.couponDiscount, 0);
    });
  });

  test('ProductQuery maps to ApiFeatures bracket params', () {
    const q = ProductQuery(categoryId: 'c1', onSale: true, minPrice: 500, sort: ProductSort.priceLowHigh);
    final p = q.toQueryParameters(page: 2, limit: 12);
    expect(p['category'], 'c1');
    expect(p['salePrice[gt]'], 0);
    expect(p['price[gte]'], 500);
    expect(p['sort'], 'price');
    expect(p['status'], 'active');
    expect(p['page'], 2);
  });

  test('LinkResolver maps website links to app routes', () {
    expect(LinkResolver.toRoute('/product/gold-necklace'), RoutePaths.product('gold-necklace'));
    expect(LinkResolver.toRoute('/category/earrings'), RoutePaths.category('earrings'));
    expect(LinkResolver.toRoute('/sale'), RoutePaths.collection('sale'));
    expect(LinkResolver.toRoute('https://instagram.com/x'), isNull);
  });

  test('prices display as whole rupees (half up)', () {
    expect(Formatters.currency(298.72), '₹299');
    expect(Formatters.currency(298.50), '₹299');
    expect(Formatters.currency(298.49), '₹298');
    expect(Formatters.currency(1999.99), '₹2,000');
    expect(Formatters.currency(123456), '₹1,23,456');
    expect(Formatters.currency(0), '₹0');
  });

  test('mobile normalisation and validation', () {
    expect(Formatters.normalizeMobile('+91 98765 43210'), '9876543210');
    expect(Validators.mobile('9876543210'), isNull);
    expect(Validators.mobile('12345'), isNotNull);
    expect(Validators.pincode('110001'), isNull);
  });
}
