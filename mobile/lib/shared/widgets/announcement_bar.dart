import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Continuously scrolling marquee for /announcements.
class AnnouncementBar extends StatefulWidget {
  const AnnouncementBar({super.key, required this.messages});
  final List<String> messages;

  @override
  State<AnnouncementBar> createState() => _AnnouncementBarState();
}

class _AnnouncementBarState extends State<AnnouncementBar> {
  final ScrollController _controller = ScrollController();
  bool _running = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loop());
  }

  Future<void> _loop() async {
    if (_running) return;
    _running = true;
    while (mounted && _running) {
      if (!_controller.hasClients || _controller.position.maxScrollExtent <= 0) {
        await Future<void>.delayed(const Duration(milliseconds: 500));
        continue;
      }
      final max = _controller.position.maxScrollExtent;
      final remaining = max - _controller.offset;
      final ms = (remaining * 28).round().clamp(400, 120000);
      try {
        await _controller.animateTo(max,
            duration: Duration(milliseconds: ms), curve: Curves.linear);
      } catch (_) {
        break;
      }
      if (!mounted || !_controller.hasClients) break;
      _controller.jumpTo(0);
    }
  }

  @override
  void dispose() {
    _running = false;
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.messages.isEmpty) return const SizedBox.shrink();
    final style = AppTypography.overline(AppColors.champagne).copyWith(letterSpacing: 1.6);
    final items = [...widget.messages, ...widget.messages, ...widget.messages];
    return Container(
      height: 32,
      decoration: const BoxDecoration(gradient: AppColors.wineGradient),
      child: ListView.builder(
        controller: _controller,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        itemBuilder: (_, i) => Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: Row(
              children: [
                const Icon(Icons.diamond_outlined, size: 10, color: AppColors.roseGoldLight),
                const SizedBox(width: 18),
                Text(items[i].toUpperCase(), style: style),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
