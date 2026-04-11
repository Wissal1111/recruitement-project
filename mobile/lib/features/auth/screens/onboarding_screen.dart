import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  final _pages = [
    _OnboardingPage(
      title: 'Create high-impact surveys.',
      subtitle:
          'Define your ideal audience and start collecting editorial-grade data with a few simple taps.',
      icon: Icons.assignment_outlined,
    ),
    _OnboardingPage(
      title: 'Earn Rewards',
      subtitle:
          'Share your opinions and get paid for your honesty. We value your unique perspective.',
      icon: Icons.monetization_on_outlined,
    ),
    _OnboardingPage(
      title: 'Smart Matching',
      subtitle:
          'Our AI matches you to the exact demographic profiles you need.',
      icon: Icons.auto_awesome_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('LucidCurator',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryColor,
                      )),
                  TextButton(
                    onPressed: () => context.go('/login'),
                    child: const Text('SKIP',
                        style: TextStyle(
                            color: AppTheme.textSecondary, letterSpacing: 1)),
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _page = i),
                itemBuilder: (_, i) {
                  final p = _pages[i];
                  return Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryLight,
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: Icon(p.icon,
                              size: 56, color: AppTheme.primaryColor),
                        ),
                        const SizedBox(height: 48),
                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary,
                                height: 1.2),
                            text: p.title,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(p.subtitle,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 15,
                              color: AppTheme.textSecondary,
                              height: 1.6,
                            )),
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                        _pages.length,
                        (i) => AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              width: i == _page ? 24 : 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: i == _page
                                    ? AppTheme.primaryColor
                                    : const Color(0xFFD1D5DB),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            )),
                  ),
                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: () {
                      if (_page < _pages.length - 1) {
                        _controller.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut);
                      } else {
                        context.go('/login');
                      }
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                            _page < _pages.length - 1 ? 'NEXT' : 'GET STARTED'),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_forward, size: 18),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text('Step ${_page + 1} of ${_pages.length}',
                      style: const TextStyle(
                          color: AppTheme.textSecondary, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPage {
  final String title, subtitle;
  final IconData icon;
  const _OnboardingPage(
      {required this.title, required this.subtitle, required this.icon});
}
