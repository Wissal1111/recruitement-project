import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/secure_storage.dart';
import '../repository/payment_repository.dart';

// ✅ Safe deep convert — no type cast errors
Map<String, dynamic> _deepConvert(dynamic data) {
  if (data is Map<String, dynamic>) return data;
  if (data is Map) {
    return data.map((k, v) {
      if (v is Map) return MapEntry(k.toString(), _deepConvert(v));
      if (v is List) return MapEntry(k.toString(), _deepConvertList(v));
      return MapEntry(k.toString(), v);
    });
  }
  return {};
}

List _deepConvertList(List data) {
  return data.map((e) {
    if (e is Map) return _deepConvert(e);
    return e;
  }).toList();
}

// ✅ Tracks current logged-in user for payment
// When this changes → all payment providers auto-refresh
final currentPaymentUserProvider = FutureProvider<String?>((ref) async {
  final storage = ref.watch(secureStorageProvider);
  return storage.getUserId();
});

final walletProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final userId = await ref.watch(currentPaymentUserProvider.future);
  if (userId == null || userId.isEmpty) {
    return {'totalPoints': 0, 'availablePoints': 0, 'lockedPoints': 0};
  }
  try {
    final raw = await ref.watch(paymentRepositoryProvider).getWallet();
    return _deepConvert(raw);
  } catch (_) {
    return {'totalPoints': 0, 'availablePoints': 0, 'lockedPoints': 0};
  }
});

final walletStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final userId = await ref.watch(currentPaymentUserProvider.future);
  if (userId == null || userId.isEmpty) {
    return {'wallet': {}, 'recentTransactions': []};
  }
  try {
    final raw = await ref.watch(paymentRepositoryProvider).getWalletStats();
    return _deepConvert(raw);
  } catch (_) {
    return {'wallet': {}, 'recentTransactions': []};
  }
});

final paymentCardsProvider = FutureProvider<List<dynamic>>((ref) async {
  final userId = await ref.watch(currentPaymentUserProvider.future);
  if (userId == null || userId.isEmpty) return [];
  try {
    return await ref.watch(paymentRepositoryProvider).getPaymentCards();
  } catch (_) {
    return [];
  }
});

final transactionHistoryProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final userId = await ref.watch(currentPaymentUserProvider.future);
  if (userId == null || userId.isEmpty) {
    return {'transactions': [], 'total': 0};
  }
  try {
    final raw = await ref
        .watch(paymentRepositoryProvider)
        .getTransactionHistory(limit: 20);
    return _deepConvert(raw);
  } catch (_) {
    return {'transactions': [], 'total': 0};
  }
});
