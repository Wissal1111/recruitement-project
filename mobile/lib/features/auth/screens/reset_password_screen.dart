import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../repository/auth_repository.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  final String token;
  const ResetPasswordScreen({super.key, required this.token});

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _newPassCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure1 = true, _obscure2 = true;
  bool _loading = false;
  String? _error;

  bool get _has8 => _newPassCtrl.text.length >= 8;
  bool get _hasNumber => _newPassCtrl.text.contains(RegExp(r'[0-9]'));
  bool get _hasSymbol =>
      _newPassCtrl.text.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>]'));
  bool get _hasUpper => _newPassCtrl.text.contains(RegExp(r'[A-Z]'));

  int get _strength =>
      [_has8, _hasNumber, _hasSymbol, _hasUpper].where((v) => v).length;

  String get _strengthLabel {
    if (_strength <= 1) return 'Weak';
    if (_strength == 2) return 'Fair';
    if (_strength == 3) return 'Good';
    return 'Strong password';
  }

  Color get _strengthColor {
    if (_strength <= 1) return AppTheme.errorColor;
    if (_strength == 2) return const Color(0xFFF59E0B);
    if (_strength == 3) return const Color(0xFF3B82F6);
    return AppTheme.successColor;
  }

  Future<void> _submit() async {
    if (_newPassCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    if (_strength < 4) {
      setState(() => _error = 'Please use a stronger password');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await ref
          .read(authRepositoryProvider)
          .resetPassword(widget.token, _newPassCtrl.text);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password reset successfully!'),
            backgroundColor: AppTheme.successColor,
          ),
        );
        context.go('/login');
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _newPassCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              const Text(
                'Reset Password',
                style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              const Text(
                'Enter a new strong password below.',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 15),
              ),
              const SizedBox(height: 40),

              // Error message
              if (_error != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(children: [
                    const Icon(Icons.error_outline,
                        color: AppTheme.errorColor, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(_error!,
                            style: const TextStyle(
                                color: AppTheme.errorColor, fontSize: 13))),
                  ]),
                ),
                const SizedBox(height: 16),
              ],

              const Text('NEW PASSWORD',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1,
                      color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: _newPassCtrl,
                obscureText: _obscure1,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.lock_outline,
                      color: AppTheme.textSecondary),
                  hintText: '••••••••',
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscure1 ? Icons.visibility_off : Icons.visibility,
                        color: AppTheme.textSecondary),
                    onPressed: () => setState(() => _obscure1 = !_obscure1),
                  ),
                ),
              ),

              // Strength bar
              if (_newPassCtrl.text.isNotEmpty) ...[
                const SizedBox(height: 12),
                Row(
                    children: List.generate(
                        4,
                        (i) => Expanded(
                              child: Container(
                                margin: EdgeInsets.only(right: i < 3 ? 4 : 0),
                                height: 4,
                                decoration: BoxDecoration(
                                  color: i < _strength
                                      ? _strengthColor
                                      : const Color(0xFFE5E7EB),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ))),
                const SizedBox(height: 8),
                Row(children: [
                  Icon(Icons.check_circle, size: 16, color: _strengthColor),
                  const SizedBox(width: 6),
                  Text(_strengthLabel,
                      style: TextStyle(
                          color: _strengthColor,
                          fontSize: 13,
                          fontWeight: FontWeight.w500)),
                ]),
              ],

              const SizedBox(height: 24),
              const Text('CONFIRM PASSWORD',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1,
                      color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              TextField(
                controller: _confirmCtrl,
                obscureText: _obscure2,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.shield_outlined,
                      color: AppTheme.textSecondary),
                  hintText: '••••••••',
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscure2 ? Icons.visibility_off : Icons.visibility,
                        color: AppTheme.textSecondary),
                    onPressed: () => setState(() => _obscure2 = !_obscure2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Checklist
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: const Color(0xFFF9FAFB),
                    borderRadius: BorderRadius.circular(12)),
                child: Wrap(
                  spacing: 24,
                  runSpacing: 8,
                  children: [
                    _Check('8+ Characters', _has8),
                    _Check('One symbol', _hasSymbol),
                    _Check('One number', _hasNumber),
                    _Check('Upper case', _hasUpper),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: (_strength == 4 &&
                        _newPassCtrl.text == _confirmCtrl.text &&
                        !_loading)
                    ? _submit
                    : null,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : const Text('UPDATE PASSWORD'),
              ),
              const SizedBox(height: 20),
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

class _Check extends StatelessWidget {
  final String label;
  final bool passed;
  const _Check(this.label, this.passed);

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(passed ? Icons.check : Icons.circle,
          size: 14,
          color: passed ? AppTheme.successColor : const Color(0xFFD1D5DB)),
      const SizedBox(width: 6),
      Text(label,
          style: TextStyle(
              fontSize: 13,
              color: passed ? AppTheme.textPrimary : AppTheme.textSecondary)),
    ]);
  }
}
