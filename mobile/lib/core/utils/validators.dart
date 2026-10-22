import 'formatters.dart';

/// Client-side mirrors of the backend express-validator rules, so the
/// customer sees field-level messages (production 422s carry no details).
class Validators {
  Validators._();

  static String? required(String? value, [String label = 'This field']) =>
      (value == null || value.trim().isEmpty) ? '$label is required' : null;

  static String? mobile(String? value) {
    if (value == null || value.trim().isEmpty) return 'Mobile number is required';
    final digits = Formatters.normalizeMobile(value);
    if (!RegExp(r'^[6-9][0-9]{9}$').hasMatch(digits)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  }

  static String? optionalEmail(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    return email(value);
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$').hasMatch(value.trim())) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? name(String? value) {
    if (value == null || value.trim().isEmpty) return 'Name is required';
    if (value.trim().length < 2) return 'Name is too short';
    return null;
  }

  static String? pincode(String? value) {
    if (value == null || value.trim().isEmpty) return 'Pincode is required';
    if (!RegExp(r'^[1-9][0-9]{5}$').hasMatch(value.trim())) {
      return 'Enter a valid 6-digit pincode';
    }
    return null;
  }

  static String? otp(String? value, {int length = 6}) {
    if (value == null || value.length != length) return 'Enter the $length-digit OTP';
    if (!RegExp(r'^[0-9]+$').hasMatch(value)) return 'OTP must contain digits only';
    return null;
  }

  static String? minLength(String? value, int min, String label) {
    if (value == null || value.trim().length < min) {
      return '$label must be at least $min characters';
    }
    return null;
  }
}
