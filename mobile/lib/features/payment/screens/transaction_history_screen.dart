import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../providers/payment_provider.dart';

class TransactionHistoryScreen extends ConsumerWidget {
  const TransactionHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(transactionHistoryProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: const Text('Transaction History',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        actions: [
          IconButton(
              icon: const Icon(Icons.refresh, color: AppTheme.primary),
              onPressed: () => ref.invalidate(transactionHistoryProvider)),
        ],
      ),
      body: historyAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load transactions: $e')),
        data: (data) {
          final transactions = data['transactions'] as List? ?? [];
          final total = data['total'] as int? ?? 0;

          if (transactions.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.receipt_long_outlined,
                          size: 64, color: AppTheme.textTertiary),
                      SizedBox(height: 16),
                      Text('No transactions yet.',
                          style: TextStyle(
                              fontSize: 16,
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w600)),
                    ]),
              ),
            );
          }

          return Column(children: [
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(children: [
                const Icon(Icons.receipt_outlined,
                    color: AppTheme.primary, size: 16),
                const SizedBox(width: 8),
                Text('$total transactions total',
                    style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.textSecondary,
                        fontWeight: FontWeight.w500)),
              ]),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: transactions.length,
                itemBuilder: (context, index) {
                  final t = transactions[index] as Map<String, dynamic>;
                  return _FullTransactionTile(t: t);
                },
              ),
            ),
          ]);
        },
      ),
    );
  }
}

class _FullTransactionTile extends StatelessWidget {
  final Map<String, dynamic> t;
  const _FullTransactionTile({required this.t});

  IconData _icon(String type) {
    switch (type) {
      case 'reward':
        return Icons.star;
      case 'allocation':
        return Icons.lock_outline;
      case 'refund':
        return Icons.undo;
      case 'card_purchase':
        return Icons.credit_card;
      case 'commission':
        return Icons.percent;
      default:
        return Icons.swap_horiz;
    }
  }

  Color _color(String type) {
    switch (type) {
      case 'reward':
        return AppTheme.successColor;
      case 'refund':
        return AppTheme.primary;
      case 'commission':
        return AppTheme.errorColor;
      case 'card_purchase':
        return AppTheme.primary;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _typeLabel(String type) {
    switch (type) {
      case 'reward':
        return 'Reward';
      case 'allocation':
        return 'Points Locked';
      case 'refund':
        return 'Points Released';
      case 'card_purchase':
        return 'Points Purchase';
      case 'commission':
        return 'Commission';
      default:
        return type;
    }
  }

  @override
  Widget build(BuildContext context) {
    final type = t['type']?.toString() ?? '';
    final points = double.tryParse(t['pointsValue']?.toString() ?? '0') ?? 0;
    final amount = double.tryParse(t['amount']?.toString() ?? '0') ?? 0;
    final desc = t['description']?.toString() ?? type;
    final status = t['status']?.toString() ?? '';
    final date = t['createdAt'] != null
        ? DateTime.tryParse(t['createdAt'].toString())
        : null;

    final isPositive =
        type == 'reward' || type == 'refund' || type == 'card_purchase';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.surfaceHigh)),
      child: Row(children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
              color: _color(type).withOpacity(0.1), shape: BoxShape.circle),
          child: Icon(_icon(type), color: _color(type), size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(_typeLabel(type),
              style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary)),
          const SizedBox(height: 2),
          Text(desc,
              style:
                  const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
              maxLines: 2,
              overflow: TextOverflow.ellipsis),
          if (date != null) ...[
            const SizedBox(height: 2),
            Text(
                '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}',
                style: const TextStyle(
                    fontSize: 11, color: AppTheme.textTertiary)),
          ],
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text('${isPositive ? '+' : '-'}${points.toStringAsFixed(0)} pts',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isPositive
                      ? AppTheme.successColor
                      : AppTheme.errorColor)),
          if (amount > 0)
            Text('\$${amount.toStringAsFixed(2)}',
                style: const TextStyle(
                    fontSize: 11, color: AppTheme.textTertiary)),
          Container(
            margin: const EdgeInsets.only(top: 4),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
                color: status == 'completed'
                    ? AppTheme.successColor.withOpacity(0.1)
                    : AppTheme.textTertiary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(4)),
            child: Text(status.toUpperCase(),
                style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: status == 'completed'
                        ? AppTheme.successColor
                        : AppTheme.textTertiary)),
          ),
        ]),
      ]),
    );
  }
}
