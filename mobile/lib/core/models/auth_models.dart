import 'json_converters.dart';
import 'user_model.dart';

/// Response of /auth/mobile/login|register|resend and /checkout/request-otp.
class OtpRequestResult {
  const OtpRequestResult({required this.expiresInMinutes, this.isExistingUser});
  final int expiresInMinutes;
  final bool? isExistingUser;

  factory OtpRequestResult.fromJson(Map<String, dynamic> json) => OtpRequestResult(
        expiresInMinutes: intFromJson(json['expiresInMinutes']) == 0
            ? 10
            : intFromJson(json['expiresInMinutes']),
        isExistingUser: json['isExistingUser'] is bool ? json['isExistingUser'] as bool : null,
      );
}

/// Response of /auth/mobile/verify and /checkout/verify-otp.
class AuthSession {
  const AuthSession({required this.user, required this.accessToken, this.isNewUser = false});
  final UserModel user;
  final String accessToken;
  final bool isNewUser;
}

enum OtpPurpose { login, register, checkout }
