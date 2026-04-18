import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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

  void _nextStep(RegistrationState updated) {
    setState(() {
      _data = updated;
      if (_currentStep < 6) {
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

    try {
      await ref.read(authProvider.notifier).register(
            firstname: _data.firstname,
            lastname: _data.lastname,
            email: _data.email,
            password: _data.password,
          );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: $e'),
          backgroundColor: const Color(0xFFEF4444),
        ));
      }
      return;
    }

    final authState = ref.read(authProvider);
    authState.when(
      data: (user) {
        if (user != null && mounted) {
          setState(() => _currentStep = 6);
          _pageController.animateToPage(
            5,
            duration: const Duration(milliseconds: 350),
            curve: Curves.easeInOut,
          );
        } else if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Registration failed — please check your details'),
              backgroundColor: Color(0xFFEF4444),
            ),
          );
        }
      },
      error: (e, _) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: const Color(0xFFEF4444),
          ));
        }
      },
      loading: () {},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FE),
      body: PageView(
        controller: _pageController,
        physics:
            const NeverScrollableScrollPhysics(), // user can't swipe, only buttons
        // In _RegistrationFlowState — replace the PageView children list:
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
              currentStep: 5, data: _data, onNext: _submit, onBack: _prevStep),
          Step6Done(data: _data), // ← pass data here
        ],
      ),
    );
  }
}
