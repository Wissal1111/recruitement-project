import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/profile_model.dart';
import '../repository/profile_repository.dart';

final profileProvider = AsyncNotifierProvider<ProfileNotifier, UserProfile?>(
  ProfileNotifier.new,
);

class ProfileNotifier extends AsyncNotifier<UserProfile?> {
  @override
  Future<UserProfile?> build() async {
    try {
      return await ref.read(profileRepositoryProvider).getProfile();
    } catch (_) {
      return null;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(profileRepositoryProvider).getProfile(),
    );
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    try {
      final updated =
          await ref.read(profileRepositoryProvider).updateProfile(data);
      state = AsyncData(updated);
      return true;
    } catch (e) {
      return false;
    }
  }
}
