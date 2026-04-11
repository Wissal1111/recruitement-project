import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../../../shared/widgets/gradient_button.dart';

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() =>
      _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _oldCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _obscureOld = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;
  bool _loading = false;
  String? _error;
  bool _success = false;

  bool get _has8 => _newCtrl.text.length >= 8;
  bool get _hasNumber => _newCtrl.text.contains(RegExp(r'[0-9]'));
  bool get _hasSymbol =>
      _newCtrl.text.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>]'));
  bool get _hasUpper => _newCtrl.text.contains(RegExp(r'[A-Z]'));
  int get _strength =>
      [_has8, _hasNumber, _hasSymbol, _hasUpper].where((v) => v).length;

  String get _strengthLabel {
    if (_newCtrl.text.isEmpty) return '';
    if (_strength <= 1) return 'WEAK';
    if (_strength == 2) return 'FAIR';
    if (_strength == 3) return 'GOOD';
    return 'STRONG';
  }

  Color get _strengthColor {
    if (_strength <= 1) return AppTheme.errorColor;
    if (_strength == 2) return const Color(0xFFF59E0B);
    if (_strength == 3) return const Color(0xFF3B82F6);
    return AppTheme.successColor;
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _success = false;
    });

    if (_oldCtrl.text.isEmpty) {
      setState(() => _error = 'Enter your current password');
      return;
    }
    if (_newCtrl.text.length < 8) {
      setState(() => _error = 'New password must be at least 8 characters');
      return;
    }
    if (_newCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }

    setState(() => _loading = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.put('/api/auth/change-password', data: {
        'oldPassword': _oldCtrl.text,
        'newPassword': _newCtrl.text,
      });
      setState(() {
        _success = true;
        _loading = false;
      });
      _oldCtrl.clear();
      _newCtrl.clear();
      _confirmCtrl.clear();
    } catch (e) {
      setState(() {
        _error = 'Current password is incorrect';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            // App bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceLow,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.arrow_back_ios_new, size: 16),
                  ),
                ),
                const Expanded(
                    child: Center(
                        child: Text('Curator',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary,
                            )))),
                const SizedBox(width: 40),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),

                    // Icon
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
                        child: Text('Update Your Password',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.textPrimary,
                              letterSpacing: -0.5,
                            ))),
                    const SizedBox(height: 8),
                    const Center(
                        child: Text(
                      'Choose a strong password to keep your account secure.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                          height: 1.5),
                    )),
                    const SizedBox(height: 24),

                    // Step dots (cosmetic)
                    Center(
                        child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(
                          3,
                          (i) => Container(
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 4),
                                width: i == 1 ? 28 : 20,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: i == 1
                                      ? AppTheme.primary
                                      : AppTheme.surfaceHigh,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              )),
                    )),
                    const SizedBox(height: 28),

                    // Success banner
                    if (_success) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(children: [
                          const Icon(Icons.check_circle_outline,
                              color: AppTheme.successColor, size: 22),
                          const SizedBox(width: 12),
                          const Expanded(
                              child: Text('Password updated successfully!',
                                  style: TextStyle(
                                      color: AppTheme.successColor,
                                      fontWeight: FontWeight.w600))),
                        ]),
                      ),
                      const SizedBox(height: 20),
                    ],

                    // Error banner
                    if (_error != null) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(children: [
                          const Icon(Icons.error_outline,
                              color: AppTheme.errorColor, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                              child: Text(_error!,
                                  style: const TextStyle(
                                      color: AppTheme.errorColor,
                                      fontSize: 13))),
                        ]),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Current password
                    _Label('CURRENT PASSWORD'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _oldCtrl,
                      obscureText: _obscureOld,
                      decoration: InputDecoration(
                        hintText: '••••••••',
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureOld
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: AppTheme.textTertiary,
                            size: 20,
                          ),
                          onPressed: () =>
                              setState(() => _obscureOld = !_obscureOld),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // New password
                    _Label('NEW PASSWORD'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _newCtrl,
                      obscureText: _obscureNew,
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(
                        hintText: '••••••••',
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureNew
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: AppTheme.textTertiary,
                            size: 20,
                          ),
                          onPressed: () =>
                              setState(() => _obscureNew = !_obscureNew),
                        ),
                      ),
                    ),
                    if (_newCtrl.text.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Row(children: [
                        ...List.generate(
                            4,
                            (i) => Expanded(
                                  child: Container(
                                    margin:
                                        EdgeInsets.only(right: i < 3 ? 4 : 0),
                                    height: 4,
                                    decoration: BoxDecoration(
                                      color: i < _strength
                                          ? _strengthColor
                                          : AppTheme.surfaceHigh,
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                  ),
                                )),
                        const SizedBox(width: 10),
                        Text(_strengthLabel,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: _strengthColor,
                              letterSpacing: 1,
                            )),
                      ]),
                    ],
                    const SizedBox(height: 20),

                    // Confirm new password
                    _Label('CONFIRM NEW PASSWORD'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _confirmCtrl,
                      obscureText: _obscureConfirm,
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(
                        hintText: '••••••••',
                        suffixIcon: _confirmCtrl.text.isNotEmpty
                            ? Icon(
                                _confirmCtrl.text == _newCtrl.text
                                    ? Icons.check_circle_outline
                                    : Icons.highlight_off,
                                color: _confirmCtrl.text == _newCtrl.text
                                    ? AppTheme.successColor
                                    : AppTheme.errorColor,
                                size: 20,
                              )
                            : IconButton(
                                icon: Icon(
                                  _obscureConfirm
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  color: AppTheme.textTertiary,
                                  size: 20,
                                ),
                                onPressed: () => setState(
                                    () => _obscureConfirm = !_obscureConfirm),
                              ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Security advice card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceLow,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryContainer,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.shield_outlined,
                                  color: AppTheme.primary, size: 18),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                                child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Security Advice',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                      color: AppTheme.textPrimary,
                                    )),
                                SizedBox(height: 4),
                                Text(
                                  'Ensure your password is unique and contains at least 12 characters, including symbols.',
                                  style: TextStyle(
                                      fontSize: 13,
                                      color: AppTheme.textSecondary,
                                      height: 1.5),
                                ),
                              ],
                            )),
                          ]),
                    ),
                    const SizedBox(height: 28),

                    GradientButton(
                      label: 'Save New Password',
                      isLoading: _loading,
                      onPressed: _loading ? null : _submit,
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Text(text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
        color: AppTheme.primary,
      ));
}
