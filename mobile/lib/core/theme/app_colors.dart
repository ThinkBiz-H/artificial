import 'package:flutter/material.dart';

/// Swastikala palette — the website's design tokens (frontend/src/index.css).
class AppColors {
  AppColors._();

  // Brand
  static const Color wine = Color(0xFF5A1E36); // --color-primary
  static const Color wineDark = Color(0xFF3F1426);
  static const Color wineLight = Color(0xFF7B2749); // --color-primary-hover
  static const Color roseGold = Color(0xFF8B5E3C); // --color-accent
  static const Color roseGoldSoft = Color(0xFFC79A74); // --color-accent-soft (stars, ornaments)
  static const Color roseGoldLight = Color(0xFFE2C4A6); // --color-accent-light
  static const Color champagne = Color(0xFFF5EEE8); // --color-surface-muted
  static const Color gold = Color(0xFFD4AF37); // --color-gold
  static const Color goldDeep = Color(0xFFA07D4A); // --color-gold-deep
  static const Color cream = Color(0xFFFAF7F2); // --color-cream
  static const Color espresso = Color(0xFF2D2523); // --color-espresso

  // Light neutrals
  static const Color ivory = Color(0xFFFFF9F5); // --color-canvas
  static const Color ivoryDeep = Color(0xFFF5EEE8); // --color-surface-muted
  static const Color surface = Color(0xFFFFFFFF);
  static const Color ink = Color(0xFF241419); // --color-fg
  static const Color inkSoft = Color(0xFF4A3A3F); // --color-fg-soft
  static const Color muted = Color(0xFF75656A); // --color-fg-muted
  static const Color placeholder = Color(0xFFA0918F);
  static const Color border = Color(0xFFEADFD6);
  static const Color borderStrong = Color(0xFFD3C2B5);

  // Dark neutrals (--color-surface-dark / --color-surface-raised)
  static const Color nightBg = Color(0xFF16120F);
  static const Color nightSurface = Color(0xFF1F1918);
  static const Color nightSurfaceHigh = Color(0xFF2A1D1F);
  static const Color nightBorder = Color(0xFF3A2C2C);
  static const Color nightText = Color(0xFFFFF9F5);
  static const Color nightMuted = Color(0xFFB3A2A7);

  // Semantic
  static const Color success = Color(0xFF1F7A4C);
  static const Color successSoft = Color(0xFFE7F3EC);
  static const Color warning = Color(0xFF8A5A12);
  static const Color warningSoft = Color(0xFFFBF1DF);
  static const Color error = Color(0xFFB3261E);
  static const Color errorSoft = Color(0xFFFBECEB);
  static const Color info = Color(0xFF5A1E36);
  static const Color infoSoft = Color(0xFFF6E9EE);

  /// The website's `.gold-rule` hairline.
  static const LinearGradient goldRule = LinearGradient(
    colors: [Color(0x00D4AF37), gold, Color(0x00D4AF37)],
  );

  static const LinearGradient roseGoldGradient = LinearGradient(
    colors: [roseGoldLight, roseGoldSoft, roseGold],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient wineGradient = LinearGradient(
    colors: [wineLight, wine, wineDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient imageScrim = LinearGradient(
    colors: [Color(0x00000000), Color(0xB316120F)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
