import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// The website pairing: Cormorant Garamond (display) + Inter (body, labels).
class AppTypography {
  AppTypography._();

  static TextTheme textTheme(Color ink, Color muted) {
    final display = GoogleFonts.cormorantGaramondTextTheme();
    final body = GoogleFonts.interTextTheme();
    return TextTheme(
      displayLarge: display.displayLarge?.copyWith(
          fontSize: 44, fontWeight: FontWeight.w600, color: ink, height: 1.05),
      displayMedium: display.displayMedium?.copyWith(
          fontSize: 36, fontWeight: FontWeight.w600, color: ink, height: 1.1),
      displaySmall: display.displaySmall?.copyWith(
          fontSize: 30, fontWeight: FontWeight.w600, color: ink),
      headlineLarge: display.headlineLarge?.copyWith(
          fontSize: 28, fontWeight: FontWeight.w600, color: ink),
      headlineMedium: display.headlineMedium?.copyWith(
          fontSize: 24, fontWeight: FontWeight.w600, color: ink),
      headlineSmall: display.headlineSmall?.copyWith(
          fontSize: 21, fontWeight: FontWeight.w600, color: ink),
      titleLarge: display.titleLarge?.copyWith(
          fontSize: 20, fontWeight: FontWeight.w700, color: ink),
      titleMedium: body.titleMedium?.copyWith(
          fontSize: 15, fontWeight: FontWeight.w500, color: ink, letterSpacing: 0.2),
      titleSmall: body.titleSmall?.copyWith(
          fontSize: 13.5, fontWeight: FontWeight.w500, color: ink, letterSpacing: 0.2),
      bodyLarge: body.bodyLarge?.copyWith(fontSize: 15, color: ink, height: 1.5),
      bodyMedium: body.bodyMedium?.copyWith(fontSize: 13.5, color: ink, height: 1.45),
      bodySmall: body.bodySmall?.copyWith(fontSize: 12, color: muted, height: 1.4),
      labelLarge: body.labelLarge?.copyWith(
          fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1.9, color: ink),
      labelMedium: body.labelMedium?.copyWith(
          fontSize: 12, fontWeight: FontWeight.w500, letterSpacing: 0.6, color: ink),
      labelSmall: body.labelSmall?.copyWith(
          fontSize: 10.5, fontWeight: FontWeight.w500, letterSpacing: 1.2, color: muted),
    );
  }

  /// Spaced uppercase wordmark style used for the brand name and overlines.
  static TextStyle wordmark(Color color, {double size = 22}) =>
      GoogleFonts.cormorantGaramond(
        fontSize: size,
        fontWeight: FontWeight.w700,
        letterSpacing: size * 0.28,
        color: color,
      );

  /// The website's `.eyebrow`: 11px, medium, 0.26em tracking.
  static TextStyle overline(Color color) => GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 2.86,
        color: color,
      );

  /// The website's `font-sub` (Playfair Display) — short descriptions, quotes.
  static TextStyle sub(Color color, {double size = 16}) => GoogleFonts.playfairDisplay(
        fontSize: size,
        height: 1.6,
        color: color,
      );

  static TextStyle price(Color color, {double size = 16}) => GoogleFonts.inter(
        fontSize: size,
        fontWeight: FontWeight.w600,
        color: color,
      );
}
