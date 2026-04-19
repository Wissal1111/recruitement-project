import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/interest_model.dart';
import '../repository/interest_repository.dart';

// All available interests from the backend
final allInterestsProvider = FutureProvider<List<Interest>>((ref) async {
  return ref.read(interestRepositoryProvider).getAllInterests();
});

// User's currently selected interests
final userInterestsProvider =
    AsyncNotifierProvider<UserInterestsNotifier, List<UserInterest>>(
  UserInterestsNotifier.new,
);

class UserInterestsNotifier extends AsyncNotifier<List<UserInterest>> {
  @override
  Future<List<UserInterest>> build() async {
    return ref.read(interestRepositoryProvider).getUserInterests();
  }

  Future<void> addInterest(String interestId) async {
    await ref.read(interestRepositoryProvider).addInterest(interestId);
    // Refresh list
    state = await AsyncValue.guard(
      () => ref.read(interestRepositoryProvider).getUserInterests(),
    );
  }

  Future<void> removeInterest(String userInterestId) async {
    await ref.read(interestRepositoryProvider).removeInterest(userInterestId);
    // Refresh list
    state = await AsyncValue.guard(
      () => ref.read(interestRepositoryProvider).getUserInterests(),
    );
  }
}
