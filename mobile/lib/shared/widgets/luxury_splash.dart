import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import 'brand_logo.dart';

/// Splash palette — deep black/charcoal stage with champagne and rose gold light.
class SplashPalette {
  SplashPalette._();

  static const Color black = Color(0xFF0F0F0F);
  static const Color charcoal = Color(0xFF1A1A1A);
  static const Color champagneGold = AppColors.gold; // #D4AF37
  static const Color roseGold = AppColors.roseGoldSoft;
  static const Color softWhite = Color(0xFFFFF8EC);
}

/// Premium animated brand intro. Purely visual — the screen hosting it owns
/// timing and navigation.
///
/// [intro] runs 0 → 1 once and drives the sequence:
///   background fade → gold particles → logo scale 0.85 → 1.0 →
///   one glow pulse → sparkle sweep across the logo → hold.
/// [ambient] runs 0 → 1 linearly over [ambientSpan] and keeps particles,
/// bokeh and the shine rays drifting while the host waits.
///
/// Everything animates through opacity/transform or a single cheap
/// CustomPainter behind a RepaintBoundary, so frames stay GPU-light.
class LuxurySplashView extends StatelessWidget {
  const LuxurySplashView({
    super.key,
    required this.intro,
    required this.ambient,
    this.ambientSpan = const Duration(seconds: 60),
    this.logoUrl,
  });

  final Animation<double> intro;
  final Animation<double> ambient;
  final Duration ambientSpan;

  /// Admin splash logo (Brand Management); null = the bundled logo.
  final String? logoUrl;

  // Sequence windows on the intro timeline (fractions of its duration).
  static const Interval _background = Interval(
    0.0,
    0.14,
    curve: Curves.easeOut,
  );
  static const Interval _particles = Interval(
    0.09,
    0.45,
    curve: Curves.easeInOut,
  );
  static const Interval _logoIn = Interval(
    0.13,
    0.48,
    curve: Curves.easeOutCubic,
  );
  static const Interval _sweep = Interval(
    0.50,
    0.70,
    curve: Curves.easeInOutSine,
  );
  static const Interval _twinkle = Interval(0.62, 0.84);

  /// Logo aspect ratio (logo.jpeg  is 1264 × 843).
  static const double _logoAspect = 1264 / 843;

