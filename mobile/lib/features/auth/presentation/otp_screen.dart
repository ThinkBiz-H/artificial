import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../shared/widgets/buttons.dart';
import '../../../shared/widgets/otp_input.dart';
import '../viewmodels/auth_flow_viewmodel.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key, required this.args});
  final OtpArgs args;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _otp = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(otpVerifyProvider.notifier).startCooldown(AppConfig.otpResendSeconds);
    });
  }

  @override
  void dispose() {
    _otp.dispose();
    super.dispose();
  }

  Future<void> _verify(String code) async {
    if (code.length != AppConfig.otpLength) return;
    context.hideKeyboard();
    final ok = await ref.read(otpVerifyProvider.notifier).verifyLogin(widget.args, code);
    if (!mounted) return;
    if (ok) {
      context.showSnack('Welcome to Swastikala');
      final target = widget.args.redirectTo;
      if (target != null && target.isNotEmpty && target != RoutePaths.login) {
        context.go(target);
      } else {
        context.go(RoutePaths.home);
      }
    } else {
      _otp.clear();
    }
  }

  Future<void> _resend() async {
    final ok = await ref
        .read(otpVerifyProvider.notifier)
        .resendLogin(widget.args.mobile, AppConfig.otpResendSeconds);
    if (ok && mounted) context.showSnack('A new OTP has been sent');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(otpVerifyProvider);
    final text = context.text;
    return Scaffold(
      appBar: AppBar(title: const Text('Verify mobile')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: AppSpacing.lg),
              Icon(Icons.sms_outlined, size: 48, color: context.colors.primary),
              const SizedBox(height: AppSpacing.md),
              Text('Enter verification code', style: text.headlineMedium, textAlign: TextAlign.center),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'We sent a ${AppConfig.otpLength}-digit OTP to +91 ${Formatters.mobile(widget.args.mobile)}.\n'
                'It is valid for ${widget.args.expiresInMinutes} minutes.',
                style: text.bodyMedium?.copyWith(color: context.colors.onSurfaceVariant),
                textAlign: TextAlign.center,
              ),
              TextButton(onPressed: () => context.pop(), child: const Text('CHANGE NUMBER')),
              const SizedBox(height: AppSpacing.lg),
              OtpInput(
                controller: _otp,
                length: AppConfig.otpLength,
                hasError: state.error != null,
                enabled: !state.verifying,
                onCompleted: _verify,
              ),
              if (state.error != null) ...[
                const SizedBox(height: AppSpacing.sm),
                Text(state.error!,
                    style: text.bodySmall?.copyWith(color: context.colors.error),
                    textAlign: TextAlign.center),
              ],
              const SizedBox(height: AppSpacing.xl),
              PrimaryButton(
                label: 'Verify & continue',
                loading: state.verifying,
                onPressed: () => _verify(_otp.text),
              ),
              const SizedBox(height: AppSpacing.md),
              Center(
                child: state.secondsLeft > 0
                    ? Text('Resend OTP in ${state.secondsLeft}s', style: text.bodySmall)
                    : TextButton(
                        onPressed: state.resending ? null : _resend,
                        child: Text(state.resending ? 'SENDING…' : 'RESEND OTP'),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
