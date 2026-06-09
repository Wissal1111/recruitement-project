import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api_client.dart';

final paymentRepositoryProvider =
    Provider((ref) => PaymentRepository(ref.watch(dioProvider)));

class PaymentRepository {
  final Dio _dio;
  PaymentRepository(this._dio);

  // ── Wallet ──────────────────────────────────────────────
  Future<Map<String, dynamic>> getWallet() async {
    final res = await _dio.get('/api/wallet/me');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getWalletStats() async {
    final res = await _dio.get('/api/wallet/me/stats');
    return res.data as Map<String, dynamic>;
  }

  // ── Payment Cards ────────────────────────────────────────
  Future<List<dynamic>> getPaymentCards() async {
    try {
      final res = await _dio.get('/api/payment-cards/user/');
      if (res.data is List) return res.data as List;
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>> addPaymentCard(Map<String, dynamic> data) async {
    final res = await _dio.post('/api/payment-cards', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<void> deletePaymentCard(String cardId) async {
    await _dio.delete('/api/payment-cards/$cardId/user');
  }

  // ── Transactions ─────────────────────────────────────────
  Future<Map<String, dynamic>> getTransactionHistory({
    String? type,
    int limit = 20,
    int offset = 0,
  }) async {
    final res = await _dio.get('/api/transactions/history', queryParameters: {
      if (type != null) 'type': type,
      'limit': limit,
      'offset': offset,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getTransactionSummary() async {
    try {
      final res = await _dio.get('/api/transactions/summary');
      if (res.data is List) return res.data as List;
      return [];
    } catch (_) {
      return [];
    }
  }

  // ── Points ───────────────────────────────────────────────
  Future<Map<String, dynamic>> purchasePoints(
      String cardId, double amount) async {
    final res = await _dio.post('/api/transactions/purchase', data: {
      'paymentCardId': cardId,
      'amount': amount,
    });
    return res.data as Map<String, dynamic>;
  }

  // ── Withdraw (convert points → money) ────────────────────
  // ── Withdraw (convert points → money) ────────────────────
  Future<Map<String, dynamic>> withdrawFunds(double points) async {
    try {
      // ✅ Use a dedicated withdraw endpoint or record as a transaction
      // Points are "available" not "locked" for participants
      // We just record the withdrawal transaction
      final res = await _dio.post('/api/transactions/withdraw', data: {
        'points': points,
      });
      if (res.data is Map<String, dynamic>) return res.data;
      return {'success': true};
    } on DioException catch (e) {
      throw Exception(e.response?.data?['error'] ??
          e.response?.data?['message'] ??
          'Withdrawal failed');
    }
  }

  // ✅ Add money to card balance after withdrawal
  Future<void> addMoneyToCard(String cardId, double amount) async {
    try {
      await _dio.put('/api/payment-cards/$cardId/add-balance', data: {
        'amount': amount,
      });
    } catch (e) {
      // Non-fatal — money was already deducted from wallet
      debugPrint('Add money to card failed (non-fatal): $e');
    }
  }
}
