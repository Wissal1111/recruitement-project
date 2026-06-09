import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/theme.dart';
import '../providers/payment_provider.dart';
import '../repository/payment_repository.dart';

class WithdrawSheet extends ConsumerStatefulWidget {
  final double availablePoints;
  final VoidCallback onSuccess;
  const WithdrawSheet({
    super.key,
    required this.availablePoints,
    required this.onSuccess,
  });

  @override
  ConsumerState<WithdrawSheet> createState() => _WithdrawSheetState();
}

class _WithdrawSheetState extends ConsumerState<WithdrawSheet> {
  final _amountCtrl = TextEditingController();
  String? _selectedCardId;
  String? _selectedCardName;
  bool _isLoading = false;
  String? _error;

  static const double _pointsPerDollar = 100.0;

  double get _usdAvailable => widget.availablePoints / _pointsPerDollar;
  double get _enteredUsd => double.tryParse(_amountCtrl.text.trim()) ?? 0;
  double get _pointsNeeded => _enteredUsd * _pointsPerDollar;

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _withdraw() async {
    if (_selectedCardId == null) {
      setState(() => _error = 'Please select a card to receive your money');
      return;
    }
    if (_enteredUsd <= 0) {
      setState(() => _error = 'Enter a valid amount');
      return;
    }
    if (_pointsNeeded > widget.availablePoints) {
      setState(() => _error =
          'Insufficient points. You have ${widget.availablePoints.toStringAsFixed(0)} pts');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // ✅ Withdraw points
      await ref.read(paymentRepositoryProvider).withdrawFunds(_pointsNeeded);

      // ✅ Add money to the selected card balance
      await ref
          .read(paymentRepositoryProvider)
          .addMoneyToCard(_selectedCardId!, _enteredUsd);

      widget.onSuccess();

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                '✅ \$${_enteredUsd.toStringAsFixed(2)} added to $_selectedCardName!'),
            backgroundColor: AppTheme.successColor,
            duration: const Duration(seconds: 4),
          ),
        );
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

    return Padding(
      padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(
                color: AppTheme.surfaceHigh,
                borderRadius: BorderRadius.circular(2))),
        const Text('Withdraw Funds',
            style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary)),
        const SizedBox(height: 8),
        Text(
            'Available: \$${_usdAvailable.toStringAsFixed(2)} (${widget.availablePoints.toStringAsFixed(0)} pts)',
            style:
                const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
        const SizedBox(height: 24),

        // ✅ Select card to receive money
        const Align(
          alignment: Alignment.centerLeft,
          child: Text('RECEIVE MONEY TO CARD',
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                  color: AppTheme.textSecondary)),
        ),
        const SizedBox(height: 10),

        cardsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => const Text('Failed to load cards'),
          data: (cards) {
            if (cards.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                    color: AppTheme.errorColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppTheme.errorColor.withOpacity(0.3))),
                child: const Row(children: [
                  Icon(Icons.credit_card_off_outlined,
                      color: AppTheme.errorColor, size: 20),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                        'You need to add a card first before withdrawing.',
                        style: TextStyle(
                            color: AppTheme.errorColor,
                            fontWeight: FontWeight.w500,
                            fontSize: 13)),
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
                final budget =
                    double.tryParse(c['automaticBudget']?.toString() ?? '0') ??
                        0;
                final isActive = c['isActive'] == true;
                final isSelected = _selectedCardId == id;

                return GestureDetector(
                  onTap: isActive
                      ? () => setState(() {
                            _selectedCardId = id;
                            _selectedCardName = name;
                          })
                      : null,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color:
                          isSelected ? AppTheme.primaryContainer : Colors.white,
                      borderRadius: BorderRadius.circular(12),
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
                              : AppTheme.textTertiary),
                      const SizedBox(width: 12),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            Text(name,
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    color: isSelected
                                        ? AppTheme.primary
                                        : AppTheme.textPrimary)),
                            Text(
                                '•••• $last4  •  Balance: \$${budget.toStringAsFixed(2)}',
                                style: const TextStyle(
                                    fontSize: 12,
                                    color: AppTheme.textSecondary)),
                          ])),
                      if (isSelected)
                        const Icon(Icons.check_circle,
                            color: AppTheme.primary, size: 20),
                    ]),
                  ),
                );
              }).toList(),
            );
          },
        ),
        const SizedBox(height: 20),

        // ✅ Amount input
        TextField(
          controller: _amountCtrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          onChanged: (_) => setState(() => _error = null),
          decoration: InputDecoration(
            labelText: 'Amount to withdraw (\$)',
            hintText: '0.00',
            prefixIcon: const Icon(Icons.attach_money, color: AppTheme.primary),
            errorText: _error,
            filled: true,
            fillColor: AppTheme.surfaceLow,
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none),
          ),
        ),

        // ✅ Quick amounts
        const SizedBox(height: 12),
        Row(
          children: [0.10, 0.25, 0.50, 1.00].map((amount) {
            final canAfford =
                amount * _pointsPerDollar <= widget.availablePoints;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 6),
                child: GestureDetector(
                  onTap: canAfford
                      ? () => setState(() {
                            _amountCtrl.text = amount.toStringAsFixed(2);
                            _error = null;
                          })
                      : null,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                        color: canAfford
                            ? AppTheme.primaryContainer
                            : AppTheme.surfaceLow,
                        borderRadius: BorderRadius.circular(9999)),
                    child: Center(
                      child: Text('\$$amount',
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: canAfford
                                  ? AppTheme.primary
                                  : AppTheme.textTertiary)),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),

        // ✅ Points preview
        if (_enteredUsd > 0) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
                color: AppTheme.primaryContainer,
                borderRadius: BorderRadius.circular(12)),
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Points to deduct:',
                      style: TextStyle(
                          fontSize: 13,
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w500)),
                  Text('${_pointsNeeded.toStringAsFixed(0)} pts',
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primary)),
                ]),
          ),
        ],
        const SizedBox(height: 20),

        // ✅ Confirm button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed:
                (_isLoading || _selectedCardId == null || _enteredUsd <= 0)
                    ? null
                    : _withdraw,
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.successColor,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 52),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14))),
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : Text(
                    _selectedCardId != null && _enteredUsd > 0
                        ? 'Add \$${_enteredUsd.toStringAsFixed(2)} to $_selectedCardName'
                        : 'Select card and enter amount',
                    style: const TextStyle(
                        fontSize: 15, fontWeight: FontWeight.bold)),
          ),
        ),
      ]),
    );
  }
}
