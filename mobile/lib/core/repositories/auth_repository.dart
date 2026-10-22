import 'dart:convert';

import '../network/api_client.dart';
import '../network/api_endpoints.dart';
import '../network/api_exception.dart';
import '../models/auth_models.dart';
import '../models/content_models.dart';
import '../models/user_model.dart';
import '../services/secure_storage_service.dart';
import '../services/token_manager.dart';

/// Mobile-OTP authentication (auth.controller.js Phase 7) + checkout OTP
/// (checkout.controller.js). Both verify endpoints issue the same tokens.
class AuthRepository {
  AuthRepository(this._api, this._tokens, this._secure);

  final ApiClient _api;
  final TokenManager _tokens;
  final SecureStorageService _secure;

  // ---------------- Login / register ----------------

  /// POST /auth/mobile/login — 404 means the number is not registered.
  Future<OtpRequestResult> requestLoginOtp(String mobile) async {
    final res = await _api.post(ApiEndpoints.mobileLogin,
        data: {'mobile': mobile}, auth: false);
    return OtpRequestResult.fromJson(res.data);
  }

  /// POST /auth/mobile/register — creates the account and sends an OTP.
  Future<OtpRequestResult> register({required String name, required String mobile}) async {
    final res = await _api.post(ApiEndpoints.mobileRegister,
        data: {'name': name.trim(), 'mobile': mobile}, auth: false);
    return OtpRequestResult.fromJson(res.data);
  }

  Future<OtpRequestResult> resendLoginOtp(String mobile) async {
    final res = await _api.post(ApiEndpoints.mobileResendOtp,
        data: {'mobile': mobile}, auth: false);
    return OtpRequestResult.fromJson(res.data);
  }

  /// POST /auth/mobile/verify → { user, accessToken } (+ refresh cookie).
  Future<AuthSession> verifyLoginOtp({required String mobile, required String otp}) async {
    final res = await _api.post(ApiEndpoints.mobileVerify,
        data: {'mobile': mobile, 'otp': otp}, auth: false);
    return _persistSession(res);
  }

  // ---------------- Checkout OTP ----------------

  Future<OtpRequestResult> requestCheckoutOtp({required String mobile, String? email}) async {
    final res = await _api.post(ApiEndpoints.checkoutRequestOtp, data: {
      'mobile': mobile,
      if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
    }, auth: false);
    return OtpRequestResult.fromJson(res.data);
  }

  Future<OtpRequestResult> resendCheckoutOtp(String mobile) async {
    final res = await _api.post(ApiEndpoints.checkoutResendOtp,
        data: {'mobile': mobile}, auth: false);
    return OtpRequestResult.fromJson(res.data);
  }

  /// POST /checkout/verify-otp — logs in an existing customer or creates the
  /// account (saving the shipping address) in a single step.
  Future<AuthSession> verifyCheckoutOtp({
    required String mobile,
    required String otp,
    String? name,
    String? email,
    Map<String, dynamic>? shippingAddress,
    bool saveAddress = true,
  }) async {
    final res = await _api.post(ApiEndpoints.checkoutVerifyOtp, data: {
      'mobile': mobile,
      'otp': otp,
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
      if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
      if (shippingAddress != null) 'shippingAddress': shippingAddress,
      'saveAddress': saveAddress,
    }, auth: false);
    return _persistSession(res);
  }

  /// GET /checkout/lookup-customer — prefill for returning customers.
  Future<CustomerLookup?> lookupCustomer(String mobile) async {
    try {
      final res = await _api.get(ApiEndpoints.checkoutLookupCustomer,
          query: {'mobile': mobile}, auth: false);
      if (res.data['found'] != true) return null;
      final customer = res.map('customer');
      return customer == null ? null : CustomerLookup.fromJson(customer);
    } on AppException {
      return null;
    }
  }

  // ---------------- Session ----------------

  Future<UserModel> me() async {
    final res = await _api.get(ApiEndpoints.me);
    final user = UserModel.fromJson(res.map('user') ?? const {});
    await cacheUser(user);
    return user;
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiEndpoints.logout);
    } on AppException {
      // Local logout must always succeed even if the server is unreachable.
    }
    await clearLocalSession();
  }

  Future<void> logoutAllDevices({bool keepCurrent = true}) async {
    await _api.post(ApiEndpoints.logoutAll, data: {'keepCurrentSession': keepCurrent});
    if (!keepCurrent) await clearLocalSession();
  }

  Future<List<SessionInfo>> sessions() async {
    final res = await _api.get(ApiEndpoints.sessions);
    return res.list('sessions').map(SessionInfo.fromJson).toList();
  }

  Future<void> revokeSession(String id) async {
    await _api.delete(ApiEndpoints.session(id));
  }

  Future<void> clearLocalSession() async {
    await _tokens.clear();
    await _secure.delete(SecureStorageService.userKey);
  }

  Future<UserModel?> cachedUser() async {
    final raw = await _secure.read(SecureStorageService.userKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      return UserModel.fromJson(Map<String, dynamic>.from(jsonDecode(raw) as Map));
    } catch (_) {
      return null;
    }
  }

  Future<void> cacheUser(UserModel user) =>
      _secure.write(SecureStorageService.userKey, jsonEncode(user.toJson()));

  Future<AuthSession> _persistSession(ApiResponse res) async {
    final token = res.data['accessToken'];
    final userJson = res.map('user');
    if (token is! String || token.isEmpty || userJson == null) {
      throw const AppException(AppErrorType.server,
          'Verification succeeded but no session was returned. Please try again.');
    }
    // The refresh token cookie was already captured by AuthInterceptor.
    await _tokens.saveAccessToken(token);
    final user = UserModel.fromJson(userJson);
    await cacheUser(user);
    return AuthSession(
      user: user,
      accessToken: token,
      isNewUser: res.data['isNewUser'] == true,
    );
  }
}
