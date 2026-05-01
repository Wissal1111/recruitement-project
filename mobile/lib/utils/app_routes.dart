import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/providers/auth_provider.dart';
import '../features/auth/screens/forgot_password_screen.dart';
import '../features/auth/screens/home_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/onboarding_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/reset_password_screen.dart';
import '../features/auth/screens/splash_screen.dart';
import '../features/interests/screens/interests_screen.dart';
import '../features/notifications/screens/alerts_screen.dart';
import '../features/profile/screens/edit_profile_screen.dart';
import '../features/profile/screens/profile_screen.dart';

class AppRoutes {
  static GoRouter router(WidgetRef ref) => GoRouter(
        initialLocation: '/splash',
        redirect: (context, state) {
          final authState = ref.watch(authProvider);
          final isLoading = authState.isLoading;
          final user = authState.value;

          final isOnAuthPage = state.matchedLocation == '/login' ||
              state.matchedLocation == '/register' ||
              state.matchedLocation == '/splash' ||
              state.matchedLocation == '/onboarding' ||
              state.matchedLocation == '/forgot-password' ||
              state.matchedLocation.startsWith('/reset-password');

          if (isLoading) return null;
          if (user == null && !isOnAuthPage) return '/login';
          if (user != null &&
              isOnAuthPage &&
              state.matchedLocation != '/splash') {
            return '/home';
          }
          return null;
        },
        routes: [
          GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
          GoRoute(
              path: '/onboarding',
              builder: (_, __) => const OnboardingScreen()),
          GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
          GoRoute(
              path: '/register', builder: (_, __) => const RegisterScreen()),
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
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
          GoRoute(
              path: '/edit-profile',
              builder: (_, __) => const EditProfileScreen()),
          GoRoute(
              path: '/interests', builder: (_, __) => const InterestsScreen()),
          GoRoute(
              path: '/notifications', builder: (_, __) => const AlertsScreen()),
        ],
      );
}
