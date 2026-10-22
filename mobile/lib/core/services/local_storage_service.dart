import 'dart:convert';

import 'package:hive_flutter/hive_flutter.dart';

import '../config/app_config.dart';
import 'secure_storage_service.dart';

/// Hive-backed local storage. Boxes holding user data are AES encrypted
/// with a key that lives in the platform keystore (SecureStorageService).
/// Values are stored as JSON strings — no TypeAdapters / code-gen needed.
class LocalStorageService {
  LocalStorageService._(this._app, this._cache, this._user);

  final Box<dynamic> _app;
  final Box<dynamic> _cache;
  final Box<dynamic> _user;

  static const String _appBox = 'sk_app';
  static const String _cacheBox = 'sk_api_cache';
  static const String _userBox = 'sk_user_data';

  static const String _kTheme = 'theme_mode';
  static const String _kOnboarding = 'onboarding_done';
  static const String _kPushEnabled = 'push_enabled';
  static const String _kGuestCart = 'guest_cart';
  static const String _kGuestWishlist = 'guest_wishlist';
  static const String _kWishlistIds = 'wishlist_ids';
  static const String _kRecentSearches = 'recent_searches';
  static const String _kRecentlyViewed = 'recently_viewed';
  static const String _kLastPushToken = 'last_push_token';

  static Future<LocalStorageService> init(SecureStorageService secure) async {
    await Hive.initFlutter();
    final cipher = HiveAesCipher(await _cipherKey(secure));
    final app = await _open(_appBox);
    final cache = await _open(_cacheBox, cipher: cipher);
    final user = await _open(_userBox, cipher: cipher);
    return LocalStorageService._(app, cache, user);
  }

  static Future<List<int>> _cipherKey(SecureStorageService secure) async {
    final existing = await secure.read(SecureStorageService.hiveCipherKey);
    if (existing != null && existing.isNotEmpty) {
      try {
        return base64Url.decode(existing);
      } catch (_) {}
    }
    final key = Hive.generateSecureKey();
    await secure.write(SecureStorageService.hiveCipherKey, base64UrlEncode(key));
    return key;
  }

  /// Opens a box; if it is corrupt or was encrypted with a lost key (e.g.
  /// keystore wiped after restore), it is deleted and recreated.
  static Future<Box<dynamic>> _open(String name, {HiveCipher? cipher}) async {
    try {
      return await Hive.openBox<dynamic>(name, encryptionCipher: cipher);
    } catch (_) {
      await Hive.deleteBoxFromDisk(name);
      return Hive.openBox<dynamic>(name, encryptionCipher: cipher);
    }
  }

  // ---------------- JSON helpers ----------------
  dynamic _readJson(Box<dynamic> box, String key) {
    final raw = box.get(key);
    if (raw is! String) return null;
    try {
      return jsonDecode(raw);
    } catch (_) {
      return null;
    }
  }

  Future<void> _writeJson(Box<dynamic> box, String key, Object? value) =>
      box.put(key, jsonEncode(value));

