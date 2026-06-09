import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../payment/providers/payment_provider.dart';
import '../../surveys/providers/survey_provider.dart';
import '../models/auth_models.dart';
import '../repository/auth_repository.dart';

final currentUserProvider = StateProvider<User?>((ref) => null);

class AuthNotifier extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async {
    final repo = ref.watch(authRepositoryProvider);
    final loggedIn = await repo.isLoggedIn();
    return loggedIn ? null : null;
  }

  // ✅ Invalidate ALL user-specific cached data
  void _invalidateAll() {
    // Survey providers
    ref.invalidate(currentUserIdProvider);
    ref.invalidate(mySurveysProvider);
    ref.invalidate(browseSurveysProvider);
    ref.invalidate(userInvolvedStudyIdsProvider);
    ref.invalidate(myParticipatedStudyIdsProvider);
    // Payment providers
    ref.invalidate(currentPaymentUserProvider);
    ref.invalidate(walletProvider);
    ref.invalidate(walletStatsProvider);
    ref.invalidate(paymentCardsProvider);
    ref.invalidate(transactionHistoryProvider);
  }

  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      final user = await repo.login(email, password);
      ref.read(currentUserProvider.notifier).state = user;
      _invalidateAll(); // ✅ Clear all caches on login
      return user;
    });
  }

  Future<void> register({
    required String firstname,
    required String lastname,
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(authRepositoryProvider);
      final user = await repo.register(RegisterRequest(
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
      ));
      ref.read(currentUserProvider.notifier).state = user;
      _invalidateAll(); // ✅ Clear all caches on register
      return user;
    });
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    ref.read(currentUserProvider.notifier).state = null;
    _invalidateAll(); // ✅ Clear all caches on logout
    state = const AsyncData(null);
  }
}

final authProvider =
    AsyncNotifierProvider<AuthNotifier, User?>(AuthNotifier.new);
