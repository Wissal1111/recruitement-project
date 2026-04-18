import 'package:flutter/material.dart';

import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';
import '../../models/registration_state.dart';

class Step3Interests extends StatefulWidget {
  final int currentStep;
  final RegistrationState data;
  final void Function(RegistrationState) onNext;
  final VoidCallback onBack;

  const Step3Interests({
    super.key,
    required this.currentStep,
    required this.data,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step3Interests> createState() => _Step3InterestsState();
}

class _Step3InterestsState extends State<Step3Interests> {
  late Set<String> _selected;

  final _categories = [
    {'name': 'Technology', 'icon': Icons.grid_view_rounded},
    {'name': 'Health', 'icon': Icons.favorite_outline},
    {'name': 'Education', 'icon': Icons.school_outlined},
    {'name': 'Business', 'icon': Icons.trending_up},
    {'name': 'Gaming', 'icon': Icons.sports_esports_outlined},
    {'name': 'Science', 'icon': Icons.science_outlined},
    {'name': 'Travel', 'icon': Icons.flight_outlined},
    {'name': 'Food', 'icon': Icons.restaurant_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _selected = Set<String>.from(widget.data.interests);
  }

  void _toggle(String name) {
    setState(() {
      _selected.contains(name) ? _selected.remove(name) : _selected.add(name);
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
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
                              )))),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(
                        color: AppTheme.surfaceHigh, shape: BoxShape.circle),
                    child: const Icon(Icons.person,
                        color: AppTheme.textTertiary, size: 20),
                  ),
                ]),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('STEP 3 OF 6',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                          color: AppTheme.textSecondary,
                        )),
                    Text(
                      '${(3 / 6 * 100).round()}%',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(100),
                  child: const LinearProgressIndicator(
                    value: 3 / 6,
                    minHeight: 4,
                    backgroundColor: AppTheme.surfaceHigh,
                    valueColor:
                        AlwaysStoppedAnimation<Color>(AppTheme.primary),
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Select your interests',
                    style: TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                      letterSpacing: -0.5,
                      height: 1.2,
                    )),
                const SizedBox(height: 8),
                const Text(
                  "Choose categories that pique your curiosity. We'll use this to curate your editorial experience.",
                  style: TextStyle(
                      fontSize: 14, color: AppTheme.textSecondary, height: 1.5),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),

          // Grid — ALL categories same size, same style
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: 1.15,
                ),
                itemCount: _categories.length,
                itemBuilder: (_, i) {
                  final name = _categories[i]['name'] as String;
                  final icon = _categories[i]['icon'] as IconData;
                  final isSelected = _selected.contains(name);

                  return GestureDetector(
                    onTap: () => _toggle(name),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceLowest,
                        borderRadius: BorderRadius.circular(24),
                        border: isSelected
                            ? Border.all(color: AppTheme.primary, width: 2)
                            : null,
                      ),
                      child: Stack(
                        children: [
                          Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  icon,
                                  size: 32,
                                  color: isSelected
                                      ? AppTheme.primary
                                      : AppTheme.textSecondary,
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected
                                        ? AppTheme.primary
                                        : AppTheme.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (isSelected)
                            Positioned(
                              top: 12,
                              right: 12,
                              child: Container(
                                width: 22,
                                height: 22,
                                decoration: const BoxDecoration(
                                  color: AppTheme.primary,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.check,
                                    color: Colors.white, size: 13),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
            child: GradientButton(
              label: 'Continue',
              onPressed: _selected.isNotEmpty
                  ? () => widget.onNext(
                      widget.data.copyWith(interests: _selected.toList()))
                  : null,
              trailingIcon: Icons.arrow_forward,
            ),
          ),
        ],
      ),
    );
  }
}
