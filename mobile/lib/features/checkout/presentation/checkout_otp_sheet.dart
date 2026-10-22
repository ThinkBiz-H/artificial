import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/buttons.dart';
import '../../../shared/widgets/otp_input.dart';
import '../../auth/viewmodels/auth_flow_viewmodel.dart';
import '../viewmodels/checkout_viewmodel.dart';

/// Verifies the order OTP sent to [mobile]. [guest] carries a guest's details
/// (their account is created or signed in with them). Returns null when the
/// shopper cancels.
Future<OtpVerification?> showCheckoutOtpSheet(
  BuildContext context, {
  required String mobile,
  required int expiresInMinutes,
  CheckoutContact? guest,
}) {
  return showModalBottomSheet<OtpVerification>(
    context: context,
    isScrollControlled: true,
    isDismissible: false,
    useSafeArea: true,
    builder: (_) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: _CheckoutOtpSheet(mobile: mobile, guest: guest, expiresInMinutes: expiresInMinutes),
    ),
  );
}

class _CheckoutOtpSheet extends ConsumerStatefulWidget {
  const _CheckoutOtpSheet({required this.mobile, required this.guest, required this.expiresInMinutes});
  final String mobile;
  final CheckoutContact? guest;
  final int expiresInMinutes;

  @override
  ConsumerState<_CheckoutOtpSheet> createState() => _CheckoutOtpSheetState();
}

class _CheckoutOtpSheetState extends ConsumerState<_CheckoutOtpSheet> {
  final _otp = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
        (_) => ref.read(otpVerifyProvider.notifier).startCooldown(AppConfig.otpResendSeconds));
  }

  @override
  void dispose() {
    _otp.dispose();
    super.dispose();
  }

  Future<void> _verify(String code) async {
    if (code.length != AppConfig.otpLength) return;
    final otpVm = ref.read(otpVerifyProvider.notifier);
    otpVm.setVerifying(true);
    try {
      final result = await ref
          .read(checkoutProvider.notifier)
          .verifyOtp(mobile: widget.mobile, otp: code, guest: widget.guest);
      otpVm.setVerifying(false);
      if (mounted) Navigator.of(context).pop(result);
    } catch (e) {
      otpVm.setError(AppException.from(e).message);
      _otp.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(otpVerifyProvider);
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Verify to place order', style: context.text.headlineMedium, textAlign: TextAlign.center),
          const SizedBox(height: 6),
          Text(
            'Enter the OTP sent to +91 ${Formatters.mobile(widget.mobile)} '
            '(valid ${widget.expiresInMinutes} min).${widget.guest != null ? ' Your account is created or signed in automatically.' : ''}',
            style: context.text.bodySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.lg),
          OtpInput(
            controller: _otp,
            length: AppConfig.otpLength,
            hasError: state.error != null,
            enabled: !state.verifying,
            onCompleted: _verify,
          ),
          if (state.error != null) ...[
            const SizedBox(height: 8),
            Text(state.error!,
                textAlign: TextAlign.center,
                style: context.text.bodySmall?.copyWith(color: context.colors.error)),
          ],
          const SizedBox(height: AppSpacing.lg),
          PrimaryButton(label: 'Verify & continue', loading: state.verifying, onPressed: () => _verify(_otp.text)),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: state.verifying ? null : () => Navigator.of(context).pop(),
                child: const Text('CANCEL'),
              ),
              state.secondsLeft > 0
                  ? Text('Resend in ${state.secondsLeft}s', style: context.text.bodySmall)
                  : TextButton(
                      onPressed: state.resending
                          ? null
                          : () => ref
                              .read(otpVerifyProvider.notifier)
                              .resendCheckout(widget.mobile, AppConfig.otpResendSeconds),
                      child: Text(state.resending ? 'SENDING…' : 'RESEND OTP'),
                    ),
            ],
          ),
        ],
      ),
    );
  }
}
