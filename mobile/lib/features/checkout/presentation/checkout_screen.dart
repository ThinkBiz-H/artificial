import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/cart_model.dart';
import '../../../core/models/checkout_quote.dart';
import '../../../core/models/user_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/repository_providers.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/line_options.dart';
import '../../../shared/widgets/app_network_image.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/buttons.dart';
import '../../../shared/widgets/dialogs.dart';
import '../../../shared/widgets/state_views.dart';
import '../../cart/viewmodels/cart_viewmodel.dart';
import '../../profile/presentation/address_form_screen.dart';
import '../../profile/presentation/addresses_screen.dart';
import '../../profile/viewmodels/address_viewmodel.dart';
import '../viewmodels/checkout_viewmodel.dart';
import 'checkout_otp_sheet.dart';

/// Website-parity two-step checkout:
///   1. Address  →  2. Payment (Place order → OTP sheet → order → Razorpay).
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key, this.couponCode});

  /// Coupon applied on the bag page, carried into checkout (website parity).
  final String? couponCode;

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _mobile = TextEditingController();
  final _email = TextEditingController();
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _line1 = TextEditingController();
  final _line2 = TextEditingController();
  final _city = TextEditingController();
  final _pincode = TextEditingController();
  final _coupon = TextEditingController();
  final _notes = TextEditingController();
  String? _state;
  int _step = 0;
  bool _continuing = false;
  bool _lookedUp = false;
  bool _prefilled = false;
  CheckoutContact? _contact;

  @override
  void initState() {
    super.initState();
    // Totals and the enabled payment methods come from POST /checkout/quote.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final vm = ref.read(checkoutProvider.notifier);
      final code = widget.couponCode;
      if (code != null && code.isNotEmpty) {
        _coupon.text = code;
        vm.applyCoupon(code);
      } else {
        vm.refreshQuote();
      }
    });
  }

  @override
  void dispose() {
    for (final c in [_mobile, _email, _first, _last, _line1, _line2, _city, _pincode, _coupon, _notes]) {
      c.dispose();
    }
    super.dispose();
  }

  void _prefillFromUser() {
    if (_prefilled) return;
    _prefilled = true;
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    _mobile.text = user.mobile ?? '';
    _email.text = user.email ?? '';
    _first.text = user.firstName;
    _last.text = user.lastName;
  }

  /// GET /checkout/lookup-customer — prefill for returning guests.
  Future<void> _lookup(String value) async {
    final mobile = Formatters.normalizeMobile(value);
    if (mobile.length != 10 || _lookedUp) return;
    _lookedUp = true;
    final c = await ref.read(authRepositoryProvider).lookupCustomer(mobile);
    if (c == null || !mounted) return;
    setState(() {
      if (_first.text.isEmpty) _first.text = c.firstName;
      if (_last.text.isEmpty) _last.text = c.lastName;
      if (_email.text.isEmpty) _email.text = c.email;
      if (_line1.text.isEmpty) _line1.text = c.address1;
      if (_line2.text.isEmpty) _line2.text = c.address2;
      if (_city.text.isEmpty) _city.text = c.city;
      if (_pincode.text.isEmpty) _pincode.text = c.pincode;
      _state ??= c.state.isEmpty ? null : c.state;
    });
    if (mounted) context.showSnack('Welcome back! We filled in your details.');
  }

  AddressModel? _selectedAddress(List<AddressModel> list, String? selectedId) {
    if (list.isEmpty) return null;
    for (final a in list) {
      if (a.id == selectedId) return a;
    }
    for (final a in list) {
      if (a.isDefault) return a;
    }
    return list.last;
  }

  CheckoutContact _formContact() => CheckoutContact(
        firstName: _first.text.trim(),
        lastName: _last.text.trim(),
        mobile: Formatters.normalizeMobile(_mobile.text),
        email: _email.text.trim(),
        addressLine1: _line1.text.trim(),
        addressLine2: _line2.text.trim(),
        city: _city.text.trim(),
        state: _state ?? '',
        pincode: _pincode.text.trim(),
      );

  // ---------------- Step 1 → Step 2 ----------------
  Future<void> _continueToPayment() async {
    context.hideKeyboard();
    final authenticated = ref.read(isAuthenticatedProvider);
    final addresses = ref.read(addressesProvider).valueOrNull ?? const <AddressModel>[];
    final selected = authenticated ? _selectedAddress(addresses, ref.read(checkoutProvider).addressId) : null;
    CheckoutContact contact;

    if (selected != null) {
      contact = CheckoutContact.fromAddress(selected, ref.read(currentUserProvider));
      if (Validators.mobile(contact.mobile) != null) {
        context.showSnack('Please add a valid mobile number to this address', error: true);
        return;
      }
    } else {
      if (!(_formKey.currentState?.validate() ?? false)) {
        context.showSnack('Please complete your delivery details', error: true);
        return;
      }
      contact = _formContact();
      if (authenticated) {
        setState(() => _continuing = true);
        try {
          final saved = await ref.read(addressesProvider.notifier).save(AddressModel(
                firstName: contact.firstName,
                lastName: contact.lastName,
                phone: contact.mobile,
                addressLine1: contact.addressLine1,
                addressLine2: contact.addressLine2,
                city: contact.city,
                state: contact.state,
                pincode: contact.pincode,
                isDefault: true,
              ));
          ref.read(checkoutProvider.notifier).selectAddress(saved.id);
        } catch (e) {
          if (mounted) {
            setState(() => _continuing = false);
            context.showError(e);
          }
          return;
        }
        if (!mounted) return;
        setState(() => _continuing = false);
      }
    }

    _contact = contact;
    ref.read(checkoutProvider.notifier).refreshQuote(pincode: contact.pincode);
    setState(() => _step = 1);
  }

  // ---------------- Place order: OTP → order (COD) / Razorpay → order (online) ----------------
  Future<void> _placeOrder() async {
    final contact = _contact;
    if (contact == null) {
      setState(() => _step = 0);
      return;
    }
    final vm = ref.read(checkoutProvider.notifier);
    final checkout = ref.read(checkoutProvider);
    if (checkout.quoteError != null) {
      context.showSnack(checkout.quoteError!, error: true);
      return;
    }
    if (checkout.method == null) {
      context.showSnack('Please choose a payment method', error: true);
      return;
    }
    final authenticated = ref.read(isAuthenticatedProvider);
    try {
      if (authenticated) {
        // Signed-in: the session already identifies the shopper — no OTP.
        // GET /auth/me confirms the session first (the interceptor refreshes
        // an expired access token; a rejected refresh signs the user out).
        await ref.read(authRepositoryProvider).me();
        if (!mounted) return;
      } else {
        // Guest: verify the mobile by OTP; verification creates or signs in
        // the account, then the order is placed with that session.
        if (Validators.mobile(contact.mobile) != null) {
          context.showSnack('Please enter a valid mobile number', error: true);
          return;
        }
        final otp = await vm.requestOtp(mobile: contact.mobile, email: contact.email);
        if (!mounted) return;
        final verification = await showCheckoutOtpSheet(
          context,
          mobile: contact.mobile,
          expiresInMinutes: otp.expiresInMinutes,
          guest: contact,
        );
        if (verification == null || !mounted) return;
        if (verification == OtpVerification.bagChanged) {
          context.showSnack('We added items saved in your account to this bag. Please review your order and place it again.');
          return;
        }
      }
      final result = await vm.placeOrder(contact, notes: _notes.text);
      if (!mounted) return;
      switch (result) {
        case CheckoutSucceeded(:final order):
          context.go(RoutePaths.orderSuccess(order.id));
        case CheckoutNotPlaced(:final message):
          context.showSnack(message, error: true);
        case CheckoutPaymentIncomplete(:final order, :final message):
          context.showSnack(message, error: true);
          context.go(RoutePaths.order(order.id));
      }
    } catch (e) {
      if (mounted) context.showError(e);
    }
  }

  Future<void> _applyCoupon(String code) => ref.read(checkoutProvider.notifier).applyCoupon(code);

  Future<void> _openOffers() async {
    final code = await context.push<String>('${RoutePaths.coupons}?pick=1');
    if (code != null && mounted) {
      _coupon.text = code;
      await _applyCoupon(code);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartProvider);
    final checkout = ref.watch(checkoutProvider);
    final authenticated = ref.watch(isAuthenticatedProvider);
    if (authenticated) _prefillFromUser();
    // Re-price whenever the bag changes (quantity, merge after sign-in).
    ref.listen<String>(
      cartProvider.select((c) => (c.valueOrNull?.items ?? const <CartItemModel>[])
          .map((i) => '${i.key}:${i.quantity}')
          .join('|')),
      (prev, next) {
        if (prev != next) ref.read(checkoutProvider.notifier).refreshQuote();
      },
    );

    return PopScope(
      canPop: !checkout.placing && _step == 0,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && !checkout.placing && _step == 1) setState(() => _step = 0);
      },
      child: Stack(
        children: [
          Scaffold(
            appBar: AppBar(
              title: const Text('Checkout'),
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(56),
                child: _StepHeader(step: _step, onTapAddress: checkout.placing ? null : () => setState(() => _step = 0)),
              ),
            ),
            body: cartAsync.when(
              loading: () => const LoadingView(),
              error: (e, _) => ErrorState(error: e, onRetry: () => ref.invalidate(cartProvider)),
              data: (cart) {
                if (cart.isEmpty) {
                  return EmptyState(
                    icon: Icons.shopping_bag_outlined,
                    title: 'Your bag is empty',
                    actionLabel: 'Continue shopping',
                    onAction: () => context.go(RoutePaths.home),
                  );
                }
                return AnimatedSwitcher(
                  duration: const Duration(milliseconds: 280),
                  child: _step == 0
                      ? KeyedSubtree(key: const ValueKey('address'), child: _addressStep(cart, authenticated, checkout))
                      : KeyedSubtree(key: const ValueKey('payment'), child: _paymentStep(cart, authenticated, checkout)),
                );
              },
            ),
            bottomNavigationBar: () {
              final cart = cartAsync.valueOrNull;
              if (cart == null || cart.isEmpty) return null;
              final total = checkout.quote?.grandTotal ?? cart.subTotal;
              CheckoutPaymentMethod? method;
              for (final m in checkout.paymentMethods) {
                if (m.id == checkout.method) method = m;
              }
              return _BottomBar(
                total: total,
                caption: _step == 0 ? 'Shipping & discounts on next step' : (method?.label ?? 'Choose a payment method'),
                label: _step == 0 ? 'Continue' : 'Place order',
                loading: _continuing || checkout.placing,
                onPressed: _step == 0 ? _continueToPayment : _placeOrder,
              );
            }(),
          ),
          if (checkout.placing) _ProgressOverlay(message: checkout.progress ?? 'Please wait…'),
        ],
      ),
    );
  }

  // ---------------- STEP 1: Address ----------------
  Widget _addressStep(CartModel cart, bool authenticated, CheckoutState checkout) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 120),
        children: [
          if (authenticated) _savedAddresses(checkout) else _guestForm(),
          const SizedBox(height: AppSpacing.lg),
          _MiniCartSummary(cart: cart),
        ],
      ),
    );
  }

  Widget _savedAddresses(CheckoutState checkout) {
    final async = ref.watch(addressesProvider);
    return async.when(
      loading: () => const Padding(padding: EdgeInsets.all(AppSpacing.md), child: LinearProgressIndicator()),
      error: (e, _) => ErrorState(error: e, compact: true, onRetry: () => ref.invalidate(addressesProvider)),
      data: (list) {
        if (list.isEmpty) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Add a delivery address', style: context.text.headlineSmall),
              const SizedBox(height: AppSpacing.md),
              AutofillGroup(
                child: AddressFields(
                  firstName: _first,
                  lastName: _last,
                  phone: _mobile,
                  line1: _line1,
                  line2: _line2,
                  city: _city,
                  pincode: _pincode,
                  state: _state,
                  onStateChanged: (v) => setState(() => _state = v),
                ),
              ),
            ],
          );
        }
        final selected = _selectedAddress(list, checkout.addressId);
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Deliver to', style: context.text.headlineSmall),
            const SizedBox(height: AppSpacing.sm),
            ...list.map((a) => AddressCard(
                  address: a,
                  selected: a.id == selected?.id,
                  onTap: () => ref.read(checkoutProvider.notifier).selectAddress(a.id),
                  onEdit: () async {
                    final saved = await context.push<AddressModel>(RoutePaths.addressForm, extra: a);
                    if (saved != null) ref.read(checkoutProvider.notifier).selectAddress(saved.id);
                  },
                  onDelete: () async {
                    final ok = await showConfirmDialog(context,
                        title: 'Delete address?', message: a.singleLine, confirmLabel: 'Delete', destructive: true);
                    if (!ok) return;
                    try {
                      await ref.read(addressesProvider.notifier).delete(a.id);
                    } catch (e) {
                      if (mounted) context.showError(e);
                    }
                  },
                )),
            OutlinedButton.icon(
              icon: const Icon(Icons.add_location_alt_outlined),
              label: const Text('ADD NEW ADDRESS'),
              onPressed: () async {
                final saved = await context.push<AddressModel>(RoutePaths.addressForm);
                if (saved != null) ref.read(checkoutProvider.notifier).selectAddress(saved.id);
              },
            ),
          ],
        );
      },
    );
  }

  Widget _guestForm() {
    return AutofillGroup(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Contact', style: context.text.headlineSmall),
          const SizedBox(height: AppSpacing.sm),
          MobileField(
            controller: _mobile,
            validator: Validators.mobile,
            onChanged: (v) {
              if (Formatters.normalizeMobile(v).length == 10) _lookup(v);
            },
          ),
          const SizedBox(height: AppSpacing.md),
          AppTextField(
            controller: _email,
            label: 'Email (for order updates)',
            keyboardType: TextInputType.emailAddress,
            validator: Validators.optionalEmail,
            autofillHints: const [AutofillHints.email],
          ),
          const SizedBox(height: AppSpacing.lg),
          Text('Delivery address', style: context.text.headlineSmall),
          const SizedBox(height: AppSpacing.sm),
          AddressFields(
            firstName: _first,
            lastName: _last,
            line1: _line1,
            line2: _line2,
            city: _city,
            pincode: _pincode,
            state: _state,
            onStateChanged: (v) => setState(() => _state = v),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              const Icon(Icons.lock_outline_rounded, size: 16, color: AppColors.success),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Already shopped with us? Enter your mobile and we will fill your details. '
                  'Your mobile is verified by OTP when you place the order.',
                  style: context.text.bodySmall,
                ),
              ),
            ],
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: () => context.push(RoutePaths.loginWithRedirect(RoutePaths.checkout)),
              child: const Text('OR LOGIN TO USE SAVED ADDRESSES'),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- STEP 2: Payment ----------------
  Widget _paymentStep(CartModel cart, bool authenticated, CheckoutState checkout) {
    final contact = _contact;
    return ListView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.md, AppSpacing.md, 120),
      children: [
        if (contact != null)
          Card(
            child: ListTile(
              leading: const Icon(Icons.location_on_outlined),
              title: Text(contact.fullName.isEmpty ? 'Delivery address' : contact.fullName),
              subtitle: Text(
                '${[contact.addressLine1, contact.addressLine2, contact.city, '${contact.state} - ${contact.pincode}'].where((e) => e.trim().isNotEmpty).join(', ')}\n+91 ${Formatters.mobile(contact.mobile)}',
              ),
              isThreeLine: true,
              trailing: TextButton(onPressed: () => setState(() => _step = 0), child: const Text('CHANGE')),
            ),
          ),
        const SizedBox(height: AppSpacing.lg),
        Text('Payment method', style: context.text.headlineSmall),
        const SizedBox(height: AppSpacing.sm),
        // Only the methods the backend reports as enabled (Admin > Settings > Payment).
        if (checkout.quote == null && checkout.quoteError == null)
          Text('Payment options are loading…', style: context.text.bodySmall)
        else if (checkout.quote == null)
          ErrorState(
            error: checkout.quoteError!,
            compact: true,
            onRetry: () => ref.read(checkoutProvider.notifier).refreshQuote(),
          )
        else if (checkout.paymentMethods.isEmpty)
          Text('No payment method is available right now. Please try again shortly.',
              style: context.text.bodySmall?.copyWith(color: context.colors.error))
        else
          ...checkout.paymentMethods.map((m) => _PaymentOption(
                selected: checkout.method == m.id,
                icon: m.isCod ? Icons.payments_outlined : Icons.credit_card_rounded,
                title: m.label,
                subtitle: m.description,
                badge: m.offer,
                onTap: () => ref.read(checkoutProvider.notifier).selectMethod(m.id),
              )),
        const SizedBox(height: AppSpacing.lg),
        _couponSection(checkout, authenticated),
        const SizedBox(height: AppSpacing.md),
        AppTextField(
          controller: _notes,
          label: 'Delivery instructions (optional)',
          hint: 'e.g. Leave at the security desk',
          maxLength: 500,
          maxLines: 2,
          textInputAction: TextInputAction.done,
        ),
        const SizedBox(height: AppSpacing.md),
        _ItemsPreview(cart: cart),
        const SizedBox(height: AppSpacing.md),
        _PriceBreakdown(cart: cart, checkout: checkout),
      ],
    ).animate().fadeIn(duration: 220.ms).slideX(begin: 0.04, end: 0);
  }

  Widget _couponSection(CheckoutState checkout, bool authenticated) {
    final applied = checkout.couponCode;
    // Shown as applied once the backend has accepted the code.
    if (applied != null && checkout.quote?.couponCode == applied) {
      final saving = checkout.quote!.couponDiscount;
      return Container(
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.success.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: AppColors.success),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                saving > 0
                    ? '$applied applied · you save ${Formatters.currency(saving)}'
                    : '$applied applied',
                style: context.text.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
            TextButton(
              onPressed: () {
                _coupon.clear();
                ref.read(checkoutProvider.notifier).removeCoupon();
              },
              child: const Text('REMOVE'),
            ),
          ],
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: Text('Coupons & offers', style: context.text.headlineSmall)),
            TextButton(onPressed: _openOffers, child: const Text('VIEW OFFERS')),
          ],
        ),
        Row(
          children: [
            Expanded(
              child: AppTextField(
                controller: _coupon,
                label: 'Coupon code',
                textCapitalization: TextCapitalization.characters,
                textInputAction: TextInputAction.done,
                onSubmitted: _applyCoupon,
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              width: 100,
              child: OutlinedButton(
                onPressed: checkout.quoteLoading ? null : () => _applyCoupon(_coupon.text),
                child: checkout.quoteLoading && checkout.couponCode != null
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('APPLY'),
              ),
            ),
          ],
        ),
        if (checkout.couponError != null)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(checkout.couponError!, style: context.text.bodySmall?.copyWith(color: context.colors.error)),
          ),
      ],
    );
  }
}

