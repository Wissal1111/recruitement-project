import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucid_curator/features/auth/repository/auth_repository.dart';

import '../../../shared/theme.dart';
import '../../../shared/widgets/gradient_button.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String? _error;

  Future<void> _submit() async {
    if (_emailCtrl.text.trim().isEmpty || !_emailCtrl.text.contains('@')) {
      setState(() => _error = 'Please enter a valid email address');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // ✅ Use your AuthRepository instead of raw Dio!
      await ref
          .read(authRepositoryProvider)
          .forgotPassword(_emailCtrl.text.trim());

      setState(() => _sent = true);
    } catch (e) {
      // ✅ Print the exact error to your console so you can debug it!
      debugPrint('Forgot Password Error: $e');
      setState(() => _error =
          'Something went wrong: ${e.toString().replaceAll("Exception: ", "")}');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => context.go('/login'),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceLow,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.arrow_back_ios_new,
                      size: 16, color: AppTheme.textPrimary),
                ),
              ),
              const SizedBox(height: 32),
              Center(
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryContainer,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.lock_reset_outlined,
                      color: AppTheme.primary, size: 34),
                ),
              ),
              const SizedBox(height: 24),
              const Center(
                  child: Text('Forgot password?',
                      style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textPrimary,
                          letterSpacing: -0.5))),
              const SizedBox(height: 8),
              const Center(
                  child: Text(
                "Enter your email and we'll send you a reset link.",
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: AppTheme.textSecondary, fontSize: 15, height: 1.5),
              )),
              const SizedBox(height: 40),
              if (_sent) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFD1FAE5),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(children: [
                    const Icon(Icons.mark_email_read_outlined,
                        color: AppTheme.successColor, size: 28),
                    const SizedBox(width: 14),
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          const Text('Check your inbox!',
                              style: TextStyle(
                                  color: AppTheme.successColor,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16)),
                          const SizedBox(height: 4),
                          Text(
                              'If ${_emailCtrl.text} exists, a reset link was sent.',
                              style: const TextStyle(
                                  color: AppTheme.successColor, fontSize: 13)),
                        ])),
                  ]),
                ),
                const SizedBox(height: 24),
                GradientButton(
                  label: 'Back to Login',
                  onPressed: () => context.go('/login'),
                  trailingIcon: Icons.arrow_forward,
                ),
              ] else ...[
                if (_error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(children: [
                      const Icon(Icons.error_outline,
                          color: AppTheme.errorColor, size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                          child: Text(_error!,
                              style: const TextStyle(
                                  color: AppTheme.errorColor, fontSize: 13))),
                    ]),
                  ),
                  const SizedBox(height: 16),
                ],
                const Text('EMAIL ADDRESS',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        color: AppTheme.textSecondary)),
                const SizedBox(height: 8),
                TextField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(hintText: 'your@email.com'),
                ),
                const SizedBox(height: 32),
                GradientButton(
                  label: 'Send Reset Link',
                  isLoading: _loading,
                  onPressed: _loading ? null : _submit,
                  trailingIcon: Icons.send_outlined,
                ),
              ],
              const SizedBox(height: 20),
              Center(
                child: GestureDetector(
                  onTap: () => context.go('/login'),
                  child: const Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.arrow_back,
                        size: 16, color: AppTheme.textSecondary),
                    SizedBox(width: 6),
                    Text('Return to login',
                        style: TextStyle(
                            color: AppTheme.textSecondary, fontSize: 14)),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
