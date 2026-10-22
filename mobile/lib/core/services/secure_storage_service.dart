import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Keychain / EncryptedSharedPreferences backed storage for secrets:
/// access token, refresh token, the cached user and the Hive cipher key.
class SecureStorageService {
  SecureStorageService([FlutterSecureStorage? storage])
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(
                  accessibility: KeychainAccessibility.first_unlock),
            );

  final FlutterSecureStorage _storage;

  static const String accessTokenKey = 'sk_access_token';
  static const String refreshTokenKey = 'sk_refresh_token';
  static const String userKey = 'sk_user';
  static const String hiveCipherKey = 'sk_hive_cipher';

  Future<String?> read(String key) async {
    try {
      return await _storage.read(key: key);
    } catch (_) {
      return null;
    }
  }

  Future<void> write(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
    } catch (_) {
      // Keystore can transiently fail on some OEM devices; never crash.
    }
  }

  Future<void> delete(String key) async {
    try {
      await _storage.delete(key: key);
    } catch (_) {}
  }
}
