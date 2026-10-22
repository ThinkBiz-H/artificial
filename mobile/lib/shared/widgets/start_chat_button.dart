import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/app_providers.dart';
import '../../core/providers/core_providers.dart';

/// The first WhatsApp message (website lib/whatsapp.ts#buildStartChatUrl).
String startChatMessage({required String orderNumber, required String customerName}) => '''Hello Swastikala Team,

My Order Number is $orderNumber.

I need support regarding my order.

Customer Name:
$customerName

Thank you.''';

/// "Start Chat" — opens WhatsApp with the order number and customer name
/// filled in. Renders nothing unless Admin > Settings > WhatsApp has a
/// business number and the start-chat button enabled.
class StartChatButton extends ConsumerWidget {
  const StartChatButton({super.key, required this.orderNumber, required this.customerName});
  final String orderNumber;
  final String customerName;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsValueProvider);
    if (!settings.whatsappChatEnabled || settings.whatsappNumber.isEmpty) return const SizedBox.shrink();
    return OutlinedButton.icon(
      icon: const Icon(Icons.chat_outlined, size: 18),
      label: const Text('START CHAT'),
      onPressed: () => ref.read(launcherServiceProvider).whatsapp(
            settings.whatsappNumber,
            message: startChatMessage(orderNumber: orderNumber, customerName: customerName),
          ),
    );
  }
}
