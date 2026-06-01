import 'package:flutter/material.dart';

import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';
import '../../models/registration_state.dart';

class Step5SocialMedia extends StatefulWidget {
  final int currentStep;
  final RegistrationState data;
  final Future<void> Function(RegistrationState) onNext;
  final VoidCallback onBack;

  const Step5SocialMedia({
    super.key,
    required this.currentStep,
    required this.data,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step5SocialMedia> createState() => _Step5State();
}

class _Step5State extends State<Step5SocialMedia> {
  String? _platform;
  String _frequency = 'Daily';
  String? _hearAbout = 'Social Media Ad';
  bool _loading = false;

  final _platforms = [
    {'name': 'Instagram', 'icon': Icons.camera_alt_outlined},
    {'name': 'TikTok', 'icon': Icons.play_circle_outline},
    {'name': 'X (Twitter)', 'icon': Icons.alternate_email},
    {'name': 'Other', 'icon': Icons.people_outline},
  ];

  final _frequencies = ['Rarely', 'Daily', 'Heavy'];
  final _hearOptions = [
    'Social Media Ad',
    'Friend Referral',
    'Search Engine',
    'News Article',
    'Other'
  ];

  @override
  void initState() {
    super.initState();
    _platform = widget.data.socialPlatform;
    _frequency = widget.data.usageFrequency ?? 'Daily';
  }

  Future<void> _submit() async {
    setState(() => _loading = true);
    await widget.onNext(widget.data.copyWith(
      socialPlatform: _platform,
      usageFrequency: _frequency,
    ));
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) widget.onBack();
      },
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Back button
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
                    const SizedBox(height: 20),

                    // Step indicator pill
                    Row(children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryContainer,
                          borderRadius: BorderRadius.circular(9999),
                        ),
                        child: const Text('STEP 5 OF 6',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1,
                              color: AppTheme.primary,
                            )),
                      ),
                      const SizedBox(width: 10),
                      const Text('83% complete',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppTheme.textSecondary,
                          )),
                    ]),
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(100),
                      child: const LinearProgressIndicator(
                        value: 5 / 6,
                        minHeight: 4,
                        backgroundColor: AppTheme.surfaceHigh,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(AppTheme.primary),
                      ),
                    ),
                    const SizedBox(height: 28),

                    const Text('Help us know you better',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textPrimary,
                          letterSpacing: -0.5,
                          height: 1.2,
                        )),
                    const SizedBox(height: 8),
                    const Text(
                      'Sharing your social preferences helps us curate an experience tailored to your lifestyle.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                          height: 1.5),
                    ),
                    const SizedBox(height: 28),

                    // Platform section
                    const Text('MOST USED PLATFORM',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                          color: AppTheme.textSecondary,
                        )),
                    const SizedBox(height: 14),
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.8,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      children: _platforms.map((p) {
                        final name = p['name'] as String;
                        final icon = p['icon'] as IconData;
                        final isSelected = _platform == name;
                        return GestureDetector(
                          onTap: () => setState(() => _platform = name),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceLowest,
                              borderRadius: BorderRadius.circular(18),
                              border: isSelected
                                  ? Border.all(
                                      color: AppTheme.primary, width: 2)
                                  : null,
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(icon,
                                    color: isSelected
                                        ? AppTheme.primary
                                        : AppTheme.textSecondary,
                                    size: 24),
                                const SizedBox(height: 6),
                                Text(name,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: isSelected
                                          ? AppTheme.primary
                                          : AppTheme.textPrimary,
                                    )),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),

                    // Usage frequency
                    const Text('USAGE FREQUENCY',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                          color: AppTheme.textSecondary,
                        )),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceLow,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: _frequencies.map((f) {
                          final isSelected = _frequency == f;
                          return Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _frequency = f),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                height: 40,
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppTheme.surfaceLowest
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Text(f,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: isSelected
                                            ? FontWeight.w700
                                            : FontWeight.w400,
                                        color: isSelected
                                            ? AppTheme.primary
                                            : AppTheme.textSecondary,
                                      )),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // How did you hear
                    const Text('HOW DID YOU HEAR ABOUT US?',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                          color: AppTheme.textSecondary,
                        )),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                      initialValue: _hearAbout,
                      decoration: const InputDecoration(),
                      items: _hearOptions
                          .map(
                              (e) => DropdownMenuItem(value: e, child: Text(e)))
                          .toList(),
                      onChanged: (v) => setState(() => _hearAbout = v),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),

            // Bottom actions
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
              child: Column(children: [
                Row(children: [
                  GestureDetector(
                    onTap: widget.onBack,
                    child: Container(
                      height: 58,
                      padding: const EdgeInsets.symmetric(horizontal: 28),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceHigh,
                        borderRadius: BorderRadius.circular(9999),
                      ),
                      child: const Center(
                        child: Text('Back',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textSecondary,
                            )),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GradientButton(
                      label: 'Continue',
                      onPressed: _loading ? null : _submit,
                      isLoading: _loading,
                      trailingIcon: _loading ? null : Icons.arrow_forward,
                    ),
                  ),
                ]),
                const SizedBox(height: 14),
                GestureDetector(
                  onTap: () => widget.onNext(widget.data),
                  child: const Text('Skip',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                        fontWeight: FontWeight.w500,
                      )),
                ),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}
