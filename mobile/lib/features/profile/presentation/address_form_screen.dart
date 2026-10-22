import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/user_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/indian_states.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/buttons.dart';
import '../viewmodels/address_viewmodel.dart';

/// Reusable address fields — used by the address form and guest checkout.
class AddressFields extends StatelessWidget {
  const AddressFields({
    super.key,
    required this.firstName,
    required this.lastName,
    required this.line1,
    required this.line2,
    required this.city,
    required this.pincode,
    required this.state,
    required this.onStateChanged,
    this.phone,
  });

  final TextEditingController firstName;
  final TextEditingController lastName;
  final TextEditingController line1;
  final TextEditingController line2;
  final TextEditingController city;
  final TextEditingController pincode;
  final TextEditingController? phone;
  final String? state;
  final ValueChanged<String?> onStateChanged;

  @override
  Widget build(BuildContext context) {
    const gap = SizedBox(height: AppSpacing.md);
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: AppTextField(
                controller: firstName,
                label: 'First name',
                validator: (v) => Validators.required(v, 'First name'),
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.givenName],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: AppTextField(
                controller: lastName,
                label: 'Last name',
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.familyName],
              ),
            ),
          ],
        ),
        if (phone != null) ...[gap, MobileField(controller: phone!, validator: Validators.mobile)],
        gap,
        AppTextField(
          controller: line1,
          label: 'House no., building, street',
          validator: (v) => Validators.required(v, 'Address'),
          textCapitalization: TextCapitalization.words,
          autofillHints: const [AutofillHints.streetAddressLine1],
        ),
        gap,
        AppTextField(
          controller: line2,
          label: 'Area, landmark (optional)',
          textCapitalization: TextCapitalization.words,
          autofillHints: const [AutofillHints.streetAddressLine2],
        ),
        gap,
        Row(
          children: [
            Expanded(
              child: AppTextField(
                controller: pincode,
                label: 'Pincode',
                validator: Validators.pincode,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                autofillHints: const [AutofillHints.postalCode],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: AppTextField(
                controller: city,
                label: 'City',
                validator: (v) => Validators.required(v, 'City'),
                textCapitalization: TextCapitalization.words,
                autofillHints: const [AutofillHints.addressCity],
              ),
            ),
          ],
        ),
        gap,
        DropdownButtonFormField<String>(
          value: kIndianStates.contains(state) ? state : null,
          isExpanded: true,
          decoration: const InputDecoration(labelText: 'State'),
          items: kIndianStates.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
          validator: (v) => v == null || v.isEmpty ? 'State is required' : null,
          onChanged: onStateChanged,
        ),
      ],
    );
  }
}

class AddressFormScreen extends ConsumerStatefulWidget {
  const AddressFormScreen({super.key, this.existing});
  final AddressModel? existing;

  @override
  ConsumerState<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends ConsumerState<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final AddressModel? _e = widget.existing;
  late final _first = TextEditingController(text: _e?.firstName ?? ref.read(currentUserProvider)?.firstName ?? '');
  late final _last = TextEditingController(text: _e?.lastName ?? ref.read(currentUserProvider)?.lastName ?? '');
  late final _phone = TextEditingController(text: _e?.phone ?? ref.read(currentUserProvider)?.mobile ?? '');
  late final _line1 = TextEditingController(text: _e?.addressLine1 ?? '');
  late final _line2 = TextEditingController(text: _e?.addressLine2 ?? '');
  late final _city = TextEditingController(text: _e?.city ?? '');
  late final _pincode = TextEditingController(text: _e?.pincode ?? '');
  late String? _state = _e?.state;
  late String _type = _e?.type ?? 'Home';
  late bool _isDefault = _e?.isDefault ?? false;
  bool _saving = false;

  @override
  void dispose() {
    for (final c in [_first, _last, _phone, _line1, _line2, _city, _pincode]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    context.hideKeyboard();
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _saving = true);
    final address = (_e ?? const AddressModel()).copyWith(
      type: _type,
      firstName: _first.text.trim(),
      lastName: _last.text.trim(),
      phone: Formatters.normalizeMobile(_phone.text),
      addressLine1: _line1.text.trim(),
      addressLine2: _line2.text.trim(),
      city: _city.text.trim(),
      state: _state ?? '',
      pincode: _pincode.text.trim(),
      country: 'India',
      isDefault: _isDefault,
    );
    try {
      final saved = await ref.read(addressesProvider.notifier).save(address);
      if (!mounted) return;
      context.showSnack('Address saved');
      context.pop(saved);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        context.showError(e);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_e == null ? 'Add address' : 'Edit address')),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: AutofillGroup(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.md),
              children: [
                AddressFields(
                  firstName: _first,
                  lastName: _last,
                  phone: _phone,
                  line1: _line1,
                  line2: _line2,
                  city: _city,
                  pincode: _pincode,
                  state: _state,
                  onStateChanged: (v) => setState(() => _state = v),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text('SAVE AS', style: context.text.labelMedium),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: ['Home', 'Office', 'Other']
                      .map((t) => ChoiceChip(
                            label: Text(t,
                                style: TextStyle(color: t == _type ? context.colors.onPrimary : null)),
                            selected: t == _type,
                            onSelected: (_) => setState(() => _type = t),
                          ))
                      .toList(),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Make this my default address'),
                  value: _isDefault,
                  onChanged: (v) => setState(() => _isDefault = v),
                ),
                const SizedBox(height: AppSpacing.lg),
                PrimaryButton(label: 'Save address', loading: _saving, onPressed: _save),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
