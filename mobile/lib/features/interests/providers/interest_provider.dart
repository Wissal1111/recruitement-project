import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/interest_model.dart';
import '../repository/interest_repository.dart';

final allInterestsProvider = FutureProvider<List<Interest>>((ref) async {
  return ref.read(interestRepositoryProvider).getAllInterests();
});

final userInterestsProvider =
    AsyncNotifierProvider<UserInterestsNotifier, List<UserInterest>>(
  UserInterestsNotifier.new,
);

class UserInterestsNotifier extends AsyncNotifier<List<UserInterest>> {
  @override
  Future<List<UserInterest>> build() async {
    try {
      return ref.read(interestRepositoryProvider).getUserInterests();
    } catch (_) {
      return [];
    }
  }

  /// Called from onboarding step 3 — saves all selected interests at once
  Future<void> saveFromOnboarding(List<String> interestIds) async {
    try {
      await ref.read(interestRepositoryProvider).addInterests(interestIds);
      state = await AsyncValue.guard(
        () => ref.read(interestRepositoryProvider).getUserInterests(),
      );
    } catch (e) {
      rethrow;
    }
  }

  /// Called from interests screen — full replace
  Future<void> replaceAll(List<String> interestIds) async {
    try {
      await ref.read(interestRepositoryProvider).updateInterests(interestIds);
      state = await AsyncValue.guard(
        () => ref.read(interestRepositoryProvider).getUserInterests(),
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(
      () => ref.read(interestRepositoryProvider).getUserInterests(),
    );
  }
}
