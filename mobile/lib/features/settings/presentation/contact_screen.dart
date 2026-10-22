import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/app_providers.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/buttons.dart';

/// POST /contact (validators/contact.validator.js).
class ContactScreen extends ConsumerStatefulWidget {
  const ContactScreen({super.key, this.orderNumber});

  /// Prefills an order enquiry (website: /contact?order=…).
  final String? orderNumber;

  @override
  ConsumerState<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends ConsumerState<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _user = ref.read(currentUserProvider);
  late final _name = TextEditingController(text: _user?.name ?? '');
  late final _email = TextEditingController(text: _user?.email ?? '');
  late final _phone = TextEditingController(text: _user?.mobile ?? '');
  late final _subject = TextEditingController(
      text: widget.orderNumber == null ? '' : 'Return request — Order #${widget.orderNumber}');
  late final _message = TextEditingController(
      text: widget.orderNumber == null ? '' : "I'd like to return item(s) from order #${widget.orderNumber}. Reason: ");
  late String _type = widget.orderNumber == null ? 'General' : 'Order';
  bool _sending = false;

  static const _types = ['General', 'Order', 'Product', 'Bulk / Wholesale', 'Feedback'];

  @override
  void dispose() {
    for (final c in [_name, _email, _phone, _subject, _message]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    context.hideKeyboard();
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _sending = true);
    try {
      await ref.read(contentRepositoryProvider).submitContact(
            name: _name.text,
            email: _email.text,
            phone: Formatters.normalizeMobile(_phone.text),
            subject: _subject.text,
            message: _message.text,
            inquiryType: _type,
          );
      if (!mounted) return;
      context.showSnack('Thank you! We will get back to you soon.');
      context.pop();
    } catch (e) {
      if (mounted) {
        setState(() => _sending = false);
        context.showError(e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsValueProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Contact us')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            if (settings.contactAddress.isNotEmpty) ...[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.storefront_outlined, color: context.colors.primary),
                  const SizedBox(width: 8),
                  Expanded(child: Text(settings.contactAddress, style: context.text.bodyMedium)),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
            ],
            AppTextField(controller: _name, label: 'Your name', validator: Validators.name,
                textCapitalization: TextCapitalization.words),
            const SizedBox(height: AppSpacing.md),
            AppTextField(controller: _email, label: 'Email', validator: Validators.email,
                keyboardType: TextInputType.emailAddress),
            const SizedBox(height: AppSpacing.md),
            MobileField(controller: _phone, validator: Validators.mobile, label: 'Phone'),
            const SizedBox(height: AppSpacing.md),
            DropdownButtonFormField<String>(
              value: _type,
              decoration: const InputDecoration(labelText: 'Topic'),
              items: _types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
              onChanged: (v) => setState(() => _type = v ?? 'General'),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _subject,
              label: 'Subject',
              validator: (v) => Validators.minLength(v, 3, 'Subject'),
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _message,
              label: 'Message',
              maxLines: 5,
              maxLength: 2000,
              textInputAction: TextInputAction.newline,
              keyboardType: TextInputType.multiline,
              validator: (v) => Validators.minLength(v, 10, 'Message'),
            ),
            const SizedBox(height: AppSpacing.xl),
            PrimaryButton(label: 'Send message', loading: _sending, onPressed: _submit),
          ],
        ),
      ),
    );
  }
}
