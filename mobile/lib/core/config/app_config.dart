import 'package:flutter/foundation.dart';

class AppConfig {
  AppConfig._();

  static const String appName = 'Swastikala';
  static const String brandWordmark = 'SWASTIKALA';
  static const String tagline = 'Premium Artificial Jewellery';

  static const String _apiBaseUrlOverride = String.fromEnvironment(
    'API_BASE_URL',
  );

  /// Backend API URL
  static String get apiBaseUrl {
    if (_apiBaseUrlOverride.isNotEmpty) {
      return _apiBaseUrlOverride;
    }

    return 'http://72.62.114.184:5001/api/v1';
  }

  /// Website URL
  static const String webBaseUrl = String.fromEnvironment(
    'WEB_BASE_URL',
    defaultValue: 'http://72.62.114.184:5001',
  );

  static const String razorpayMerchantName = 'SWASTIKALA';
  static const String razorpayThemeHex = '#5A1E36';

  static const int pageSize = 12;
  static const int railSize = 10;
  static const int otpLength = 6;
  static const int otpResendSeconds = 60;
  static const int maxRecentSearches = 10;
  static const int maxRecentlyViewed = 20;

  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 60);

  static const Duration offlineCacheMaxAge = Duration(days: 7);

  static const String notificationChannelId = 'swastikala_updates';
  static const String notificationChannelName = 'Order & offer updates';
  static const String notificationChannelDescription =
      'Order status, payment and offer notifications from Swastikala';

  static String productShareUrl(String slug) => '$webBaseUrl/products/$slug';
}
