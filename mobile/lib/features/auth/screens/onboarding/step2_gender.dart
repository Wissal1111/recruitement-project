import 'package:flutter/material.dart';

import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';
import '../../../../shared/widgets/registration_progress.dart';
import '../../models/registration_state.dart';

class Step2Gender extends StatefulWidget {
  final int currentStep;
  final RegistrationState data;
  final void Function(RegistrationState) onNext;
  final VoidCallback onBack;

  const Step2Gender({
    super.key,
    required this.currentStep,
    required this.data,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step2Gender> createState() => _Step2GenderState();
}

class _Step2GenderState extends State<Step2Gender> {
  String? _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.data.gender;
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with back button
            Row(children: [
              GestureDetector(
                onTap: widget.onBack,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceLow,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.arrow_back_ios_new,
                      size: 16, color: AppTheme.textPrimary),
                ),
              ),
              const Expanded(
                  child: Center(
                      child: Text('LucidCurator',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                            letterSpacing: -0.5,
                          )))),
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                    color: AppTheme.surfaceLow,
                    borderRadius: BorderRadius.circular(20)),
                child: const Icon(Icons.person, color: AppTheme.textTertiary),
              ),
            ]),
            const SizedBox(height: 16),
            const RegistrationProgress(currentStep: 2, rightLabel: 'PERSONAL INFO'),
            const SizedBox(height: 32),

            const Text('Tell us about yourself',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textPrimary,
                  letterSpacing: -0.5,
                  height: 1.2,
                )),
            const SizedBox(height: 8),
            const Text(
              'This helps us personalize your curation experience and survey relevance.',
              style: TextStyle(
                  fontSize: 15, color: AppTheme.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 32),

            // Male card
            _GenderCard(
              label: 'Male',
              icon: Icons.male,
              selected: _selected == 'male',
              onTap: () => setState(() => _selected = 'male'),
            ),
            const SizedBox(height: 14),

            // Female card
            _GenderCard(
              label: 'Female',
              icon: Icons.female,
              selected: _selected == 'female',
              onTap: () => setState(() => _selected = 'female'),
            ),
            const SizedBox(height: 32),

            // Why we ask
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.surfaceLow,
                borderRadius: BorderRadius.circular(20),
              ),
              child:
                  Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.info_outline,
                      color: AppTheme.primary, size: 16),
                ),
                const SizedBox(width: 14),
                const Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text('WHY WE ASK',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: AppTheme.primary,
                          )),
                      SizedBox(height: 4),
                      Text(
                        'Demographic insights help us calibrate survey weights accurately.',
                        style: TextStyle(
                            fontSize: 13,
                            color: AppTheme.textSecondary,
                            height: 1.5),
                      ),
                    ])),
              ]),
            ),
            const SizedBox(height: 32),

            GradientButton(
              label: 'Continue',
              onPressed: _selected != null
                  ? () => widget.onNext(widget.data.copyWith(gender: _selected))
                  : null,
              trailingIcon: Icons.arrow_forward,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _GenderCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _GenderCard({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 32),
        decoration: BoxDecoration(
          color: AppTheme.surfaceLowest,
          borderRadius: BorderRadius.circular(24),
          border:
              selected ? Border.all(color: AppTheme.primary, width: 2) : null,
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Column(mainAxisSize: MainAxisSize.min, children: [
              Container(
                width: 68,
                height: 68,
                decoration: BoxDecoration(
                  color: selected ? AppTheme.primary : AppTheme.surfaceLow,
                  shape: BoxShape.circle,
                ),
                child: Icon(icon,
                    color: selected ? Colors.white : AppTheme.primary,
                    size: 32),
              ),
              const SizedBox(height: 14),
              Text(label,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  )),
            ]),
            if (selected)
              Positioned(
                top: 0,
                right: 20,
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: const BoxDecoration(
                      color: AppTheme.primary, shape: BoxShape.circle),
                  child: const Icon(Icons.check, color: Colors.white, size: 16),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