  @override
  Widget build(BuildContext context) {
    final backgroundIn = intro.drive(CurveTween(curve: _background));
    final particlesIn = intro.drive(CurveTween(curve: _particles));
    final logoOpacity = intro.drive(CurveTween(curve: _logoIn));
    final logoScale = intro
        .drive(CurveTween(curve: _logoIn))
        .drive(Tween(begin: 0.85, end: 1.0));

    // Glow: eases in with the logo, pulses once, then settles to a soft halo.
    final glow = intro.drive(
      TweenSequence<double>([
        TweenSequenceItem(tween: ConstantTween(0.0), weight: 13),
        TweenSequenceItem(
          tween: Tween(
            begin: 0.0,
            end: 0.35,
          ).chain(CurveTween(curve: Curves.easeOut)),
          weight: 25,
        ),
        TweenSequenceItem(
          tween: Tween(
            begin: 0.35,
            end: 1.0,
          ).chain(CurveTween(curve: Curves.easeOut)),
          weight: 10,
        ),
        TweenSequenceItem(
          tween: Tween(
            begin: 1.0,
            end: 0.45,
          ).chain(CurveTween(curve: Curves.easeInOut)),
          weight: 14,
        ),
        TweenSequenceItem(tween: ConstantTween(0.45), weight: 38),
      ]),
    );
    final raysOpacity = intro
        .drive(CurveTween(curve: _logoIn))
        .drive(Tween(begin: 0.0, end: 0.8));
    final raysTurns = ambient.drive(
      Tween(begin: 0.0, end: ambientSpan.inSeconds / 45),
    ); // one turn per 45s

    return ColoredBox(
      color: SplashPalette.black,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Background — soft charcoal spotlight over deep black.
          FadeTransition(
            opacity: backgroundIn,
            child: const DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0, -0.15),
                  radius: 1.1,
                  colors: [
                    Color(0xFF2A2420),
                    SplashPalette.charcoal,
                    SplashPalette.black,
                  ],
                  stops: [0.0, 0.45, 1.0],
                ),
              ),
            ),
          ),
          // 2. Bokeh + gold particles (one painter, isolated repaints).
          RepaintBoundary(
            child: CustomPaint(
              painter: _AmbientPainter(
                ambient: ambient,
                reveal: particlesIn,
                span: ambientSpan,
              ),
            ),
          ),
          // 3. Logo stage, centred inside the safe area.
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final logoWidth = (constraints.maxWidth * 0.64)
                    .clamp(180.0, 340.0)
                    .toDouble();
                final logoHeight = logoWidth / _logoAspect;
                final stage = logoWidth * 1.9;
                return Center(
                  child: SizedBox(
                    width: stage,
                    height: stage,
                    child: Stack(
                      alignment: Alignment.center,
                      clipBehavior: Clip.none,
                      children: [
                        // Jewellery shine — slow rotating light rays behind the logo.
                        FadeTransition(
                          opacity: raysOpacity,
                          child: RotationTransition(
                            turns: raysTurns,
                            child: RepaintBoundary(
                              child: _ShineRays(size: stage),
                            ),
                          ),
                        ),
                        // Soft gold glow, pulsing once.
                        FadeTransition(
                          opacity: glow,
                          child: _GoldGlow(
                            width: logoWidth * 1.55,
                            height: logoHeight * 1.9,
                          ),
                        ),
                        // The logo itself — scales 0.85 → 1.0 while fading in.
                        FadeTransition(
                          opacity: logoOpacity,
                          child: ScaleTransition(
                            scale: logoScale,
                            child: _LogoCard(
                            logoUrl: logoUrl,
                              width: logoWidth,
                              height: logoHeight,
                              sweep: intro.drive(CurveTween(curve: _sweep)),
                              twinkle: intro.drive(CurveTween(curve: _twinkle)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// The official logo on a softly lit card, with the sparkle sweep and a
/// twinkle on the logo's diamond. The logo image itself is never altered.
class _LogoCard extends StatelessWidget {
  const _LogoCard({
    this.logoUrl,
    required this.width,
    required this.height,
    required this.sweep,
    required this.twinkle,
  });

  final double width;
  final double height;
  final Animation<double> sweep;
  final Animation<double> twinkle;
  final String? logoUrl;

  // Centre of the diamond above the "A" in logo.jpeg , as image fractions.
  static const Alignment _diamond = Alignment(-0.19, -0.63);

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(width * 0.06);
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: radius,
        border: Border.all(
          color: SplashPalette.champagneGold.withValues(alpha: 0.45),
          width: 0.8,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.55),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: radius,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Admin splash logo when set (cached on disk), else the bundled one.
            ColoredBox(
              color: SplashPalette.softWhite,
              child: BrandImage(url: logoUrl, fit: BoxFit.contain, fallbackAsset: AppConfig.logoAsset),
            ),
            // Sparkle sweep — a diagonal band of light crossing the card once.
            IgnorePointer(
              child: AnimatedBuilder(
                animation: sweep,
                builder: (context, child) {
                  final t = sweep.value;
                  if (t <= 0 || t >= 1) return const SizedBox.shrink();
                  return Transform.translate(
                    offset: Offset(-width * 0.6 + t * width * 1.8, 0),
                    child: child,
                  );
                },
                child: OverflowBox(
                  alignment: Alignment.centerLeft,
                  minWidth: 0,
                  maxWidth: double.infinity,
                  minHeight: 0,
                  maxHeight: double.infinity,
                  child: Transform.rotate(
                    angle: 0.32,
                    child: Container(
                      width: width * 0.28,
                      height: height * 1.8,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.white.withValues(alpha: 0),
                            Colors.white.withValues(alpha: 0.35),
                            Colors.white.withValues(alpha: 0.95),
                            Colors.white.withValues(alpha: 0.35),
                            Colors.white.withValues(alpha: 0),
                          ],
                          stops: const [0.0, 0.38, 0.5, 0.62, 1.0],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            // Twinkle on the diamond once the sweep has passed.
            IgnorePointer(
              child: Align(
                alignment: _diamond,
                child: AnimatedBuilder(
                  animation: twinkle,
                  builder: (context, _) {
                    final t = twinkle.value;
                    final s = t <= 0 || t >= 1 ? 0.0 : math.sin(t * math.pi);
                    if (s == 0) return const SizedBox.shrink();
                    return Transform.scale(
                      scale: 0.4 + s * 0.6,
                      child: Opacity(
                        opacity: s,
                        child: CustomPaint(
                          size: Size.square(width * 0.16),
                          painter: const _StarPainter(),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Soft champagne glow behind the logo (radial gradient — no blur filters).
class _GoldGlow extends StatelessWidget {
  const _GoldGlow({required this.width, required this.height});
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.all(
          Radius.elliptical(width / 2, height / 2),
        ),
        gradient: RadialGradient(
          colors: [
            SplashPalette.champagneGold.withValues(alpha: 0.42),
            SplashPalette.champagneGold.withValues(alpha: 0.16),
            SplashPalette.champagneGold.withValues(alpha: 0),
          ],
          stops: const [0.0, 0.55, 1.0],
        ),
      ),
    );
  }
}

/// Fine radiating light rays, faded at the edges — painted once, then rotated
/// as a cached layer.
class _ShineRays extends StatelessWidget {
  const _ShineRays({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) {
    const rays = 18;
    final colors = <Color>[];
    final stops = <double>[];
    for (var i = 0; i < rays; i++) {
      final start = i / rays;
      final mid = start + 0.5 / rays * 0.35;
      final end = start + 1 / rays * 0.35;
      final ray =
          (i.isEven ? SplashPalette.champagneGold : SplashPalette.roseGold)
              .withValues(alpha: 0.22);
      colors.addAll([
        ray.withValues(alpha: 0),
        ray,
        ray.withValues(alpha: 0),
        ray.withValues(alpha: 0),
      ]);
      stops.addAll([start, mid, end, (i + 1) / rays]);
    }
    return ShaderMask(
      blendMode: BlendMode.dstIn,
      shaderCallback: (rect) => const RadialGradient(
        colors: [Colors.transparent, Colors.white, Colors.transparent],
        stops: [0.12, 0.38, 1.0],
      ).createShader(rect),
      child: SizedBox.square(
        dimension: size,
        child: DecoratedBox(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: SweepGradient(colors: colors, stops: stops),
          ),
        ),
      ),
    );
  }
}

/// Four-point jewellery sparkle with a soft core.
class _StarPainter extends CustomPainter {
  const _StarPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final c = size.center(Offset.zero);
    final r = size.width / 2;
    canvas.drawCircle(
      c,
      r * 0.55,
      Paint()
        ..shader = RadialGradient(
          colors: [
            SplashPalette.softWhite.withValues(alpha: 0.9),
            SplashPalette.champagneGold.withValues(alpha: 0),
          ],
        ).createShader(Rect.fromCircle(center: c, radius: r * 0.55)),
    );
    final star = Path()
      ..moveTo(c.dx, c.dy - r)
      ..quadraticBezierTo(c.dx, c.dy, c.dx + r, c.dy)
      ..quadraticBezierTo(c.dx, c.dy, c.dx, c.dy + r)
      ..quadraticBezierTo(c.dx, c.dy, c.dx - r, c.dy)
      ..quadraticBezierTo(c.dx, c.dy, c.dx, c.dy - r)
      ..close();
    canvas.drawPath(star, Paint()..color = SplashPalette.softWhite);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _Particle {
  const _Particle(
    this.x,
    this.y,
    this.radius,
    this.speed,
    this.phase,
    this.twinkle,
    this.color,
    this.star,
  );
  final double x, y, radius, speed, phase, twinkle;
  final Color color;
  final bool star;
}

class _Bokeh {
  const _Bokeh(this.x, this.y, this.radius, this.phase, this.color, this.alpha);
  final double x, y, radius, phase, alpha;
  final Color color;
}

/// Floating bokeh light and slowly rising, twinkling gold particles.
class _AmbientPainter extends CustomPainter {
  _AmbientPainter({
    required this.ambient,
    required this.reveal,
    required this.span,
  }) : super(repaint: Listenable.merge([ambient, reveal]));

  final Animation<double> ambient;
  final Animation<double> reveal;
  final Duration span;

  // Fixed seed: the same composition on every launch.
  static final List<_Particle> _particles = () {
    final rnd = math.Random(7);
    const palette = [
      SplashPalette.champagneGold,
      SplashPalette.softWhite,
      SplashPalette.roseGold,
    ];
    return List.generate(36, (i) {
      return _Particle(
        rnd.nextDouble(),
        rnd.nextDouble(),
        0.6 + rnd.nextDouble() * 1.6,
        0.008 + rnd.nextDouble() * 0.022, // screen heights per second
        rnd.nextDouble() * math.pi * 2,
        1.2 + rnd.nextDouble() * 2.2,
        palette[i % palette.length],
        i % 7 == 0,
      );
    });
  }();

  static final List<_Bokeh> _bokeh = () {
    final rnd = math.Random(11);
    return List.generate(7, (i) {
      return _Bokeh(
        rnd.nextDouble(),
        rnd.nextDouble(),
        0.08 + rnd.nextDouble() * 0.14, // fraction of the shorter side
        rnd.nextDouble() * math.pi * 2,
        i.isEven ? SplashPalette.champagneGold : SplashPalette.roseGold,
        0.05 + rnd.nextDouble() * 0.07,
      );
    });
  }();

  @override
  void paint(Canvas canvas, Size size) {
    final shown = reveal.value;
    if (shown <= 0) return;
    final seconds = ambient.value * span.inMilliseconds / 1000;
    final shortest = size.shortestSide;

    for (final b in _bokeh) {
      final center = Offset(
        (b.x + math.sin(seconds * 0.25 + b.phase) * 0.03) * size.width,
        (b.y + math.cos(seconds * 0.2 + b.phase) * 0.025) * size.height,
      );
      final radius = b.radius * shortest;
      canvas.drawCircle(
        center,
        radius,
        Paint()
          ..shader = RadialGradient(
            colors: [
              b.color.withValues(alpha: b.alpha * shown),
              b.color.withValues(alpha: 0),
            ],
          ).createShader(Rect.fromCircle(center: center, radius: radius)),
      );
    }

    final halo = Paint();
    final core = Paint();
    for (final p in _particles) {
      final y = (p.y - seconds * p.speed) % 1.0;
      final x = p.x + math.sin(seconds * 0.6 + p.phase) * 0.008;
      final twinkle =
          0.45 + 0.55 * (0.5 + 0.5 * math.sin(seconds * p.twinkle + p.phase));
      final alpha = (twinkle * shown).clamp(0.0, 1.0);
      final o = Offset(x * size.width, y * size.height);
      halo.color = p.color.withValues(alpha: alpha * 0.18);
      canvas.drawCircle(o, p.radius * 3.2, halo);
      core.color = p.color.withValues(alpha: alpha * 0.9);
      if (p.star) {
        final r = p.radius * 2.6;
        canvas.drawPath(
          Path()
            ..moveTo(o.dx, o.dy - r)
            ..quadraticBezierTo(o.dx, o.dy, o.dx + r, o.dy)
            ..quadraticBezierTo(o.dx, o.dy, o.dx, o.dy + r)
            ..quadraticBezierTo(o.dx, o.dy, o.dx - r, o.dy)
            ..close(),
          core,
        );
      } else {
        canvas.drawCircle(o, p.radius, core);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _AmbientPainter oldDelegate) =>
      oldDelegate.ambient != ambient || oldDelegate.reveal != reveal;
}
