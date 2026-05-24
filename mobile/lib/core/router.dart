import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucid_curator/features/notifications/screens/alerts_screen.dart';
import 'package:lucid_curator/features/surveys/models/survey_model.dart';
import 'package:lucid_curator/features/surveys/screens/create_survey_screen.dart';
import 'package:lucid_curator/features/surveys/screens/invitations_screen.dart';
import 'package:lucid_curator/features/surveys/screens/survey_builder_screen.dart';
import 'package:lucid_curator/features/surveys/screens/survey_detail_screen.dart';
import 'package:lucid_curator/features/surveys/screens/surveys_screen.dart';

import '../features/auth/providers/auth_provider.dart';
import '../features/auth/screens/forgot_password_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/onboarding_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/reset_password_screen.dart';
import '../features/auth/screens/splash_screen.dart';
import '../features/profile/screens/edit_profile_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/surveys/screens/invite_participants_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) async {
      final authState = ref.read(authProvider);
      final isLoggedIn = authState.valueOrNull != null;
      final onAuthPage = state.matchedLocation.startsWith('/login') ||
          state.matchedLocation.startsWith('/register') ||
          state.matchedLocation.startsWith('/onboarding') ||
          state.matchedLocation.startsWith('/splash') ||
          state.matchedLocation.startsWith('/forgot-password') ||
          state.matchedLocation.startsWith('/reset-password');

      if (!isLoggedIn && !onAuthPage) return '/login';
      if (isLoggedIn && onAuthPage) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(
          path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(
          path: '/forgot-password',
          builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          final token = state.uri.queryParameters['token'] ?? '';
          return ResetPasswordScreen(token: token);
        },
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const SurveysScreen()),
          GoRoute(
              path: '/surveys/invite',
              builder: (context, state) {
                final survey = state.extra as Study;
                return InviteParticipantsScreen(survey: survey);
              }),
          GoRoute(path: '/surveys', builder: (_, __) => const SurveysScreen()),
          GoRoute(
              path: '/surveys/create',
              builder: (_, __) => const CreateSurveyScreen()),
          GoRoute(
              path: '/surveys/build',
              builder: (context, state) {
                final data = state.extra as Map<String, dynamic>? ?? {};
                return SurveyBuilderScreen(surveyData: data);
              }),
          GoRoute(
              path: '/surveys/detail',
              builder: (context, state) {
                final survey = state.extra as Study;
                return SurveyDetailScreen(survey: survey);
              }),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
          GoRoute(
              path: '/profile/edit',
              builder: (_, __) => const EditProfileScreen()),

          // 🚨 REPLACED INTERESTS WITH INVITATIONS
          GoRoute(
              path: '/invitations',
              builder: (_, __) => const InvitationsScreen()),
          GoRoute(
              path: '/notifications', builder: (_, __) => const AlertsScreen()),
        ],
      ),
    ],
  );
});

// Bottom nav shell
class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: _BottomNav(),
    );
  }
}

class _BottomNav extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    final items = [
      (icon: Icons.home_outlined, label: 'Home', path: '/home'),
      (icon: Icons.mail_outline, label: 'Invitations', path: '/invitations'),
      (
        icon: Icons.notifications_outlined,
        label: 'Notifications',
        path: '/notifications'
      ),
      (icon: Icons.person_outline, label: 'Profile', path: '/profile'),
    ];

    int idx = items.indexWhere((e) => location.startsWith(e.path));
    if (idx < 0) idx = 0;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB), width: 0.5)),
      ),
      child: BottomNavigationBar(
        currentIndex: idx,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFF534AB7),
        unselectedItemColor: const Color(0xFF9CA3AF),
        elevation: 0,
        onTap: (i) => context.go(items[i].path),
        items: items
            .map((e) =>
                BottomNavigationBarItem(icon: Icon(e.icon), label: e.label))
            .toList(),
      ),
    );
  }
}
