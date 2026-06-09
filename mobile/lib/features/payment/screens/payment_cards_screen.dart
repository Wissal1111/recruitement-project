import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../providers/payment_provider.dart';
import '../repository/payment_repository.dart';

// ✅ Changed to ConsumerStatefulWidget to force refresh on open
class PaymentCardsScreen extends ConsumerStatefulWidget {
  const PaymentCardsScreen({super.key});

  @override
  ConsumerState<PaymentCardsScreen> createState() => _PaymentCardsScreenState();
}

class _PaymentCardsScreenState extends ConsumerState<PaymentCardsScreen> {
  @override
  void initState() {
    super.initState();
    // ✅ Force fresh data every time screen opens
    Future.microtask(() => ref.invalidate(paymentCardsProvider));
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
        title: const Text('Payment Cards',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        actions: [
          IconButton(
              icon: const Icon(Icons.refresh, color: AppTheme.primary),
              onPressed: () => ref.invalidate(paymentCardsProvider)),
          IconButton(
              icon: const Icon(Icons.add, color: AppTheme.primary),
              onPressed: () => _showAddCard(context)),
        ],
      ),
      body: cardsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const Center(child: Text('Failed to load cards')),
        data: (cards) {
          if (cards.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.credit_card_off_outlined,
                          size: 64, color: AppTheme.textTertiary),
                      const SizedBox(height: 16),
                      const Text('No payment cards yet.',
                          style: TextStyle(
                              fontSize: 16,
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      const Text(
                          'Add a card to purchase points or withdraw funds.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontSize: 13, color: AppTheme.textTertiary)),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => _showAddCard(context),
                        icon: const Icon(Icons.add, color: Colors.white),
                        label: const Text('Add Card',
                            style: TextStyle(color: Colors.white)),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12))),
                      ),
                    ]),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: cards.length,
            itemBuilder: (context, index) {
              final card = cards[index] as Map<String, dynamic>;
              return _CardTile(
                card: card,
                onDelete: () async {
                  final id = card['id']?.toString() ?? '';
                  await ref
                      .read(paymentRepositoryProvider)
                      .deletePaymentCard(id);
                  ref.invalidate(paymentCardsProvider);
                },
              );
            },
          );
        },
      ),
    );
  }

  void _showAddCard(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) =>
          _AddCardSheet(onAdded: () => ref.invalidate(paymentCardsProvider)),
    );
  }
}

class _CardTile extends StatelessWidget {
  final Map<String, dynamic> card;
  final VoidCallback onDelete;
  const _CardTile({required this.card, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final name = card['cardName']?.toString() ?? 'Card';
    final last4 = card['lastFourDigits']?.toString() ?? '0000';
    final budget =
        double.tryParse(card['automaticBudget']?.toString() ?? '0') ?? 0;
    final isActive = card['isActive'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
            colors: isActive
                ? [const Color(0xFF2D2D6B), const Color(0xFF4A4BD7)]
                : [const Color(0xFF9CA3AF), const Color(0xFF6B7280)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.credit_card, color: Colors.white, size: 28),
          const Spacer(),
          if (!isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(6)),
              child: const Text('INACTIVE',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w700)),
            ),
          IconButton(
              icon: const Icon(Icons.delete_outline,
                  color: Colors.white70, size: 20),
              onPressed: onDelete),
        ]),
        const SizedBox(height: 20),
        Text('•••• •••• •••• $last4',
            style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                letterSpacing: 2,
                fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                const Text('CARD NAME',
                    style: TextStyle(
                        color: Colors.white54, fontSize: 10, letterSpacing: 1)),
                const SizedBox(height: 2),
                Text(name,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
              ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            const Text('BUDGET',
                style: TextStyle(
                    color: Colors.white54, fontSize: 10, letterSpacing: 1)),
            const SizedBox(height: 2),
            Text('\$${budget.toStringAsFixed(2)}',
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600)),
          ]),
        ]),
      ]),
    );
  }
}

class _AddCardSheet extends ConsumerStatefulWidget {
  final VoidCallback onAdded;
  const _AddCardSheet({required this.onAdded});

  @override
  ConsumerState<_AddCardSheet> createState() => _AddCardSheetState();
}

class _AddCardSheetState extends ConsumerState<_AddCardSheet> {
  final _nameCtrl = TextEditingController();
  final _last4Ctrl = TextEditingController();
  final _budgetCtrl = TextEditingController();
  String _cardType = 'custom';
  bool _isLoading = false;

  final _cardTypes = ['paypal', 'payoneer', 'stripe', 'custom'];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _last4Ctrl.dispose();
    _budgetCtrl.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    if (_nameCtrl.text.isEmpty) return;
    setState(() => _isLoading = true);

    try {
      await ref.read(paymentRepositoryProvider).addPaymentCard({
        'cardName': _nameCtrl.text.trim(),
        'cardType': _cardType,
        'lastFourDigits':
            _last4Ctrl.text.trim().isEmpty ? '0000' : _last4Ctrl.text.trim(),
        'automaticBudget': double.tryParse(_budgetCtrl.text.trim()) ?? 1000.0,
      });

      widget.onAdded();
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Card added successfully!'),
            backgroundColor: AppTheme.successColor));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Failed: $e'), backgroundColor: AppTheme.errorColor));
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
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
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
                color: AppTheme.surfaceHigh,
                borderRadius: BorderRadius.circular(2))),
        const Text('Add Payment Card',
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary)),
        const SizedBox(height: 20),
        TextField(
          controller: _nameCtrl,
          decoration: const InputDecoration(
            labelText: 'Card Name',
            hintText: 'e.g. My Visa Card',
            prefixIcon: Icon(Icons.label_outline),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _last4Ctrl,
          keyboardType: TextInputType.number,
          maxLength: 4,
          decoration: const InputDecoration(
            labelText: 'Last 4 digits (optional)',
            hintText: '1234',
            prefixIcon: Icon(Icons.credit_card),
            counterText: '',
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _budgetCtrl,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(
            labelText: 'Budget (\$)',
            hintText: '1000.00',
            prefixIcon: Icon(Icons.account_balance_wallet_outlined),
          ),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _cardType,
          decoration: const InputDecoration(
              labelText: 'Card Type', prefixIcon: Icon(Icons.payment)),
          items: _cardTypes
              .map((t) => DropdownMenuItem(
                  value: t, child: Text(t[0].toUpperCase() + t.substring(1))))
              .toList(),
          onChanged: (v) => setState(() => _cardType = v!),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _add,
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
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
                : const Text('Add Card',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ]),
    );
  }
}