  List<Map<String, dynamic>> _readMapList(Box<dynamic> box, String key) {
    final value = _readJson(box, key);
    if (value is! List) return <Map<String, dynamic>>[];
    return value
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  // ---------------- App prefs ----------------
  String get themeMode => (_app.get(_kTheme) as String?) ?? 'system';
  Future<void> setThemeMode(String mode) => _app.put(_kTheme, mode);

  bool get onboardingDone => (_app.get(_kOnboarding) as bool?) ?? false;
  Future<void> setOnboardingDone() => _app.put(_kOnboarding, true);

  bool get pushEnabled => (_app.get(_kPushEnabled) as bool?) ?? true;
  Future<void> setPushEnabled(bool value) => _app.put(_kPushEnabled, value);

  String? get lastPushToken => _app.get(_kLastPushToken) as String?;
  Future<void> setLastPushToken(String? token) => token == null
      ? _app.delete(_kLastPushToken)
      : _app.put(_kLastPushToken, token);

  // ---------------- API response cache (offline support) ----------------
  Future<void> putCache(String key, Object value) => _cache.put(
        key,
        jsonEncode(<String, dynamic>{
          't': DateTime.now().millisecondsSinceEpoch,
          'v': value,
        }),
      );

  dynamic getCache(String key, {Duration? maxAge}) {
    final entry = _readJson(_cache, key);
    if (entry is! Map) return null;
    final saved = entry['t'];
    if (maxAge != null && saved is int) {
      final age = DateTime.now()
          .difference(DateTime.fromMillisecondsSinceEpoch(saved));
      if (age > maxAge) return null;
    }
    return entry['v'];
  }

  Future<void> clearCache() => _cache.clear();

  /// Cache key of the signed-in customer's server cart (offline fallback).
  static const String cartCacheKey = 'cart';

  // ---------------- Guest cart ----------------
  List<Map<String, dynamic>> get guestCart => _readMapList(_user, _kGuestCart);
  Future<void> saveGuestCart(List<Map<String, dynamic>> items) =>
      _writeJson(_user, _kGuestCart, items);
  Future<void> clearGuestCart() => _user.delete(_kGuestCart);

  // ---------------- Wishlist ----------------
  List<Map<String, dynamic>> get guestWishlist =>
      _readMapList(_user, _kGuestWishlist);
  Future<void> saveGuestWishlist(List<Map<String, dynamic>> products) =>
      _writeJson(_user, _kGuestWishlist, products);
  Future<void> clearGuestWishlist() => _user.delete(_kGuestWishlist);

  Set<String> get wishlistIds {
    final value = _readJson(_user, _kWishlistIds);
    if (value is! List) return <String>{};
    return value.map((e) => e.toString()).toSet();
  }

  Future<void> saveWishlistIds(Set<String> ids) =>
      _writeJson(_user, _kWishlistIds, ids.toList());

  // ---------------- Recent searches ----------------
  List<String> get recentSearches {
    final value = _readJson(_user, _kRecentSearches);
    if (value is! List) return <String>[];
    return value.map((e) => e.toString()).toList();
  }

  Future<void> addRecentSearch(String term) async {
    final clean = term.trim();
    if (clean.isEmpty) return;
    final list = recentSearches
      ..removeWhere((e) => e.toLowerCase() == clean.toLowerCase())
      ..insert(0, clean);
    await _writeJson(
        _user, _kRecentSearches, list.take(AppConfig.maxRecentSearches).toList());
  }

  Future<void> removeRecentSearch(String term) async {
    final list = recentSearches..remove(term);
    await _writeJson(_user, _kRecentSearches, list);
  }

  Future<void> clearRecentSearches() => _user.delete(_kRecentSearches);

  // ---------------- Recently viewed (works for guests too) ----------------
  List<Map<String, dynamic>> get recentlyViewed =>
      _readMapList(_user, _kRecentlyViewed);

  Future<void> addRecentlyViewed(Map<String, dynamic> productJson) async {
    final id = productJson['_id']?.toString();
    if (id == null || id.isEmpty) return;
    final list = recentlyViewed
      ..removeWhere((e) => e['_id']?.toString() == id)
      ..insert(0, productJson);
    await _writeJson(_user, _kRecentlyViewed,
        list.take(AppConfig.maxRecentlyViewed).toList());
  }

  Future<void> clearRecentlyViewed() => _user.delete(_kRecentlyViewed);

  /// Called on logout: server-synced user data is dropped; recent searches
  /// and recently-viewed (device level, non-sensitive) are kept.
  Future<void> clearSessionData() async {
    await _user.delete(_kGuestCart);
    await _user.delete(_kGuestWishlist);
    await _user.delete(_kWishlistIds);
    await _cache.delete(cartCacheKey);
  }
}
