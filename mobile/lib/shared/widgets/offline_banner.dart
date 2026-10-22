import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/core_providers.dart';
import '../../core/theme/app_colors.dart';

/// Slides in under the status bar whenever connectivity is lost.
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(isOnlineProvider);
    final top = MediaQuery.paddingOf(context).top;
    return Stack(
      children: [
        child,
        AnimatedPositioned(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
          top: online ? -(top + 40) : 0,
          left: 0,
          right: 0,
          child: Material(
            color: AppColors.wineDark,
            child: Padding(
              padding: EdgeInsets.only(top: top + 6, bottom: 6),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.wifi_off_rounded, size: 16, color: AppColors.champagne),
                  SizedBox(width: 8),
                  Text('You are offline — showing saved content',
                      style: TextStyle(color: AppColors.champagne, fontSize: 12.5)),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
