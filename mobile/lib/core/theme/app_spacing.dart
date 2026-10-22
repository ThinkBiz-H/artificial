import 'package:flutter/material.dart';

class AppSpacing {
  AppSpacing._();
  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;

  static const EdgeInsets screen = EdgeInsets.symmetric(horizontal: md);
}

/// Website radii: --radius-lg 10, --radius-input/xl 14, --radius-card 18,
/// --radius-image/2xl 20, --radius-panel 28, --radius-pill.
class AppRadius {
  AppRadius._();
  static const double sm = 10;
  static const double md = 14;
  static const double card18 = 18;
  static const double lg = 20;
  static const double xl = 28;
  static const double pill = 999;

  static const BorderRadius card = BorderRadius.all(Radius.circular(card18));
  static const BorderRadius sheet =
      BorderRadius.vertical(top: Radius.circular(xl));
}

/// Website shadows: --shadow-soft / --shadow-lift (wine-tinted).
class AppShadows {
  AppShadows._();
  static const List<BoxShadow> soft = [
    BoxShadow(color: Color(0x0A5A1E36), blurRadius: 2, offset: Offset(0, 1)),
    BoxShadow(
        color: Color(0x1A5A1E36),
        blurRadius: 20,
        spreadRadius: -8,
        offset: Offset(0, 6)),
  ];
  static const List<BoxShadow> lifted = [
    BoxShadow(
        color: Color(0x475A1E36),
        blurRadius: 48,
        spreadRadius: -28,
        offset: Offset(0, 24)),
  ];
}

/// Website motion: --duration-instant 150 / fast 400 / normal 500 / slow 900,
/// eased with --ease-luxe.
class AppDurations {
  AppDurations._();
  static const Duration fast = Duration(milliseconds: 180);
  static const Duration medium = Duration(milliseconds: 400);
  static const Duration slow = Duration(milliseconds: 600);
  static const Curve luxe = Cubic(0.22, 1, 0.36, 1);
}
