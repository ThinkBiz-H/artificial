import 'package:flutter/material.dart';

import '../network/api_exception.dart';

extension BuildContextX on BuildContext {
  ThemeData get theme => Theme.of(this);
  ColorScheme get colors => Theme.of(this).colorScheme;
  TextTheme get text => Theme.of(this).textTheme;
  bool get isDark => Theme.of(this).brightness == Brightness.dark;
  Size get screenSize => MediaQuery.sizeOf(this);
  bool get isTablet => MediaQuery.sizeOf(this).shortestSide >= 600;

  /// Product grid column count for the current width.
  int get gridColumns {
    final width = MediaQuery.sizeOf(this).width;
    if (width >= 1000) return 4;
    if (width >= 640) return 3;
    return 2;
  }

  void showSnack(String message, {bool error = false, SnackBarAction? action}) {
    final messenger = ScaffoldMessenger.maybeOf(this);
    if (messenger == null) return;
    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        content: Row(
          children: [
            Icon(error ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
                color: error ? const Color(0xFFF2B8B5) : const Color(0xFFE8C4C0), size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(message)),
          ],
        ),
        action: action,
        duration: Duration(milliseconds: error ? 3800 : 2400),
      ));
  }

  void showError(Object error) => showSnack(AppException.from(error).message, error: true);

  void hideKeyboard() => FocusScope.of(this).unfocus();
}

extension StringX on String {
  String get capitalized => isEmpty ? this : this[0].toUpperCase() + substring(1);
}
