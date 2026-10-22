import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static final NumberFormat _inrWhole =
      NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

  /// The single price formatter for every amount shown in the app: rounded to
  /// the nearest whole rupee (half up — ₹298.50 → ₹299, ₹298.49 → ₹298) with
  /// Indian digit grouping (₹1,23,456). Display only — amounts sent to the
  /// API, Razorpay and totals keep their exact values.
  static String currency(num value) => _inrWhole.format(value.round());

  static String date(DateTime? value) =>
      value == null ? '' : DateFormat('d MMM yyyy').format(value.toLocal());

  static String dateTime(DateTime? value) =>
      value == null ? '' : DateFormat('d MMM yyyy, h:mm a').format(value.toLocal());

  static String shortDay(DateTime value) => DateFormat('EEE, d MMM').format(value.toLocal());

  static String relative(DateTime? value) {
    if (value == null) return '';
    final diff = DateTime.now().difference(value.toLocal());
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return date(value);
  }

  /// "98765 43210"
  static String mobile(String? value) {
    if (value == null) return '';
    final digits = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length == 10) return '${digits.substring(0, 5)} ${digits.substring(5)}';
    return value;
  }

  /// Normalises user input to the 10-digit form the backend stores.
  static String normalizeMobile(String input) {
    var digits = input.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length == 12 && digits.startsWith('91')) digits = digits.substring(2);
    if (digits.length == 11 && digits.startsWith('0')) digits = digits.substring(1);
    return digits;
  }

  static String titleCase(String value) => value
      .split(RegExp(r'[\s_]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
      .join(' ');

  static String stripHtml(String html) => html
      .replaceAll(RegExp(r'<br\s*/?>', caseSensitive: false), '\n')
      .replaceAll(RegExp(r'</p>', caseSensitive: false), '\n')
      .replaceAll(RegExp(r'<[^>]*>'), '')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&amp;', '&')
      .replaceAll('&#39;', "'")
      .replaceAll('&quot;', '"')
      .replaceAll(RegExp(r'\n{3,}'), '\n\n')
      .trim();

  static bool looksLikeHtml(String value) => RegExp(r'<[a-zA-Z][^>]*>').hasMatch(value);

  /// 0.5 → "0.5", 2.0 → "2".
  static String trimNumber(num value) =>
      value % 1 == 0 ? value.toInt().toString() : value.toString();
}
