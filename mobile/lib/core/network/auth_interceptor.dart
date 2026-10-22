import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../services/token_manager.dart';
import 'api_endpoints.dart';

/// Attaches the Bearer access token and transparently refreshes it.
///
/// The backend issues the refresh token only as an httpOnly `refreshToken`
/// cookie (utils/generateTokens.js#issueTokens) but its refresh endpoint also
/// accepts `req.body.refreshToken` (auth.controller.js#refreshAccessToken).
/// So on mobile we read the cookie from the Set-Cookie header, keep it in
/// secure storage, and send it in the body — no backend change required.
class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor({required this.tokenManager, required this.plainDio});

  final TokenManager tokenManager;

  /// A Dio without this interceptor — used for the refresh call and for
  /// replaying the original request (avoids re-entering this queue).
  final Dio plainDio;

  static const List<String> _noRefreshPaths = [
    ApiEndpoints.refreshToken,
    ApiEndpoints.mobileVerify,
    ApiEndpoints.mobileLogin,
    ApiEndpoints.mobileRegister,
    ApiEndpoints.checkoutVerifyOtp,
    ApiEndpoints.logout,
  ];

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = tokenManager.accessToken;
    if (options.extra['skipAuth'] != true &&
        token != null &&
        token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onResponse(
      Response<dynamic> response, ResponseInterceptorHandler handler) async {
    final refresh = TokenManager.extractRefreshToken(response.headers);
    if (refresh != null) {
      await tokenManager.saveRefreshToken(refresh);
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final request = err.requestOptions;
    final isAuthPath = _noRefreshPaths.any((p) => request.path.endsWith(p));
    final canRefresh = err.response?.statusCode == 401 &&
        request.extra['skipAuth'] != true &&
        request.extra['retried'] != true &&
        !isAuthPath &&
        // Web keeps the refresh token in the browser's httpOnly cookie.
        (tokenManager.hasRefreshToken || (kIsWeb && tokenManager.accessToken != null));

    if (!canRefresh) {
      // auth.middleware.js#protect: a deactivated account gets 403 on every
      // protected call — end the session instead of failing each screen.
      final body = err.response?.data;
      final message = body is Map ? '${body['message'] ?? ''}' : '';
      if (err.response?.statusCode == 403 &&
          request.extra['skipAuth'] != true &&
          message.contains('deactivated') &&
          tokenManager.hasSession) {
        await _expireSession();
      }
      handler.next(err);
      return;
    }

    final sentHeader = request.headers['Authorization'];
    final sentToken =
        sentHeader is String ? sentHeader.replaceFirst('Bearer ', '') : null;

    try {
      var token = tokenManager.accessToken;
      // Another queued request may already have refreshed — only refresh if
      // the token this request carried is still the current one.
      if (token == null || token.isEmpty || token == sentToken) {
        token = await _refresh();
      }
      if (token == null) {
        await _expireSession();
        handler.next(err);
        return;
      }

      final retry = request.copyWith(
        headers: <String, dynamic>{
          ...request.headers,
          'Authorization': 'Bearer $token',
        },
        extra: <String, dynamic>{...request.extra, 'retried': true},
      );
      final response = await plainDio.fetch<dynamic>(retry);
      handler.resolve(response);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        await _expireSession();
      }
      handler.next(e);
    } catch (_) {
      handler.next(err);
    }
  }

  /// Returns the new access token, or null if the refresh token was
  /// rejected. Network failures are rethrown so the session is preserved.
  Future<String?> _refresh() async {
    final refreshToken = tokenManager.refreshToken;
    final cookieOnly = refreshToken == null || refreshToken.isEmpty;
    if (cookieOnly && !kIsWeb) return null;
    try {
      Future<Response<dynamic>> send() => plainDio.post<dynamic>(
            ApiEndpoints.refreshToken,
            data: cookieOnly ? <String, dynamic>{} : <String, dynamic>{'refreshToken': refreshToken},
          );
      Response<dynamic> res;
      try {
        res = await send();
      } on DioException catch (e) {
        // No response (timeout / dropped connection): the server may already
        // have rotated the token. Retry once at once, inside the backend's
        // 30 s rotation grace window, so the replacement token isn't lost.
        if (e.response != null) rethrow;
        res = await send();
      }
      final body = res.data;
      String? access;
      if (body is Map && body['data'] is Map) {
        final value = (body['data'] as Map)['accessToken'];
        if (value is String && value.isNotEmpty) access = value;
      }
      if (access == null) return null;
      final rotated = kIsWeb ? null : TokenManager.extractRefreshToken(res.headers);
      await tokenManager.saveTokens(
          accessToken: access, refreshToken: rotated ?? refreshToken);
      return access;
    } on DioException catch (e) {
      final code = e.response?.statusCode;
      if (code == 401 || code == 400 || code == 403) return null;
      rethrow;
    }
  }

  Future<void> _expireSession() async {
    await tokenManager.clear();
    tokenManager.notifySessionExpired();
  }
}
