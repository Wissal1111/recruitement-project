import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';
import '../../models/registration_state.dart';

class Step6Done extends ConsumerWidget {
  final RegistrationState data;
  const Step6Done({super.key, required this.data});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    bool agreed = true;

    return SafeArea(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Lucid Curator',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                            letterSpacing: -0.5,
                          )),
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceLow,
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: const Icon(Icons.help_outline,
                            color: AppTheme.textSecondary, size: 18),
                      ),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // FINAL STEP pill
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceHigh,
                        borderRadius: BorderRadius.circular(9999),
                      ),
                      child: const Text('FINAL STEP',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.5,
                            color: AppTheme.textSecondary,
                          )),
                    ),
                  ),
                  const SizedBox(height: 16),

                  const Center(
                      child: Text('Review Details',
                          style: TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary,
                            letterSpacing: -0.5,
                          ))),
                  const SizedBox(height: 8),
                  const Center(
                      child: Text(
                    'Confirm your information to finalize registration.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 15,
                        color: AppTheme.textSecondary,
                        height: 1.5),
                  )),
                  const SizedBox(height: 32),

                  // Progress card — 100%
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceLowest,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('PROGRESS',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          letterSpacing: 1,
                                          color: AppTheme.textSecondary,
                                        )),
                                    SizedBox(height: 4),
                                    Text('100% Complete',
                                        style: TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.w800,
                                          color: AppTheme.primary,
                                        )),
                                  ]),
                              Container(
                                width: 40,
                                height: 40,
                                decoration: const BoxDecoration(
                                  color: AppTheme.primary,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.check,
                                    color: Colors.white, size: 22),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(100),
                            child: const LinearProgressIndicator(
                              value: 1.0,
                              minHeight: 6,
                              backgroundColor: AppTheme.surfaceHigh,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  AppTheme.primary),
                            ),
                          ),
                        ]),
                  ),
                  const SizedBox(height: 16),

                  // Account card
                  _ReviewCard(
                    child: Row(children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFF6B35),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Icons.person,
                            color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            const Text('ACCOUNT',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.2,
                                  color: AppTheme.textSecondary,
                                )),
                            const SizedBox(height: 2),
                            Text(
                              '${data.firstname} ${data.lastname}',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              data.email,
                              style: const TextStyle(
                                  fontSize: 13, color: AppTheme.textSecondary),
                            ),
                          ])),
                      GestureDetector(
                        onTap: () {},
                        child: const Icon(Icons.edit_outlined,
                            color: AppTheme.textSecondary, size: 20),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 12),

                  // Preferences card (interests)
                  _ReviewCard(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [
                            const Expanded(
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                  Text('PREFERENCES',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 1.2,
                                        color: AppTheme.textSecondary,
                                      )),
                                  SizedBox(height: 2),
                                  Text('Editorial Intelligence',
                                      style: TextStyle(
                                        fontSize: 17,
                                        fontWeight: FontWeight.w700,
                                        color: AppTheme.textPrimary,
                                      )),
                                ])),
                            GestureDetector(
                              onTap: () {},
                              child: const Icon(Icons.settings_outlined,
                                  color: AppTheme.textSecondary, size: 20),
                            ),
                          ]),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: data.interests
                                .take(5)
                                .map((interest) => Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: AppTheme.surfaceLow,
                                        borderRadius:
                                            BorderRadius.circular(9999),
                                      ),
                                      child: Text(
                                        interest.toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          letterSpacing: 0.8,
                                          color: AppTheme.textSecondary,
                                        ),
                                      ),
                                    ))
                                .toList(),
                          ),
                        ]),
                  ),
                  const SizedBox(height: 12),

                  // Professional details card
                  _ReviewCard(
                    child: Row(children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.work_outline,
                            color: AppTheme.primary, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            const Text('COMPANY',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.2,
                                  color: AppTheme.textSecondary,
                                )),
                            const SizedBox(height: 2),
                            Text(
                              data.profession?.isNotEmpty == true
                                  ? data.profession!
                                  : 'Not specified',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                          ])),
                      GestureDetector(
                        onTap: () {},
                        child: const Icon(Icons.edit_outlined,
                            color: AppTheme.textSecondary, size: 20),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 12),

                  // Experience level card
                  _ReviewCard(
                    background: AppTheme.surfaceLow,
                    child: Row(children: [
                      const Icon(Icons.star_outline,
                          color: AppTheme.primary, size: 20),
                      const SizedBox(width: 8),
                      Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('EXPERIENCE LEVEL',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 1.1,
                                  color: AppTheme.textSecondary,
                                )),
                            const SizedBox(height: 4),
                            Text(
                              _getExperienceLevel(data.education),
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                          ]),
                    ]),
                  ),
                  const SizedBox(height: 24),

                  // Terms agreement
                  _TermsRow(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // Bottom CTA
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 12),
            child: GradientButton(
              label: 'Complete Registration',
              onPressed: () => context.go('/home'),
              trailingIcon: Icons.arrow_forward,
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(bottom: 16),
            child: Text('STEP 6 OF 6: SUMMARY & VERIFICATION',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.1,
                  color: AppTheme.textTertiary,
                )),
          ),
        ],
      ),
    );
  }

  String _getExperienceLevel(String? education) {
    switch (education) {
      case 'PhD / Doctorate':
        return 'Premium Tier Curator';
      case "Master's Degree":
        return 'Senior Curator';
      case "Bachelor's Degree":
        return 'Standard Curator';
      default:
        return 'Emerging Curator';
    }
  }
}

class _ReviewCard extends StatelessWidget {
  final Widget child;
  final Color? background;
  const _ReviewCard({required this.child, this.background});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: background ?? AppTheme.surfaceLowest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: child,
    );
  }
}

class _TermsRow extends StatefulWidget {
  @override
  State<_TermsRow> createState() => _TermsRowState();
}

class _TermsRowState extends State<_TermsRow> {
  bool _agreed = true;

  @override
  Widget build(BuildContext context) {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      GestureDetector(
        onTap: () => setState(() => _agreed = !_agreed),
        child: Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            color: _agreed ? AppTheme.primary : Colors.transparent,
            shape: BoxShape.circle,
            border: Border.all(
              color: _agreed ? AppTheme.primary : AppTheme.textTertiary,
              width: 2,
            ),
          ),
          child: _agreed
              ? const Icon(Icons.check, color: Colors.white, size: 14)
              : null,
        ),
      ),
      const SizedBox(width: 12),
      const Expanded(
        child: Text.rich(
          TextSpan(
            style: TextStyle(
                fontSize: 13, color: AppTheme.textSecondary, height: 1.5),
            children: [
              TextSpan(text: 'I agree to the '),
              TextSpan(
                text: 'Terms of Service',
                style: TextStyle(
                    color: AppTheme.primary, fontWeight: FontWeight.w700),
              ),
              TextSpan(
                  text:
                      ' and acknowledge that my data will be handled according to the '),
              TextSpan(
                text: 'Privacy Policy',
                style: TextStyle(
                    color: AppTheme.primary, fontWeight: FontWeight.w700),
              ),
              TextSpan(text: '.'),
            ],
          ),
        ),
      ),
    ]);
  }
}
