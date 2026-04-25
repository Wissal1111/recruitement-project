import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucid_curator/features/interests/models/interest_model.dart';

import '../../../../features/interests/providers/interest_provider.dart';
import '../../../../features/profile/providers/profile_provider.dart';
import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';
import '../../models/registration_state.dart';

class Step6Done extends ConsumerStatefulWidget {
  final RegistrationState data;
  const Step6Done({super.key, required this.data});

  @override
  ConsumerState<Step6Done> createState() => _Step6DoneState();
}

class _Step6DoneState extends ConsumerState<Step6Done> {
  bool _agreed = true;
  bool _saving = false;
  bool _saved = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Auto-save profile data after a short delay
    WidgetsBinding.instance.addPostFrameCallback((_) => _autoSave());
  }

  Future<void> _autoSave() async {
    setState(() => _saving = true);
    try {
      // 1. Save profile details
      final profileData = <String, dynamic>{};
      if (widget.data.profession?.isNotEmpty == true)
        profileData['profession'] = widget.data.profession;
      if (widget.data.education != null)
        profileData['education'] = widget.data.education;
      if (widget.data.country != null)
        profileData['country'] = widget.data.country;
      if (widget.data.city != null) profileData['city'] = widget.data.city;
      if (widget.data.gender != null)
        profileData['gender'] = widget.data.gender!.toUpperCase();
      if (widget.data.dateOfBirth != null)
        profileData['dateOfBirth'] = widget.data.dateOfBirth!.toIso8601String();

      if (profileData.isNotEmpty) {
        await ref.read(profileProvider.notifier).updateProfile(profileData);
      }

      // 2. Save interests
      if (widget.data.interests.isNotEmpty) {
        // First get all interests to map names to IDs
        final allInterests = await ref.read(allInterestsProvider.future);
        final interestIds = widget.data.interests
            .map((name) {
              final match = allInterests.firstWhere(
                (i) => i.name.toLowerCase() == name.toLowerCase(),
                orElse: () => Interest(interestId: '', name: ''),
              );
              return match.interestId;
            })
            .where((id) => id.isNotEmpty)
            .toList();

        if (interestIds.isNotEmpty) {
          await ref
              .read(userInterestsProvider.notifier)
              .saveFromOnboarding(interestIds);
        }
      }

      setState(() {
        _saving = false;
        _saved = true;
      });
    } catch (e) {
      setState(() {
        _saving = false;
        _error = 'Some details could not be saved. You can update them later.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.data;

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
                            color: AppTheme.primary,
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

                  // Saving indicator
                  if (_saving)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryContainer,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Row(children: [
                        SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: AppTheme.primary)),
                        SizedBox(width: 12),
                        Text('Saving your profile...',
                            style: TextStyle(
                                color: AppTheme.primary,
                                fontWeight: FontWeight.w600)),
                      ]),
                    ),

                  if (_error != null)
                    Container(
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(children: [
                        const Icon(Icons.warning_amber_outlined,
                            color: Color(0xFFF59E0B), size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                            child: Text(_error!,
                                style: const TextStyle(
                                    color: Color(0xFF92400E), fontSize: 13))),
                      ]),
                    ),

                  const SizedBox(height: 8),

                  // Progress card
                  _ReviewCard(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text('PROGRESS',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            letterSpacing: 1,
                                            color: AppTheme.textSecondary,
                                          )),
                                      const SizedBox(height: 4),
                                      const Text('100% Complete',
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
                              ]),
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
                  const SizedBox(height: 12),

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
                            Text('${d.firstname} ${d.lastname}',
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary,
                                )),
                            Text(d.email,
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textSecondary)),
                          ])),
                    ]),
                  ),
                  const SizedBox(height: 12),

                  // Interests card
                  if (d.interests.isNotEmpty)
                    _ReviewCard(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('PREFERENCES',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.2,
                                  color: AppTheme.textSecondary,
                                )),
                            const SizedBox(height: 4),
                            const Text('Selected Interests',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary,
                                )),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: d.interests
                                  .take(6)
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
                  if (d.interests.isNotEmpty) const SizedBox(height: 12),

                  // Professional card
                  if (d.profession?.isNotEmpty == true)
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
                              const Text('PROFESSION',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.2,
                                    color: AppTheme.textSecondary,
                                  )),
                              const SizedBox(height: 2),
                              Text(d.profession!,
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w700,
                                    color: AppTheme.textPrimary,
                                  )),
                            ])),
                      ]),
                    ),
                  if (d.profession?.isNotEmpty == true)
                    const SizedBox(height: 12),

                  // Location card
                  if (d.country != null)
                    _ReviewCard(
                      background: AppTheme.surfaceLow,
                      child: Row(children: [
                        const Icon(Icons.location_on_outlined,
                            color: AppTheme.primary, size: 20),
                        const SizedBox(width: 8),
                        Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('LOCATION',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 1.1,
                                    color: AppTheme.textSecondary,
                                  )),
                              const SizedBox(height: 4),
                              Text(
                                '${d.city ?? ''} ${d.country ?? ''}'.trim(),
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                            ]),
                      ]),
                    ),
                  if (d.country != null) const SizedBox(height: 24),

                  // Terms
                  _TermsRow(
                    agreed: _agreed,
                    onChanged: (v) => setState(() => _agreed = v),
                  ),
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
              onPressed:
                  (_agreed && !_saving) ? () => context.go('/home') : null,
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
}

class _ReviewCard extends StatelessWidget {
  final Widget child;
  final Color? background;
  const _ReviewCard({required this.child, this.background});

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: background ?? AppTheme.surfaceLowest,
          borderRadius: BorderRadius.circular(20),
        ),
        child: child,
      );
}

class _TermsRow extends StatelessWidget {
  final bool agreed;
  final ValueChanged<bool> onChanged;
  const _TermsRow({required this.agreed, required this.onChanged});

  @override
  Widget build(BuildContext context) =>
      Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        GestureDetector(
          onTap: () => onChanged(!agreed),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              color: agreed ? AppTheme.primary : Colors.transparent,
              shape: BoxShape.circle,
              border: Border.all(
                color: agreed ? AppTheme.primary : AppTheme.textTertiary,
                width: 2,
              ),
            ),
            child: agreed
                ? const Icon(Icons.check, color: Colors.white, size: 14)
                : null,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text.rich(
            TextSpan(
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.textSecondary, height: 1.5),
              children: [
                const TextSpan(text: 'I agree to the '),
                TextSpan(
                    text: 'Terms of Service',
                    style: const TextStyle(
                        color: AppTheme.primary, fontWeight: FontWeight.w700)),
                const TextSpan(
                    text:
                        ' and acknowledge that my data will be handled according to the '),
                TextSpan(
                    text: 'Privacy Policy',
                    style: const TextStyle(
                        color: AppTheme.primary, fontWeight: FontWeight.w700)),
                const TextSpan(text: '.'),
              ],
            ),
          ),
        ),
      ]);
}