class _StepHeader extends StatelessWidget {
  const _StepHeader({required this.step, required this.onTapAddress});
  final int step;
  final VoidCallback? onTapAddress;

  @override
  Widget build(BuildContext context) {
    Widget dot(int i, String label) {
      final active = step >= i;
      return InkWell(
        onTap: i == 0 && step == 1 ? onTapAddress : null,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 240),
              width: 24,
              height: 24,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: active ? context.colors.primary : Colors.transparent,
                border: Border.all(color: active ? context.colors.primary : context.colors.outline, width: 1.4),
              ),
              child: step > i
                  ? Icon(Icons.check_rounded, size: 14, color: context.colors.onPrimary)
                  : Text('${i + 1}',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: active ? context.colors.onPrimary : context.colors.onSurfaceVariant)),
            ),
            const SizedBox(width: 8),
            Text(label.toUpperCase(),
                style: context.text.labelMedium?.copyWith(
                    color: active ? context.colors.primary : context.colors.onSurfaceVariant,
                    fontWeight: FontWeight.w700)),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.sm),
      child: Row(
        children: [
          dot(0, 'Address'),
          Expanded(
            child: Container(
              height: 1.4,
              margin: const EdgeInsets.symmetric(horizontal: 12),
              color: step >= 1 ? context.colors.primary : context.colors.outline,
            ),
          ),
          dot(1, 'Payment'),
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
    required this.selected,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.badge,
  });

  final bool selected;
  final IconData icon;
  final String title;
  final String subtitle;
  final String? badge;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md),
        onTap: onTap,
        child: AnimatedContainer(
          duration: AppDurations.fast,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: context.colors.surface,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: selected ? context.colors.primary : context.colors.outline,
              width: selected ? 1.6 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(selected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                  color: context.colors.primary),
              const SizedBox(width: 12),
              Icon(icon, color: AppColors.roseGold),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: context.text.titleMedium),
                    Text(subtitle, style: context.text.bodySmall),
                  ],
                ),
              ),
              if (badge != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.success, borderRadius: BorderRadius.circular(4)),
                  child: Text(badge!,
                      style: context.text.labelSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniCartSummary extends StatelessWidget {
  const _MiniCartSummary({required this.cart});
  final CartModel cart;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ExpansionTile(
        shape: const Border(),
        title: Text('${cart.count} item${cart.count == 1 ? '' : 's'} · ${Formatters.currency(cart.subTotal)}',
            style: context.text.titleMedium),
        children: [_ItemsPreview(cart: cart, flat: true)],
      ),
    );
  }
}

