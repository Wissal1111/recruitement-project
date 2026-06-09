import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucid_curator/features/payment/screens/withdraw_sheet.dart';

import '../../../shared/theme.dart';
import '../providers/payment_provider.dart';

class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  // ✅ Safe helper to extract double from any map
  double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    return double.tryParse(value.toString()) ?? 0.0;
  }

  // ✅ Safe helper to convert any map to Map<String, dynamic>
  Map<String, dynamic> _safeMap(dynamic value) {
    if (value == null) return {};
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((k, v) => MapEntry(k.toString(), v));
    }
    return {};
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final walletAsync = ref.watch(walletStatsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: const Text('My Wallet',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: AppTheme.primary),
            onPressed: () => context.push('/wallet/transactions'),
          ),
        ],
      ),
      body: walletAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child:
                Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.account_balance_wallet_outlined,
                  size: 64, color: AppTheme.textTertiary),
              const SizedBox(height: 16),
              const Text('Could not load wallet',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 8),
              Text(e.toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 12, color: AppTheme.textSecondary)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(walletStatsProvider),
                icon: const Icon(Icons.refresh, color: Colors.white, size: 16),
                label:
                    const Text('Retry', style: TextStyle(color: Colors.white)),
                style:
                    ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
              ),
            ]),
          ),
        ),
        data: (stats) {
          // ✅ Safe extraction — no casting
          final wallet = _safeMap(stats['wallet']);
          final transactions = stats['recentTransactions'] as List? ?? [];

          final available = _parseDouble(wallet['availablePoints']);
          final total = _parseDouble(wallet['totalPoints']);
          final locked = _parseDouble(wallet['lockedPoints']);

          // 100 points = $1
          final availableUsd = available / 100;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Balance Card ──────────────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: AppTheme.ambientShadow,
                  ),
                  child: Column(children: [
                    const Text('Available Balance',
                        style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                            letterSpacing: 0.5)),
                    const SizedBox(height: 8),
                    Text('\$${availableUsd.toStringAsFixed(2)}',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 42,
                            fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text('${available.toStringAsFixed(0)} points',
                        style: const TextStyle(
                            color: Colors.white60, fontSize: 14)),
                    const SizedBox(height: 24),
                    Row(children: [
                      Expanded(
                        child: _BalanceStat(
                          label: 'Total Earned',
                          value: '${total.toStringAsFixed(0)} pts',
                        ),
                      ),
                      Container(width: 1, height: 40, color: Colors.white24),
                      Expanded(
                        child: _BalanceStat(
                          label: 'Locked',
                          value: '${locked.toStringAsFixed(0)} pts',
                        ),
                      ),
                    ]),
                  ]),
                ),
                const SizedBox(height: 24),

                // ── Conversion info ───────────────────────────
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                      color: AppTheme.primaryContainer,
                      borderRadius: BorderRadius.circular(14)),
                  child: const Row(children: [
                    Icon(Icons.info_outline, color: AppTheme.primary, size: 18),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                          '100 points = \$1.00  •  15% commission applied on rewards',
                          style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w500)),
                    ),
                  ]),
                ),
                const SizedBox(height: 24),

                // ── Actions ───────────────────────────────────
                Row(children: [
                  Expanded(
                    child: _ActionBtn(
                      icon: Icons.add_circle_outline,
                      label: 'Buy Points',
                      color: AppTheme.primary,
                      onTap: () => context.push('/wallet/buy-points'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ActionBtn(
                      icon: Icons.credit_card,
                      label: 'My Cards',
                      color: const Color(0xFF6B7280),
                      onTap: () => context.push('/wallet/cards'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ActionBtn(
                      icon: Icons.download_outlined,
                      label: 'Withdraw',
                      color: AppTheme.successColor,
                      onTap: () => _showWithdrawSheet(context, ref, available),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ActionBtn(
                      icon: Icons.receipt_long_outlined,
                      label: 'History',
                      color: const Color(0xFF6B7280),
                      onTap: () => context.push('/wallet/transactions'),
                    ),
                  ),
                ]),
                const SizedBox(height: 28),

                // ── Recent Transactions ───────────────────────
                const Text('Recent Transactions',
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary)),
                const SizedBox(height: 12),

                if (transactions.isEmpty)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: Column(children: [
                        Icon(Icons.receipt_long_outlined,
                            size: 48, color: AppTheme.textTertiary),
                        SizedBox(height: 12),
                        Text('No transactions yet.',
                            style: TextStyle(
                                color: AppTheme.textSecondary, fontSize: 15)),
                      ]),
                    ),
                  )
                else
                  ...transactions.map((t) => _TransactionTile(t: t)),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showWithdrawSheet(
      BuildContext context, WidgetRef ref, double available) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => WithdrawSheet(
          availablePoints: available,
          onSuccess: () => ref.invalidate(walletStatsProvider)),
    );
  }
}

class _BalanceStat extends StatelessWidget {
  final String label, value;
  const _BalanceStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11)),
      const SizedBox(height: 4),
      Text(value,
          style: const TextStyle(
              color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
    ]);
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionBtn(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(14)),
        child: Column(children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 6),
          Text(label,
              style: TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w600, color: color)),
        ]),
      ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  final dynamic t;
  const _TransactionTile({required this.t});

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
      default:
        return AppTheme.textSecondary;
    }
  }

  // ✅ Safe map access
  Map<String, dynamic> _safeMap(dynamic value) {
    if (value == null) return {};
    if (value is Map<String, dynamic>) return value;
    if (value is Map) {
      return value.map((k, v) => MapEntry(k.toString(), v));
    }
    return {};
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Use safe map access
    final data = _safeMap(t);
    final type = data['type']?.toString() ?? '';
    final points = double.tryParse(data['pointsValue']?.toString() ?? '0') ?? 0;
    final desc = data['description']?.toString() ?? type;
    final date = data['createdAt'] != null
        ? DateTime.tryParse(data['createdAt'].toString())
        : null;
    final dateStr =
        date != null ? '${date.day}/${date.month}/${date.year}' : '';

    final isPositive =
        type == 'reward' || type == 'refund' || type == 'card_purchase';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.surfaceHigh)),
      child: Row(children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
              color: _color(type).withOpacity(0.1), shape: BoxShape.circle),
          child: Icon(_icon(type), color: _color(type), size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(desc,
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
          if (dateStr.isNotEmpty)
            Text(dateStr,
                style: const TextStyle(
                    fontSize: 11, color: AppTheme.textTertiary)),
        ])),
        Text('${isPositive ? '+' : '-'}${points.toStringAsFixed(0)} pts',
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color:
                    isPositive ? AppTheme.successColor : AppTheme.errorColor)),
      ]),
    );
  }
}
