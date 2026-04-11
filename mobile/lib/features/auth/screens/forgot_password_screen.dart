import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../repository/auth_repository.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  final _tokenCtrl =
      TextEditingController(); // for dev — paste token from console
  bool _loading = false;
  bool _sent = false;
  bool _showTokenInput = false;
  String? _error;

  Future<void> _submit() async {
    if (_emailCtrl.text.trim().isEmpty || !_emailCtrl.text.contains('@')) {
      setState(() => _error = 'Please enter a valid email');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref
          .read(authRepositoryProvider)
          .forgotPassword(_emailCtrl.text.trim());
      setState(() {
        _sent = true;
        _showTokenInput = true; // show token input for dev testing
      });
    } catch (e) {
      setState(() => _error = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _goToReset() {
    final token = _tokenCtrl.text.trim();
    if (token.isEmpty) {
      setState(() => _error = 'Please paste the reset token');
      return;
    }
    context.go('/reset-password?token=$token');
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _tokenCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.go('/login'),
              ),
              const SizedBox(height: 24),
              const Text(
                'Forgot password?',
                style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              const Text(
                "Enter your email and we'll send you a reset link.",
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 15),
              ),
              const SizedBox(height: 40),

              // Error
              if (_error != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(10)),
                  child: Text(_error!,
                      style: const TextStyle(
                          color: AppTheme.errorColor, fontSize: 13)),
                ),
                const SizedBox(height: 16),
              ],

              // Success banner
              if (_sent) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                      color: const Color(0xFFD1FAE5),
                      borderRadius: BorderRadius.circular(12)),
                  child: Row(children: [
                    const Icon(Icons.check_circle_outline,
                        color: AppTheme.successColor),
                    const SizedBox(width: 12),
                    Expanded(
                        child: Text(
                            'Reset token generated for ${_emailCtrl.text}.\nCheck your terminal and paste the token below.',
                            style:
                                const TextStyle(color: AppTheme.successColor))),
                  ]),
                ),
                const SizedBox(height: 24),
              ],

              // Email field — always visible
              const Text('EMAIL ADDRESS',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1,
                      color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                enabled: !_sent,
                decoration: const InputDecoration(hintText: 'your@email.com'),
              ),
              const SizedBox(height: 24),

              // Token input — shown after email sent (dev mode)
              if (_showTokenInput) ...[
                const Text('RESET TOKEN (from terminal)',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1,
                        color: AppTheme.textSecondary)),
                const SizedBox(height: 8),
                TextField(
                  controller: _tokenCtrl,
                  decoration: const InputDecoration(
                      hintText: 'Paste token from backend console'),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _goToReset,
                  child: const Text('Continue to Reset Password'),
                ),
              ] else ...[
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Send Reset Link'),
                ),
              ],

              const SizedBox(height: 24),
              Center(
                child: TextButton.icon(
                  onPressed: () => context.go('/login'),
                  icon: const Icon(Icons.arrow_back,
                      size: 16, color: AppTheme.textSecondary),
                  label: const Text('Return to login',
                      style: TextStyle(color: AppTheme.textSecondary)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
