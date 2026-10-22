import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/auth_models.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';

/// Arguments passed from the login screen to the OTP screen.
class OtpArgs {
  const OtpArgs({
    required this.mobile,
    required this.purpose,
    required this.expiresInMinutes,
    this.redirectTo,
  });

  final String mobile;
  final OtpPurpose purpose;
  final int expiresInMinutes;
  final String? redirectTo;
}

class AuthFlowState {
  const AuthFlowState({this.loading = false, this.needsName = false, this.error});

  final bool loading;

  /// True when /auth/mobile/login returned 404 → collect name & register.
  final bool needsName;
  final String? error;

  AuthFlowState copyWith({bool? loading, bool? needsName, String? error, bool clearError = false}) =>
      AuthFlowState(
        loading: loading ?? this.loading,
        needsName: needsName ?? this.needsName,
        error: clearError ? null : (error ?? this.error),
      );
}

class AuthFlowViewModel extends AutoDisposeNotifier<AuthFlowState> {
  @override
  AuthFlowState build() => const AuthFlowState();

  void resetToMobile() => state = const AuthFlowState();

  /// Step 1: request a login OTP; falls back to the registration step for
  /// unknown numbers. Returns OTP args when an OTP was sent.
  Future<OtpArgs?> continueWithMobile(String mobile, {String? redirectTo}) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final result = await ref.read(authRepositoryProvider).requestLoginOtp(mobile);
      state = state.copyWith(loading: false);
      return OtpArgs(
        mobile: mobile,
        purpose: OtpPurpose.login,
        expiresInMinutes: result.expiresInMinutes,
        redirectTo: redirectTo,
      );
    } on AppException catch (e) {
      if (e.isNotFound) {
        state = const AuthFlowState(needsName: true);
        return null;
      }
      state = state.copyWith(loading: false, error: e.message);
      return null;
    }
  }

  /// Step 1b: new customer — POST /auth/mobile/register.
  Future<OtpArgs?> register({required String name, required String mobile, String? redirectTo}) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final result = await ref.read(authRepositoryProvider).register(name: name, mobile: mobile);
      state = state.copyWith(loading: false);
      return OtpArgs(
        mobile: mobile,
        purpose: OtpPurpose.register,
        expiresInMinutes: result.expiresInMinutes,
        redirectTo: redirectTo,
      );
    } on AppException catch (e) {
      if (e.type == AppErrorType.conflict) {
        state = const AuthFlowState();
        return continueWithMobile(mobile, redirectTo: redirectTo);
      }
      state = state.copyWith(loading: false, error: e.message);
      return null;
    }
  }
}

final authFlowProvider =
    AutoDisposeNotifierProvider<AuthFlowViewModel, AuthFlowState>(AuthFlowViewModel.new);

class OtpVerifyState {
  const OtpVerifyState({this.verifying = false, this.resending = false, this.secondsLeft = 0, this.error});

  final bool verifying;
  final bool resending;
  final int secondsLeft;
  final String? error;

  OtpVerifyState copyWith({bool? verifying, bool? resending, int? secondsLeft, String? error, bool clearError = false}) =>
      OtpVerifyState(
        verifying: verifying ?? this.verifying,
        resending: resending ?? this.resending,
        secondsLeft: secondsLeft ?? this.secondsLeft,
        error: clearError ? null : (error ?? this.error),
      );
}

/// Shared OTP verification + resend-cooldown logic (login & checkout).
class OtpVerifyViewModel extends AutoDisposeNotifier<OtpVerifyState> {
  Timer? _timer;

  @override
  OtpVerifyState build() {
    ref.onDispose(() => _timer?.cancel());
    return const OtpVerifyState();
  }

  void startCooldown(int seconds) {
    _timer?.cancel();
    state = state.copyWith(secondsLeft: seconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      final next = state.secondsLeft - 1;
      if (next <= 0) {
        t.cancel();
        state = state.copyWith(secondsLeft: 0);
      } else {
        state = state.copyWith(secondsLeft: next);
      }
    });
  }

  /// Parses "Please wait 37s before…" (otp.service.js) into a cooldown.
  void _applyServerCooldown(AppException e) {
    final match = RegExp(r'wait (\d+)s').firstMatch(e.message);
    if (match != null) startCooldown(int.parse(match.group(1)!));
  }

  Future<bool> verifyLogin(OtpArgs args, String otp) async {
    state = state.copyWith(verifying: true, clearError: true);
    try {
      final session = await ref
          .read(authRepositoryProvider)
          .verifyLoginOtp(mobile: args.mobile, otp: otp);
      await ref.read(authProvider.notifier).completeLogin(session);
      state = state.copyWith(verifying: false);
      return true;
    } on AppException catch (e) {
      state = state.copyWith(verifying: false, error: e.message);
      return false;
    }
  }

  Future<bool> resendLogin(String mobile, int cooldown) async {
    state = state.copyWith(resending: true, clearError: true);
    try {
      await ref.read(authRepositoryProvider).resendLoginOtp(mobile);
      state = state.copyWith(resending: false);
      startCooldown(cooldown);
      return true;
    } on AppException catch (e) {
      state = state.copyWith(resending: false, error: e.message);
      _applyServerCooldown(e);
      return false;
    }
  }

  Future<bool> resendCheckout(String mobile, int cooldown) async {
    state = state.copyWith(resending: true, clearError: true);
    try {
      await ref.read(authRepositoryProvider).resendCheckoutOtp(mobile);
      state = state.copyWith(resending: false);
      startCooldown(cooldown);
      return true;
    } on AppException catch (e) {
      state = state.copyWith(resending: false, error: e.message);
      _applyServerCooldown(e);
      return false;
    }
  }

  void setVerifying(bool value) => state = state.copyWith(verifying: value, clearError: true);
  void setError(String message) => state = state.copyWith(verifying: false, error: message);
}

final otpVerifyProvider =
    AutoDisposeNotifierProvider<OtpVerifyViewModel, OtpVerifyState>(OtpVerifyViewModel.new);
