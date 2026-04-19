import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/theme.dart';
import '../../models/registration_state.dart';
import '../../providers/auth_provider.dart';
import 'step1_create_profile.dart';
import 'step2_gender.dart';
import 'step3_interests.dart';
import 'step4_profile_details.dart';
import 'step5_social_media.dart';
import 'step6_done.dart';

class RegistrationFlow extends ConsumerStatefulWidget {
  const RegistrationFlow({super.key});

  @override
  ConsumerState<RegistrationFlow> createState() => _RegistrationFlowState();
}

class _RegistrationFlowState extends ConsumerState<RegistrationFlow> {
  final PageController _pageController = PageController();
  int _currentStep = 1;
  RegistrationState _data = const RegistrationState();
  bool _registrationDone = false;

  void _nextStep(RegistrationState updated) {
    setState(() {
      _data = updated;
      if (_currentStep < 5) {
        _currentStep++;
        _pageController.nextPage(
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  void _prevStep() {
    if (_currentStep > 1) {
      setState(() {
        _currentStep--;
        _pageController.previousPage(
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeInOut,
        );
      });
    } else {
      context.go('/onboarding');
    }
  }

  Future<void> _submit(RegistrationState finalData) async {
    setState(() => _data = finalData);

    await ref.read(authProvider.notifier).register(
          firstname: _data.firstname,
          lastname: _data.lastname,
          email: _data.email,
          password: _data.password,
        );

    final authState = ref.read(authProvider);
    authState.when(
      data: (user) {
        if (user != null && mounted) {
          setState(() {
            _registrationDone = true;
            _currentStep = 6;
          });
          _pageController.animateToPage(
            5,
            duration: const Duration(milliseconds: 350),
            curve: Curves.easeInOut,
          );
        }
      },
      error: (e, _) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: AppTheme.errorColor,
          ));
        }
      },
      loading: () {},
    );
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitting = ref.watch(authProvider).isLoading;

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      // Loading overlay while registering
      body: Stack(
        children: [
          PageView(
            controller: _pageController,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              Step1CreateProfile(data: _data, onNext: _nextStep),
              Step2Gender(
                  currentStep: 2,
                  data: _data,
                  onNext: _nextStep,
                  onBack: _prevStep),
              Step3Interests(
                  currentStep: 3,
                  data: _data,
                  onNext: _nextStep,
                  onBack: _prevStep),
              Step4ProfileDetails(
                  currentStep: 4,
                  data: _data,
                  onNext: _nextStep,
                  onBack: _prevStep),
              Step5SocialMedia(
                  currentStep: 5,
                  data: _data,
                  onNext: _submit,
                  onBack: _prevStep),
              // Step 6 always reads from _data which is up to date by the time we reach it
              Step6Done(data: _data),
            ],
          ),
          if (isSubmitting)
            Container(
              color: Colors.black.withOpacity(0.35),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 16),
                    Text('Creating your account...',
                        style: TextStyle(color: Colors.white, fontSize: 14)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
