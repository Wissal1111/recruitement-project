import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../providers/payment_provider.dart';
import '../repository/payment_repository.dart';

class BuyPointsScreen extends ConsumerStatefulWidget {
  const BuyPointsScreen({super.key});

  @override
  ConsumerState<BuyPointsScreen> createState() => _BuyPointsScreenState();
}

class _BuyPointsScreenState extends ConsumerState<BuyPointsScreen> {
  final _amountCtrl = TextEditingController();
  String? _selectedCardId;
  bool _isLoading = false;
  String? _error;

  // 1$ = 5 points
  static const double _pointsRate = 5.0;

  double get _enteredAmount => double.tryParse(_amountCtrl.text.trim()) ?? 0;
  double get _pointsToGet => _enteredAmount * _pointsRate;

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _purchase() async {
    if (_selectedCardId == null) {
      setState(() => _error = 'Please select a payment card');
      return;
    }
    if (_enteredAmount <= 0) {
      setState(() => _error = 'Enter a valid amount');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await ref.read(paymentRepositoryProvider).purchasePoints(
            _selectedCardId!,
            _enteredAmount,
          );

      ref.invalidate(walletProvider);
      ref.invalidate(walletStatsProvider);
      ref.invalidate(transactionHistoryProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Points purchased successfully! 🎉'),
            backgroundColor: AppTheme.successColor));
        context.pop();
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cardsAsync = ref.watch(paymentCardsProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new,
                color: AppTheme.textPrimary, size: 20),
            onPressed: () => context.pop()),
        title: const Text('Buy Points',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Rate info ─────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(children: [
                const Icon(Icons.stars, color: Colors.white, size: 40),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Points Exchange Rate',
                            style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                letterSpacing: 0.5)),
                        const SizedBox(height: 4),
                        const Text('\$1 = 5 Points',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Text('Use points to reward survey participants',
                            style: TextStyle(
                                color: Colors.white.withOpacity(0.7),
                                fontSize: 12)),
                      ]),
                ),
              ]),
            ),
            const SizedBox(height: 24),

            // ── Select Card ───────────────────────────────────
            const Text('SELECT PAYMENT CARD',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: AppTheme.textSecondary)),
            const SizedBox(height: 12),

            cardsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (_, __) => const Text('Failed to load cards'),
              data: (cards) {
                if (cards.isEmpty) {
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                        color: AppTheme.errorColor.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: AppTheme.errorColor.withOpacity(0.3))),
                    child: Row(children: [
                      const Icon(Icons.credit_card_off_outlined,
                          color: AppTheme.errorColor, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('No payment cards',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.errorColor)),
                              const SizedBox(height: 2),
                              GestureDetector(
                                onTap: () => context.push('/wallet/cards'),
                                child: const Text('Add a card first',
                                    style: TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.primary,
                                        decoration: TextDecoration.underline)),
                              ),
                            ]),
                      ),
                    ]),
                  );
                }

                return Column(
                  children: cards.map((card) {
                    final c = card as Map<String, dynamic>;
                    final id = c['id']?.toString() ?? '';
                    final name = c['cardName']?.toString() ?? 'Card';
                    final last4 = c['lastFourDigits']?.toString() ?? '0000';
                    final budget = double.tryParse(
                            c['automaticBudget']?.toString() ?? '0') ??
                        0;
                    final isActive = c['isActive'] == true;
                    final isSelected = _selectedCardId == id;

                    return GestureDetector(
                      onTap: isActive
                          ? () => setState(() => _selectedCardId = id)
                          : null,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppTheme.primaryContainer
                              : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                              color: isSelected
                                  ? AppTheme.primary
                                  : AppTheme.surfaceHigh,
                              width: isSelected ? 2 : 1),
                        ),
                        child: Row(children: [
                          Icon(Icons.credit_card,
                              color: isSelected
                                  ? AppTheme.primary
                                  : AppTheme.textTertiary,
                              size: 24),
                          const SizedBox(width: 14),
                          Expanded(
                              child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Text(name,
                                    style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15,
                                        color: isSelected
                                            ? AppTheme.primary
                                            : AppTheme.textPrimary)),
                                Text(
                                    '•••• $last4  •  Budget: \$${budget.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppTheme.textSecondary)),
                              ])),
                          if (!isActive)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                  color: AppTheme.errorColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6)),
                              child: const Text('INACTIVE',
                                  style: TextStyle(
                                      fontSize: 10,
                                      color: AppTheme.errorColor,
                                      fontWeight: FontWeight.w700)),
                            )
                          else if (isSelected)
                            const Icon(Icons.check_circle,
                                color: AppTheme.primary, size: 20),
                        ]),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
            const SizedBox(height: 24),

            // ── Amount ────────────────────────────────────────
            const Text('AMOUNT TO SPEND',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: AppTheme.textSecondary)),
            const SizedBox(height: 12),

            // Quick amounts
            Row(
              children: [10.0, 25.0, 50.0, 100.0]
                  .map((amount) => Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => setState(() {
                              _amountCtrl.text = amount.toStringAsFixed(0);
                              _error = null;
                            }),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                  color: _enteredAmount == amount
                                      ? AppTheme.primary
                                      : AppTheme.surfaceLow,
                                  borderRadius: BorderRadius.circular(10)),
                              child: Center(
                                child: Text('\$$amount',
                                    style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: _enteredAmount == amount
                                            ? Colors.white
                                            : AppTheme.textSecondary)),
                              ),
                            ),
                          ),
                        ),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _amountCtrl,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              onChanged: (_) => setState(() => _error = null),
              decoration: InputDecoration(
                labelText: 'Custom amount (\$)',
                hintText: '0.00',
                prefixIcon:
                    const Icon(Icons.attach_money, color: AppTheme.primary),
                errorText: _error,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none),
              ),
            ),

            // ── Points preview ────────────────────────────────
            if (_enteredAmount > 0) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: AppTheme.primaryContainer,
                    borderRadius: BorderRadius.circular(14)),
                child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('You will receive:',
                          style: TextStyle(
                              fontSize: 14,
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w500)),
                      Text('${_pointsToGet.toStringAsFixed(0)} points',
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primary)),
                    ]),
              ),
            ],
            const SizedBox(height: 32),

            // ── Buy button ────────────────────────────────────
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _purchase,
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 54),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14))),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : Text(
                        _enteredAmount > 0
                            ? 'Buy ${_pointsToGet.toStringAsFixed(0)} Points for \$${_enteredAmount.toStringAsFixed(2)}'
                            : 'Buy Points',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
