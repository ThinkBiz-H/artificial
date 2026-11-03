import 'package:flutter_test/flutter_test.dart';
import 'package:swastikala/core/models/settings_model.dart';

void main() {
  group('Brand Management settings', () {
    final json = <String, dynamic>{
      'general': {'siteName': 'Old Name'},
      'brand': {
        'revision': 7,
        'logos': {
          'splashLogo': 'https://res.cloudinary.com/demo/image/upload/v1/splash.png',
          'appBarLogo': 'https://res.cloudinary.com/demo/image/upload/v1/bar.png',
          'loginLogo': '',
        },
        'company': {'brandName': 'Abj Jewellery'},
      },
    };

    test('parses per-slot logo URLs; empty slots fall back to the bundled logo', () {
      final s = PublicSettings.fromJson(json);
      expect(s.brandRevision, 7);
      expect(s.brandLogo('splashLogo'), contains('splash.png'));
      expect(s.brandLogo('appBarLogo'), contains('bar.png'));
      expect(s.brandLogo('loginLogo'), isNull);
      expect(s.brandLogo('drawerLogo'), isNull);
    });

    test('brand name from Brand Management wins over the legacy site name', () {
      expect(PublicSettings.fromJson(json).siteName, 'Abj Jewellery');
      expect(PublicSettings.fromJson({'general': {'siteName': 'Legacy'}}).siteName, 'Legacy');
    });

    test('older servers without brand data still parse', () {
      final s = PublicSettings.fromJson({'general': {'siteName': 'Legacy'}});
      expect(s.brandLogos, isEmpty);
      expect(s.brandRevision, 0);
    });

    test('offline cache round-trip keeps logos (used by the splash before network)', () {
      final cached = PublicSettings.fromJson(PublicSettings.fromJson(json).toCacheJson());
      expect(cached.brandLogo('splashLogo'), contains('splash.png'));
      expect(cached.siteName, 'Abj Jewellery');
    });
  });
}
