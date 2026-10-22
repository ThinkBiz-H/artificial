import 'dart:async';

import 'package:dio/dio.dart';

import 'secure_storage_service.dart';

/// In-memory + secure-storage holder for the JWT pair. Loaded once at
/// startup (main.dart) so the Dio interceptor can read tokens synchronously.
class TokenManager {
  TokenManager(this._storage);

  final SecureStorageService _storage;
  String? _accessToken;
  String? _refreshToken;
  final StreamController<void> _expired = StreamController<void>.broadcast();

  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  bool get hasRefreshToken => _refreshToken != null && _refreshToken!.isNotEmpty;
  bool get hasSession =>
      (_accessToken != null && _accessToken!.isNotEmpty) || hasRefreshToken;

  /// Fires when a refresh attempt is rejected by the server.
  Stream<void> get onSessionExpired => _expired.stream;

  Future<void> load() async {
    _accessToken = await _storage.read(SecureStorageService.accessTokenKey);
    _refreshToken = await _storage.read(SecureStorageService.refreshTokenKey);
  }

  Future<void> saveAccessToken(String token) async {
    _accessToken = token;
    await _storage.write(SecureStorageService.accessTokenKey, token);
  }

  Future<void> saveRefreshToken(String token) async {
    _refreshToken = token;
    await _storage.write(SecureStorageService.refreshTokenKey, token);
  }

  Future<void> saveTokens({required String accessToken, String? refreshToken}) async {
    await saveAccessToken(accessToken);
    if (refreshToken != null && refreshToken.isNotEmpty) {
      await saveRefreshToken(refreshToken);
    }
  }

  Future<void> clear() async {
    _accessToken = null;
    _refreshToken = null;
    await _storage.delete(SecureStorageService.accessTokenKey);
    await _storage.delete(SecureStorageService.refreshTokenKey);
  }

  void notifySessionExpired() {
    if (!_expired.isClosed) _expired.add(null);
  }

  static final RegExp _cookiePattern = RegExp(r'refreshToken=([^;,\s]+)');

  /// Reads the rotated refresh token from `Set-Cookie: refreshToken=...`.
  static String? extractRefreshToken(Headers headers) {
    final cookies = headers.map['set-cookie'];
    if (cookies == null || cookies.isEmpty) return null;
    for (final cookie in cookies) {
      final match = _cookiePattern.firstMatch(cookie);
      if (match != null) {
        final value = match.group(1);
        if (value != null && value.isNotEmpty) {
          return Uri.decodeComponent(value);
        }
      }
    }
    return null;
  }

  void dispose() => _expired.close();
}
