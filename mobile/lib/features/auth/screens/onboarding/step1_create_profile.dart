import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';
import '../../models/registration_state.dart';

class Step1CreateProfile extends StatefulWidget {
  final RegistrationState data;
  final void Function(RegistrationState) onNext;

  const Step1CreateProfile(
      {super.key, required this.data, required this.onNext});

  @override
  State<Step1CreateProfile> createState() => _Step1State();
}

class _Step1State extends State<Step1CreateProfile> {
  late final TextEditingController _first;
  late final TextEditingController _last;
  late final TextEditingController _email;
  late final TextEditingController _pass;
  late final TextEditingController _confirm;

  bool _obscurePass = true;
  bool _obscureConfirm = true;
  bool _agreed = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _first = TextEditingController(text: widget.data.firstname);
    _last = TextEditingController(text: widget.data.lastname);
    _email = TextEditingController(text: widget.data.email);
    _pass = TextEditingController(text: widget.data.password);
    _confirm = TextEditingController(text: '');
  }

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _email.dispose();
    _pass.dispose();
    _confirm.dispose();
    super.dispose();
  }

  void _validate() {
    if (_first.text.isEmpty || _last.text.isEmpty) {
      setState(() => _error = 'Please enter your full name');
      return;
    }
    if (!_email.text.contains('@')) {
      setState(() => _error = 'Please enter a valid email');
      return;
    }
    if (_pass.text.length < 8) {
      setState(() => _error = 'Password must be at least 8 characters');
      return;
    }
    if (_pass.text != _confirm.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    if (!_agreed) {
      setState(() => _error = 'Please agree to the Terms of Service');
      return;
    }

    setState(() => _error = null);

    widget.onNext(widget.data.copyWith(
      firstname: _first.text.trim(),
      lastname: _last.text.trim(),
      email: _email.text.trim(),
      password: _pass.text,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'LucidCurator',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primary,
                    letterSpacing: -0.5,
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceHigh,
                    borderRadius: BorderRadius.circular(9999),
                  ),
                  child: const Text(
                    'STEP 1 OF 6',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(100),
              child: const LinearProgressIndicator(
                value: 1 / 6,
                minHeight: 4,
                backgroundColor: AppTheme.surfaceHigh,
                valueColor:
                    AlwaysStoppedAnimation<Color>(AppTheme.primary),
              ),
            ),
            const SizedBox(height: 32),
            Center(
              child: Container(
                width: 160,
                height: 160,
                decoration: const BoxDecoration(
                  color: AppTheme.surfaceLow,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(28),
                      gradient: const RadialGradient(
                        colors: [
                          Color(0xFF9B8FFF),
                          Color(0xFF4A4BD7),
                          Color(0xFF1A1060),
                        ],
                        center: Alignment(-0.3, -0.3),
                      ),
                    ),
                    child: const Icon(Icons.auto_awesome,
                        color: Colors.white, size: 36),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 28),
            const Text(
              'Create your profile',
              style: TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Start your journey into the world of curated data and professional insights.',
              style: TextStyle(
                fontSize: 15,
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 32),
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline,
                        color: AppTheme.errorColor, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _error!,
                        style: const TextStyle(
                          color: AppTheme.errorColor,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
            _FormSection(
              label: 'FIRST NAME',
              child: TextField(controller: _first),
            ),
            const SizedBox(height: 16),
            _FormSection(
              label: 'LAST NAME',
              child: TextField(controller: _last),
            ),
            const SizedBox(height: 16),
            _FormSection(
              label: 'EMAIL ADDRESS',
              child: TextField(controller: _email),
            ),
            const SizedBox(height: 16),
            _FormSection(
              label: 'PASSWORD',
              child: TextField(
                controller: _pass,
                obscureText: _obscurePass,
                decoration: InputDecoration(
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePass
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined),
                    onPressed: () =>
                        setState(() => _obscurePass = !_obscurePass),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            _FormSection(
              label: 'CONFIRM PASSWORD',
              child: TextField(
                controller: _confirm,
                obscureText: _obscureConfirm,
                decoration: InputDecoration(
                  suffixIcon: IconButton(
                    icon: Icon(_obscureConfirm
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined),
                    onPressed: () =>
                        setState(() => _obscureConfirm = !_obscureConfirm),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                GestureDetector(
                  onTap: () => setState(() => _agreed = !_agreed),
                  child: Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: _agreed ? AppTheme.primary : Colors.transparent,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primary),
                    ),
                    child: _agreed
                        ? const Icon(Icons.check, color: Colors.white, size: 14)
                        : null,
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'By continuing, you agree to our Terms of Service and Privacy Policy.',
                    style:
                        TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            GradientButton(
              label: 'Continue',
              onPressed: _validate,
              trailingIcon: Icons.arrow_forward,
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Already have an account? '),
                GestureDetector(
                  onTap: () => context.go('/login'),
                  child: const Text(
                    'Sign In',
                    style: TextStyle(
                        color: AppTheme.primary, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Row(
              children: [
                Expanded(child: Divider(color: AppTheme.surfaceHigh)),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('or'),
                ),
                Expanded(child: Divider(color: AppTheme.surfaceHigh)),
              ],
            ),
            const SizedBox(height: 16),
            _SocialButton(
              label: 'Continue with Google',
              icon: Icons.g_mobiledata,
              onTap: () {},
            ),
            const SizedBox(height: 10),
            _SocialButton(
              label: 'Continue with Facebook',
              icon: Icons.facebook,
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }
}

class _FormSection extends StatelessWidget {
  final String label;
  final Widget child;

  const _FormSection({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}

class _SocialButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _SocialButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 54,
        decoration: BoxDecoration(
          color: AppTheme.surfaceLowest,
          borderRadius: BorderRadius.circular(9999),
          border: Border.all(color: AppTheme.surfaceHigh, width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: AppTheme.textSecondary, size: 22),
            const SizedBox(width: 10),
            Text(label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                )),
          ],
        ),
      ),
    );
  }
}
