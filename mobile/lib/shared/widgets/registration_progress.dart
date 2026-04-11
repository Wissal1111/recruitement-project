import 'package:flutter/material.dart';

import '../theme.dart';

class RegistrationProgress extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final String? rightLabel;

  const RegistrationProgress({
    super.key,
    required this.currentStep,
    this.totalSteps = 6,
    this.rightLabel,
  });

  @override
  Widget build(BuildContext context) {
    final pct = currentStep / totalSteps;
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'STEP $currentStep OF $totalSteps',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: AppTheme.primary,
              ),
            ),
            if (rightLabel != null)
              Text(
                rightLabel!,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1,
                  color: AppTheme.textSecondary,
                ),
              ),
          ],
        ),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(100),
          child: LinearProgressIndicator(
            value: pct,
            minHeight: 4,
            backgroundColor: AppTheme.surfaceHigh,
            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
          ),
        ),
      ],
    );
  }
}
