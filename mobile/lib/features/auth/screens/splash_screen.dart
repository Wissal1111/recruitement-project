import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(duration: const Duration(milliseconds: 800), vsync: this);
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) context.go('/onboarding');
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEEEDFE),
      body: FadeTransition(
        opacity: _fadeAnim,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                ),
                child: const Icon(Icons.auto_awesome, size: 52, color: AppTheme.primaryColor),
              ),
              const SizedBox(height: 24),
              const Text('Curator', style: TextStyle(
                fontSize: 32, fontWeight: FontWeight.w700, color: AppTheme.textPrimary,
              )),
              const SizedBox(height: 8),
              const Text('EDITORIAL INTELLIGENCE', style: TextStyle(
                fontSize: 13, letterSpacing: 2.5, color: AppTheme.textSecondary,
              )),
              const SizedBox(height: 60),
              const CircularProgressIndicator(
                color: AppTheme.primaryColor, strokeWidth: 2,
              ),
              const SizedBox(height: 16),
              const Text('INITIALIZING SPACE', style: TextStyle(
                fontSize: 11, letterSpacing: 2, color: AppTheme.primaryColor,
              )),
            ],
          ),
        ),
      ),
    );
  }
}