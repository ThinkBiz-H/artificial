import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routes/route_paths.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/brand_logo.dart';
import '../../../shared/widgets/buttons.dart';
import '../viewmodels/auth_flow_viewmodel.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key, this.redirectTo});
  final String? redirectTo;

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _mobile = TextEditingController();
  final _name = TextEditingController();

  @override
  void dispose() {
    _mobile.dispose();
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    context.hideKeyboard();
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final vm = ref.read(authFlowProvider.notifier);
    final mobile = Formatters.normalizeMobile(_mobile.text);
    final needsName = ref.read(authFlowProvider).needsName;
    final args = needsName
        ? await vm.register(name: _name.text, mobile: mobile, redirectTo: widget.redirectTo)
        : await vm.continueWithMobile(mobile, redirectTo: widget.redirectTo);
    if (args != null && mounted) {
      context.push(RoutePaths.otp, extra: args);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authFlowProvider);
    final text = context.text;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.canPop() ? context.pop() : context.go(RoutePaths.home),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: AppSpacing.md),
                const Center(child: BrandLogo(height: 40)),
                const SizedBox(height: AppSpacing.xxl),
                Text(state.needsName ? 'Create your account' : 'Welcome',
                    style: text.displaySmall, textAlign: TextAlign.center),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  state.needsName
                      ? 'This number is new to us. Tell us your name to continue.'
                      : 'Login or sign up with your mobile number',
                  style: text.bodyMedium?.copyWith(color: context.colors.onSurfaceVariant),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xxl),
                MobileField(
                  controller: _mobile,
                  validator: Validators.mobile,
                  enabled: !state.needsName && !state.loading,
                  textInputAction: state.needsName ? TextInputAction.next : TextInputAction.done,
                  onSubmitted: (_) => state.needsName ? null : _submit(),
                ),
                AnimatedSize(
                  duration: AppDurations.medium,
                  child: state.needsName
                      ? Padding(
                          padding: const EdgeInsets.only(top: AppSpacing.md),
                          child: AppTextField(
                            controller: _name,
                            label: 'Full name',
                            validator: Validators.name,
                            textCapitalization: TextCapitalization.words,
                            textInputAction: TextInputAction.done,
                            autofillHints: const [AutofillHints.name],
                            onSubmitted: (_) => _submit(),
                          ),
                        )
                      : const SizedBox(width: double.infinity),
                ),
                if (state.needsName)
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: ref.read(authFlowProvider.notifier).resetToMobile,
                      child: const Text('CHANGE NUMBER'),
                    ),
                  ),
                if (state.error != null) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(state.error!, style: text.bodySmall?.copyWith(color: context.colors.error)),
                ],
                const SizedBox(height: AppSpacing.xl),
                PrimaryButton(
                  label: state.needsName ? 'Create account & get OTP' : 'Get OTP',
                  loading: state.loading,
                  onPressed: _submit,
                ),
                const SizedBox(height: AppSpacing.xl),
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text('SECURE OTP LOGIN', style: AppTypography.overline(AppColors.roseGold)),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Text.rich(
                  TextSpan(
                    text: 'By continuing you agree to our ',
                    children: [
                      WidgetSpan(
                        alignment: PlaceholderAlignment.baseline,
                        baseline: TextBaseline.alphabetic,
                        child: GestureDetector(
                          onTap: () => context.push(RoutePaths.page('terms')),
                          child: Text('Terms',
                              style: text.bodySmall?.copyWith(
                                  color: context.colors.primary, fontWeight: FontWeight.w600)),
                        ),
                      ),
                      const TextSpan(text: ' & '),
                      WidgetSpan(
                        alignment: PlaceholderAlignment.baseline,
                        baseline: TextBaseline.alphabetic,
                        child: GestureDetector(
                          onTap: () => context.push(RoutePaths.page('privacy')),
                          child: Text('Privacy Policy',
                              style: text.bodySmall?.copyWith(
                                  color: context.colors.primary, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),
                  style: text.bodySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
