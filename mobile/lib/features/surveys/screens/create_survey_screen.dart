import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../../../shared/widgets/gradient_button.dart';
import '../../payment/repository/payment_repository.dart';

class CreateSurveyScreen extends ConsumerStatefulWidget {
  const CreateSurveyScreen({super.key});

  @override
  ConsumerState<CreateSurveyScreen> createState() => _CreateSurveyScreenState();
}

class _CreateSurveyScreenState extends ConsumerState<CreateSurveyScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _maxParticipantsCtrl = TextEditingController();
  final _rewardPerParticipantCtrl = TextEditingController();
  final _otherProfCtrl = TextEditingController();
  final _otherEduCtrl = TextEditingController();

  bool _isMultiPhase = false;
  RangeValues _ageRange = const RangeValues(18, 45);
  String? _profession = 'Technology & Design';
  String? _education = "Master's Degree";
  String? _country = 'United Kingdom';
  final Set<String> _selectedInterests = {'UX Research'};
  DateTime? _endDate;

  // ✅ Wallet check state
  bool _checkingWallet = false;
  String? _walletError;

  final _professions = [
    'Technology & Design',
    'Healthcare',
    'Education',
    'Finance',
    'Marketing',
    'Other'
  ];
  final _educationLevels = [
    'High School',
    "Bachelor's Degree",
    "Master's Degree",
    'PhD',
    'Other'
  ];
  final _countries = [
    'United Kingdom',
    'United States',
    'France',
    'Germany',
    'Algeria',
    'Other'
  ];
  final _interests = [
    'UX Research',
    'SaaS Growth',
    'AI Ethics',
    'Product Design',
    'Data Science',
    'Marketing'
  ];

  // ✅ Auto-calculated total budget
  double get _rewardPerParticipant =>
      double.tryParse(_rewardPerParticipantCtrl.text.trim()) ?? 0;

  int get _maxParticipants =>
      int.tryParse(_maxParticipantsCtrl.text.trim()) ?? 0;

  double get _totalBudgetPoints => _rewardPerParticipant * _maxParticipants;

  int get _estimatedAudience {
    final ageSpan = _ageRange.end - _ageRange.start;
    return (ageSpan * 500 + _selectedInterests.length * 1200).round();
  }

  bool get _isFormValid {
    return _titleCtrl.text.isNotEmpty &&
        _maxParticipantsCtrl.text.isNotEmpty &&
        _rewardPerParticipantCtrl.text.isNotEmpty &&
        _rewardPerParticipant > 0 &&
        _maxParticipants > 0;
  }

  String _formatEndDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Future<void> _pickEndDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppTheme.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _endDate = picked);
  }

  // ✅ Check wallet before proceeding to builder
  Future<void> _continueToBuilder() async {
    setState(() {
      _checkingWallet = true;
      _walletError = null;
    });

    try {
      // ✅ Check 1: Creator must have at least one card
      final cards = await ref.read(paymentRepositoryProvider).getPaymentCards();

      if (cards.isEmpty) {
        setState(() {
          _walletError =
              'You need to add a payment card first before creating a survey.';
          _checkingWallet = false;
        });
        return;
      }

      // ✅ Check 2: Creator must have enough points in wallet
      final wallet = await ref.read(paymentRepositoryProvider).getWallet();

      final available =
          double.tryParse(wallet['availablePoints']?.toString() ?? '0') ?? 0;

      if (available < _totalBudgetPoints) {
        setState(() {
          _walletError =
              'Insufficient points! You have ${available.toStringAsFixed(0)} pts but need ${_totalBudgetPoints.toStringAsFixed(0)} pts. Buy more points in your wallet first.';
          _checkingWallet = false;
        });
        return;
      }

      // ✅ All good — proceed to builder
      if (mounted) {
        context.push('/surveys/build', extra: {
          'title': _titleCtrl.text,
          'description': _descCtrl.text,
          'totalBudget': _totalBudgetPoints,
          'maxParticipants': _maxParticipants,
          'rewardPerParticipant': _rewardPerParticipant,
          'isMultiPhase': _isMultiPhase,
          'ageMin': _ageRange.start.round(),
          'ageMax': _ageRange.end.round(),
          'country': _country,
          'education': _education == 'Other' ? _otherEduCtrl.text : _education,
          'gender': null,
          'interestIds': [],
          if (_endDate != null) 'endDate': _endDate!.toIso8601String(),
        });
      }
    } catch (e) {
      setState(() {
        _walletError = 'Could not verify wallet. Please try again.';
        _checkingWallet = false;
      });
    } finally {
      if (mounted) setState(() => _checkingWallet = false);
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _maxParticipantsCtrl.dispose();
    _rewardPerParticipantCtrl.dispose();
    _otherProfCtrl.dispose();
    _otherEduCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                        color: AppTheme.surfaceLow,
                        borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.close,
                        size: 18, color: AppTheme.textPrimary),
                  ),
                ),
                const SizedBox(width: 14),
                const Text('Create New Survey',
                    style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary)),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Survey Name ──────────────────────
                    _Label('SURVEY NAME'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _titleCtrl,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                          hintText: 'e.g. Q4 Consumer Trend Analysis'),
                    ),
                    const SizedBox(height: 16),

                    // ── Description ──────────────────────
                    _Label('DESCRIPTION'),
                    const SizedBox(height: 8),
                    TextField(
                        controller: _descCtrl,
                        maxLines: 3,
                        decoration: const InputDecoration(
                            hintText: 'Define the primary objective...')),
                    const SizedBox(height: 16),

                    // ── Max Participants + Reward ─────────
                    Row(children: [
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _Label('MAX PARTICIPANTS'),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _maxParticipantsCtrl,
                                onChanged: (_) => setState(() {
                                  _walletError = null;
                                }),
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                    hintText: 'e.g. 10',
                                    prefixIcon: Icon(Icons.people_outline,
                                        color: AppTheme.textSecondary)),
                              ),
                            ]),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _Label('REWARD / PARTICIPANT (PTS)'),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _rewardPerParticipantCtrl,
                                onChanged: (_) => setState(() {
                                  _walletError = null;
                                }),
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                        decimal: true),
                                decoration: const InputDecoration(
                                    hintText: 'e.g. 150 pts',
                                    prefixIcon: Icon(Icons.star_outline,
                                        color: AppTheme.textSecondary)),
                              ),
                            ]),
                      ),
                    ]),
                    const SizedBox(height: 12),

                    // ✅ Auto-calculated budget display
                    if (_rewardPerParticipant > 0 && _maxParticipants > 0) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(children: [
                          const Icon(Icons.calculate_outlined,
                              color: AppTheme.primary, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('TOTAL BUDGET (AUTO-CALCULATED)',
                                      style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 1,
                                          color: AppTheme.primary)),
                                  const SizedBox(height: 4),
                                  Text(
                                      '${_totalBudgetPoints.toStringAsFixed(0)} pts',
                                      style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w800,
                                          color: AppTheme.primary)),
                                  Text(
                                      '${_rewardPerParticipant.toStringAsFixed(0)} pts × $_maxParticipants participants  ≈  \$${(_totalBudgetPoints / 5).toStringAsFixed(2)}',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: AppTheme.textSecondary)),
                                ]),
                          ),
                        ]),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // ── Expiry Date ──────────────────────
                    _Label('EXPIRY DATE (OPTIONAL)'),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _pickEndDate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.surfaceHigh),
                        ),
                        child: Row(children: [
                          const Icon(Icons.calendar_today,
                              size: 18, color: AppTheme.textSecondary),
                          const SizedBox(width: 12),
                          Text(
                            _endDate != null
                                ? 'Expires ${_formatEndDate(_endDate!)}'
                                : 'Pick expiry date...',
                            style: TextStyle(
                                fontSize: 14,
                                color: _endDate != null
                                    ? AppTheme.textPrimary
                                    : AppTheme.textTertiary),
                          ),
                          const Spacer(),
                          if (_endDate != null)
                            GestureDetector(
                              onTap: () => setState(() => _endDate = null),
                              child: const Icon(Icons.close,
                                  size: 16, color: AppTheme.textTertiary),
                            ),
                        ]),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // ── Single / Multi Phase ─────────────
                    Row(children: [
                      Expanded(
                          child: GestureDetector(
                        onTap: () => setState(() => _isMultiPhase = false),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: 52,
                          decoration: BoxDecoration(
                              gradient: !_isMultiPhase
                                  ? AppTheme.primaryGradient
                                  : null,
                              color: _isMultiPhase ? Colors.white : null,
                              borderRadius: BorderRadius.circular(14)),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.flash_on,
                                    size: 18,
                                    color: !_isMultiPhase
                                        ? Colors.white
                                        : AppTheme.textSecondary),
                                const SizedBox(width: 6),
                                Text('SINGLE PHASE',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.8,
                                        color: !_isMultiPhase
                                            ? Colors.white
                                            : AppTheme.textSecondary)),
                              ]),
                        ),
                      )),
                      const SizedBox(width: 10),
                      Expanded(
                          child: GestureDetector(
                        onTap: () => setState(() => _isMultiPhase = true),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: 52,
                          decoration: BoxDecoration(
                              gradient: _isMultiPhase
                                  ? AppTheme.primaryGradient
                                  : null,
                              color: !_isMultiPhase ? Colors.white : null,
                              borderRadius: BorderRadius.circular(14)),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.layers_outlined,
                                    size: 18,
                                    color: _isMultiPhase
                                        ? Colors.white
                                        : AppTheme.textSecondary),
                                const SizedBox(width: 6),
                                Text('MULTI-PHASE',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.8,
                                        color: _isMultiPhase
                                            ? Colors.white
                                            : AppTheme.textSecondary)),
                              ]),
                        ),
                      )),
                    ]),
                    const SizedBox(height: 24),

                    // ── Target Participants ──────────────
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20)),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              const Icon(Icons.people_outline,
                                  color: AppTheme.primary, size: 22),
                              const SizedBox(width: 10),
                              const Text('Target Participants',
                                  style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.textPrimary)),
                            ]),
                            const SizedBox(height: 20),
                            Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('AGE RANGE',
                                      style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 1,
                                          color: AppTheme.textSecondary)),
                                  Text(
                                      '${_ageRange.start.round()} — ${_ageRange.end.round()}',
                                      style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: AppTheme.primary)),
                                ]),
                            SliderTheme(
                              data: SliderThemeData(
                                  activeTrackColor: AppTheme.primary,
                                  inactiveTrackColor: AppTheme.surfaceHigh,
                                  thumbColor: AppTheme.primary,
                                  overlayColor:
                                      AppTheme.primary.withOpacity(0.1)),
                              child: RangeSlider(
                                  values: _ageRange,
                                  min: 13,
                                  max: 80,
                                  onChanged: (v) =>
                                      setState(() => _ageRange = v)),
                            ),
                            const SizedBox(height: 16),
                            _DropdownField(
                                label: 'PROFESSION',
                                value: _profession,
                                items: _professions,
                                onChanged: (v) =>
                                    setState(() => _profession = v)),
                            if (_profession == 'Other') ...[
                              const SizedBox(height: 8),
                              TextField(
                                  controller: _otherProfCtrl,
                                  decoration: const InputDecoration(
                                      hintText: 'Type custom profession...'))
                            ],
                            const SizedBox(height: 16),
                            _DropdownField(
                                label: 'EDUCATION',
                                value: _education,
                                items: _educationLevels,
                                onChanged: (v) =>
                                    setState(() => _education = v)),
                            if (_education == 'Other') ...[
                              const SizedBox(height: 8),
                              TextField(
                                  controller: _otherEduCtrl,
                                  decoration: const InputDecoration(
                                      hintText: 'Type custom education...'))
                            ],
                            const SizedBox(height: 16),
                            const Text('KEY INTERESTS',
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1,
                                    color: AppTheme.textSecondary)),
                            const SizedBox(height: 8),
                            Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: _interests.map((interest) {
                                  final selected =
                                      _selectedInterests.contains(interest);
                                  return GestureDetector(
                                    onTap: () => setState(() => selected
                                        ? _selectedInterests.remove(interest)
                                        : _selectedInterests.add(interest)),
                                    child: AnimatedContainer(
                                      duration:
                                          const Duration(milliseconds: 150),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 7),
                                      decoration: BoxDecoration(
                                          color: selected
                                              ? AppTheme.primary
                                              : AppTheme.surfaceLow,
                                          borderRadius:
                                              BorderRadius.circular(9999)),
                                      child: Text(interest,
                                          style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: selected
                                                  ? Colors.white
                                                  : AppTheme.textSecondary)),
                                    ),
                                  );
                                }).toList()),
                            const SizedBox(height: 16),
                            _DropdownField(
                                label: 'COUNTRY',
                                value: _country,
                                items: _countries,
                                trailingIcon: Icons.public_outlined,
                                onChanged: (v) => setState(() => _country = v)),
                          ]),
                    ),
                    const SizedBox(height: 16),

                    // ── Audience Estimator ───────────────
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                            colors: [Color(0xFF2D2D6B), Color(0xFF4A4BD7)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('AUDIENCE ESTIMATOR',
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.2,
                                    color: Colors.white70)),
                            const SizedBox(height: 6),
                            Text(
                                '~${_estimatedAudience.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                                style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white)),
                            const SizedBox(height: 4),
                            const Text(
                                'Qualified participants matching your criteria.',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.white70,
                                    height: 1.4)),
                          ]),
                    ),
                    const SizedBox(height: 24),

                    // ✅ Wallet error display
                    if (_walletError != null) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                            color: AppTheme.errorColor.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: AppTheme.errorColor.withOpacity(0.3))),
                        child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.warning_amber_outlined,
                                  color: AppTheme.errorColor, size: 20),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(_walletError!,
                                    style: const TextStyle(
                                        color: AppTheme.errorColor,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500)),
                              ),
                            ]),
                      ),
                      const SizedBox(height: 10),
                      // ✅ Quick link to wallet
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () => context.push('/wallet'),
                          icon: const Icon(
                              Icons.account_balance_wallet_outlined,
                              size: 16),
                          label: const Text('Go to Wallet'),
                          style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.primary,
                              side: const BorderSide(color: AppTheme.primary)),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // ── Continue Button ──────────────────
                    GradientButton(
                      label: _checkingWallet
                          ? 'Checking wallet...'
                          : 'Continue to Questions',
                      onPressed: _isFormValid && !_checkingWallet
                          ? _continueToBuilder
                          : null,
                      trailingIcon: Icons.arrow_forward,
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) => Text(text,
      style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: AppTheme.textSecondary));
}

class _DropdownField extends StatelessWidget {
  final String label;
  final String? value;
  final List<String> items;
  final ValueChanged<String?> onChanged;
  final IconData? trailingIcon;

  const _DropdownField(
      {required this.label,
      required this.value,
      required this.items,
      required this.onChanged,
      this.trailingIcon});

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1,
                  color: AppTheme.textSecondary)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: value,
            isExpanded: true,
            decoration: InputDecoration(
                suffixIcon: trailingIcon != null
                    ? Icon(trailingIcon, color: AppTheme.textTertiary, size: 18)
                    : null),
            items: items
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: onChanged,
          ),
        ],
      );
}
