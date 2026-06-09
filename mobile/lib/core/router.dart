import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucid_curator/features/notifications/screens/alerts_screen.dart';
import 'package:lucid_curator/features/payment/screens/buy_points_screen.dart';
import 'package:lucid_curator/features/payment/screens/payment_cards_screen.dart';
import 'package:lucid_curator/features/payment/screens/transaction_history_screen.dart';
import 'package:lucid_curator/features/payment/screens/wallet_screen.dart';
import 'package:lucid_curator/features/surveys/models/survey_model.dart';
import 'package:lucid_curator/features/surveys/screens/answer_phase_screen.dart';
import 'package:lucid_curator/features/surveys/screens/create_survey_screen.dart';
import 'package:lucid_curator/features/surveys/screens/invitations_screen.dart';
import 'package:lucid_curator/features/surveys/screens/participant_survey_detail_screen.dart';
import 'package:lucid_curator/features/surveys/screens/survey_builder_screen.dart';
import 'package:lucid_curator/features/surveys/screens/survey_detail_screen.dart';
import 'package:lucid_curator/features/surveys/screens/surveys_screen.dart';

import '../core/api_client.dart';
import '../features/auth/providers/auth_provider.dart';
import '../features/auth/screens/forgot_password_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/onboarding_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/reset_password_screen.dart';
import '../features/auth/screens/splash_screen.dart';
import '../features/profile/screens/edit_profile_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/surveys/screens/applications_screen.dart';
import '../features/surveys/screens/invite_participants_screen.dart';

// ✅ Unread notification count provider
final unreadNotificationCountProvider =
    StateNotifierProvider<UnreadCountNotifier, int>(
        (ref) => UnreadCountNotifier(ref));

class UnreadCountNotifier extends StateNotifier<int> {
  final Ref _ref;
  UnreadCountNotifier(this._ref) : super(0) {
    refresh();
  }

  Future<void> refresh() async {
    try {
      final dio = _ref.read(dioProvider);
      final res = await dio.get('/api/notifications');
      List all = [];
      if (res.data is List) {
        all = res.data as List;
      } else if (res.data is Map && res.data['notifications'] != null) {
        all = res.data['notifications'] as List;
      }
      final unread = all.where((n) => n['isRead'] != true).length;
      state = unread;
    } catch (_) {
      state = 0;
    }
  }
}

// ✅ Pending invitation count provider
final pendingInvitationCountProvider =
    StateNotifierProvider<PendingInvitationCountNotifier, int>(
        (ref) => PendingInvitationCountNotifier(ref));

class PendingInvitationCountNotifier extends StateNotifier<int> {
  final Ref _ref;
  PendingInvitationCountNotifier(this._ref) : super(0) {
    refresh();
  }

  Future<void> refresh() async {
    try {
      final dio = _ref.read(dioProvider);
      final res = await dio.get('/api/recruitment/invitations/me');
      List all = [];
      if (res.data is List) {
        all = res.data as List;
      }
      final pending = all.where((inv) {
        final status = (inv['status'] ?? '').toString().toUpperCase();
        return status == 'PENDING';
      }).length;
      state = pending;
    } catch (_) {
      state = 0;
    }
  }
}

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
              path: '/surveys/participant-detail',
              builder: (context, state) {
                final survey = state.extra as Study;
                return ParticipantSurveyDetailScreen(survey: survey);
              }),
          GoRoute(
              path: '/surveys/answer',
              builder: (context, state) {
                final data = state.extra as Map<String, dynamic>;
                return AnswerPhaseScreen(
                  survey: data['survey'] as Study,
                  phaseIndex: data['phaseIndex'] as int,
                );
              }),
          GoRoute(
              path: '/surveys/build',
              builder: (context, state) {
                final data = state.extra as Map<String, dynamic>? ?? {};
                return SurveyBuilderScreen(surveyData: data);
              }),
          GoRoute(
              path: '/surveys/applications',
              builder: (context, state) {
                final survey = state.extra as Study;
                return ApplicationsScreen(survey: survey);
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
          GoRoute(
              path: '/invitations',
              builder: (_, __) => const InvitationsScreen()),
          GoRoute(
              path: '/notifications', builder: (_, __) => const AlertsScreen()),
          GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
          GoRoute(
              path: '/wallet/cards',
              builder: (_, __) => const PaymentCardsScreen()),
          GoRoute(
              path: '/wallet/transactions',
              builder: (_, __) => const TransactionHistoryScreen()),
          GoRoute(
              path: '/wallet/buy-points',
              builder: (_, __) => const BuyPointsScreen()),
        ],
      ),
    ],
  );
});

// ✅ Bottom nav shell with auto-refresh
class MainShell extends ConsumerStatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  late final Timer _refreshTimer;

  @override
  void initState() {
    super.initState();
    // ✅ Refresh counts immediately
    Future.microtask(() {
      ref.read(unreadNotificationCountProvider.notifier).refresh();
      ref.read(pendingInvitationCountProvider.notifier).refresh();
    });

    // ✅ Auto-refresh every 15 seconds
    _refreshTimer = Timer.periodic(
      const Duration(seconds: 15),
      (_) {
        if (mounted) {
          ref.read(unreadNotificationCountProvider.notifier).refresh();
          ref.read(pendingInvitationCountProvider.notifier).refresh();
        }
      },
    );
  }

  @override
  void dispose() {
    _refreshTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: const _BottomNav(),
    );
  }
}

class _BottomNav extends ConsumerWidget {
  const _BottomNav();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    final unreadCount = ref.watch(unreadNotificationCountProvider);
    final invitationCount = ref.watch(pendingInvitationCountProvider);

    final items = [
      (
        icon: Icons.home_outlined,
        activeIcon: Icons.home,
        label: 'Home',
        path: '/home',
        badgeCount: 0,
      ),
      (
        icon: Icons.mail_outline,
        activeIcon: Icons.mail,
        label: 'Invitations',
        path: '/invitations',
        badgeCount: invitationCount, // ✅ Pending invitations
      ),
      (
        icon: Icons.notifications_outlined,
        activeIcon: Icons.notifications,
        label: 'Notifications',
        path: '/notifications',
        badgeCount: unreadCount, // ✅ Unread notifications
      ),
      (
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        label: 'Profile',
        path: '/profile',
        badgeCount: 0,
      ),
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
        selectedFontSize: 12,
        unselectedFontSize: 12,
        elevation: 0,
        onTap: (i) {
          context.go(items[i].path);
          // ✅ Refresh both counts when switching tabs
          ref.read(unreadNotificationCountProvider.notifier).refresh();
          ref.read(pendingInvitationCountProvider.notifier).refresh();
        },
        items: items.map((e) {
          final isSelected = items.indexOf(e) == idx;

          return BottomNavigationBarItem(
            icon: e.badgeCount > 0
                ? Badge(
                    label: Text(
                      e.badgeCount > 99 ? '99+' : '${e.badgeCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    backgroundColor: Colors.red,
                    child: Icon(isSelected ? e.activeIcon : e.icon),
                  )
                : Icon(isSelected ? e.activeIcon : e.icon),
            label: e.label,
          );
        }).toList(),
      ),
    );
  }
}