class _ItemsPreview extends StatelessWidget {
  const _ItemsPreview({required this.cart, this.flat = false});
  final CartModel cart;
  final bool flat;

  @override
  Widget build(BuildContext context) {
    final tiles = cart.items
        .map((i) => ListTile(
              leading: SizedBox(
                width: 48,
                height: 56,
                child: AppNetworkImage(url: i.image, targetWidth: 120, borderRadius: BorderRadius.circular(6)),
              ),
              title: Text(i.product.title, maxLines: 1, overflow: TextOverflow.ellipsis),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!i.options.isEmpty) LineOptions(options: i.options, stacked: true),
                  Text('Qty ${i.quantity} × ${Formatters.currency(i.unitPrice)}', style: context.text.bodySmall),
                ],
              ),
              trailing: Text(Formatters.currency(i.lineTotal), style: context.text.titleSmall),
            ))
        .toList();
    if (flat) return Column(children: tiles);
    return Card(child: Column(children: tiles));
  }
}

class _PriceBreakdown extends StatelessWidget {
  const _PriceBreakdown({required this.cart, required this.checkout});
  final CartModel cart;
  final CheckoutState checkout;

  @override
  Widget build(BuildContext context) {
    final q = checkout.quote;
    Widget row(String label, String value, {Color? color, bool bold = false}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Expanded(child: Text(label, style: bold ? context.text.titleMedium : context.text.bodyMedium)),
              Text(value, style: (bold ? context.text.titleLarge : context.text.bodyMedium)?.copyWith(color: color)),
            ],
          ),
        );
    String shippingLabel() {
      if (q == null || (checkout.quoteLoading && !q.shippingQuoted)) return 'Calculating…';
      if (!q.shippingQuoted) return 'Enter pincode';
      return q.isFreeShipping ? 'FREE' : Formatters.currency(q.shippingCharge);
    }

    String percent(double v) => v % 1 == 0 ? v.toInt().toString() : v.toString();

    // Every figure comes from POST /checkout/quote — priced exactly as the order.
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          children: [
            row('Subtotal (${cart.count} item${cart.count == 1 ? '' : 's'})', Formatters.currency(q?.subTotal ?? cart.subTotal)),
            if (q != null && q.couponDiscount > 0)
              row('Coupon ${q.couponCode ?? ''}'.trim(), '− ${Formatters.currency(q.couponDiscount)}', color: AppColors.success),
            if (q != null && q.prepaidDiscount > 0)
              row('Prepaid discount (${percent(q.prepaidDiscountPercent)}%)', '− ${Formatters.currency(q.prepaidDiscount)}',
                  color: AppColors.success),
            row('Shipping', shippingLabel(), color: q != null && q.isFreeShipping ? AppColors.success : null),
            if (q != null && q.tax > 0) row(q.taxIncluded ? 'GST (included)' : 'GST', Formatters.currency(q.tax)),
            if (checkout.quoteError != null)
              Align(
                alignment: Alignment.centerLeft,
                child: Text(checkout.quoteError!, style: context.text.bodySmall?.copyWith(color: context.colors.error)),
              ),
            const Divider(height: AppSpacing.lg),
            row('Total', Formatters.currency(q?.grandTotal ?? cart.subTotal), bold: true),
          ],
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.total,
    required this.caption,
    required this.label,
    required this.loading,
    required this.onPressed,
  });

  final double total;
  final String caption;
  final String label;
  final bool loading;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        boxShadow: const [BoxShadow(color: Color(0x1A000000), blurRadius: 16, offset: Offset(0, -4))],
      ),
      padding: const EdgeInsets.fromLTRB(AppSpacing.md, AppSpacing.sm, AppSpacing.md, AppSpacing.sm),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(Formatters.currency(total), style: context.text.headlineSmall),
                  Text(caption, style: context.text.bodySmall),
                ],
              ),
            ),
            SizedBox(width: 190, child: PrimaryButton(label: label, loading: loading, onPressed: onPressed)),
          ],
        ),
      ),
    );
  }
}

class _ProgressOverlay extends StatelessWidget {
  const _ProgressOverlay({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: ColoredBox(
        color: Colors.black.withValues(alpha: 0.45),
        child: Center(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const LoadingView(),
                  const SizedBox(height: AppSpacing.sm),
                  Text(message, style: context.text.titleMedium),
                  const SizedBox(height: 4),
                  Text('Please do not close the app', style: context.text.bodySmall),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
