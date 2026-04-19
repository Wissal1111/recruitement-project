import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../providers/profile_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _bioCtrl = TextEditingController();
  final _professionCtrl = TextEditingController();
  final _handleCtrl = TextEditingController();

  String? _country;
  String? _city;
  String? _education;
  String? _gender;
  DateTime? _dateOfBirth;
  File? _pickedImage;
  bool _loading = false;
  bool _initialized = false;

  final _countries = ['Algeria', 'France', 'United States', 'Other'];

  final Map<String, List<String>> _citiesByCountry = {
    'Algeria': ['Algiers', 'Oran', 'Constantine', 'Other'],
    'France': ['Paris', 'Lyon', 'Other'],
    'United States': ['New York', 'Los Angeles', 'Other'],
  };

  List<String> get _availableCities {
    if (_country == null) return [];
    return _citiesByCountry[_country!] ?? ['Other'];
  }

  final _educationLevels = [
    'High School',
    "Bachelor's Degree",
    "Master's Degree",
    'Other',
  ];

  String get _dobDisplay {
    if (_dateOfBirth == null) return 'Not set';
    final m = _dateOfBirth!.month.toString().padLeft(2, '0');
    final d = _dateOfBirth!.day.toString().padLeft(2, '0');
    return '${_dateOfBirth!.year}-$m-$d';
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final profile = ref.read(profileProvider).valueOrNull;
      if (profile != null) {
        _bioCtrl.text = profile.bio ?? '';
        _professionCtrl.text = profile.profession ?? '';
        _country = profile.country;
        _city = profile.city;
        _education = profile.education;
        _gender = profile.gender;
        _dateOfBirth = profile.dateOfBirth;
      }
      _initialized = true;
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      imageQuality: 85,
    );
    if (picked != null) {
      setState(() => _pickedImage = File(picked.path));
    }
  }

  // ✅ UPLOAD PHOTO
  Future<String?> _uploadPhoto() async {
    if (_pickedImage == null) return null;

    try {
      final dio = ref.read(dioProvider);

      final fileName = _pickedImage!.path.split('/').last;

      final formData = FormData.fromMap({
        'profilePicture': await MultipartFile.fromFile(
          _pickedImage!.path,
          filename: fileName,
        ),
      });

      final res = await dio.post('/api/profile/picture', data: formData);

      return res.data['profilePictureUrl'] as String?;
    } catch (e) {
      debugPrint('Photo upload failed: $e');
      return null;
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(1995),
      firstDate: DateTime(now.year - 100),
      lastDate: DateTime(now.year - 13),
    );
    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  // ✅ SAVE PROFILE
  Future<void> _save() async {
    setState(() => _loading = true);

    String? newPhotoUrl;
    if (_pickedImage != null) {
      newPhotoUrl = await _uploadPhoto();
    }

    final data = <String, dynamic>{};

    if (_bioCtrl.text.isNotEmpty) {
      data['bio'] = _bioCtrl.text.trim();
    }
    if (_professionCtrl.text.isNotEmpty) {
      data['profession'] = _professionCtrl.text.trim();
    }

    if (_country != null) data['country'] = _country;
    if (_city != null) data['city'] = _city;
    if (_education != null) data['education'] = _education;
    if (_gender != null) data['gender'] = _gender!.toUpperCase();

    if (_dateOfBirth != null) {
      data['dateOfBirth'] = _dateOfBirth!.toIso8601String();
    }

    if (newPhotoUrl != null) {
      data['profilePictureUrl'] = newPhotoUrl;
    }

    final success =
        await ref.read(profileProvider.notifier).updateProfile(data);

    if (success) {
      await ref.read(profileProvider.notifier).refresh();
    }

    setState(() => _loading = false);

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success
            ? 'Profile updated successfully'
            : 'Failed to update profile'),
        backgroundColor: success ? AppTheme.successColor : AppTheme.errorColor,
      ),
    );

    if (success) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(profileProvider).valueOrNull;

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),

            // ✅ PROFILE IMAGE (UPDATED)
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppTheme.primaryContainer,
                      image: _pickedImage != null
                          ? DecorationImage(
                              image: FileImage(_pickedImage!),
                              fit: BoxFit.cover,
                            )
                          : (profile?.profilePictureUrl != null
                              ? DecorationImage(
                                  image:
                                      NetworkImage(profile!.profilePictureUrl!),
                                  fit: BoxFit.cover,
                                )
                              : null),
                    ),
                    child: (_pickedImage == null &&
                            profile?.profilePictureUrl == null)
                        ? const Icon(Icons.person,
                            size: 52, color: AppTheme.primary)
                        : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: const BoxDecoration(
                          color: AppTheme.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt,
                            color: Colors.white, size: 16),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  TextField(controller: _bioCtrl),
                  TextField(controller: _professionCtrl),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _loading ? null : _save,
                    child: const Text('Save Changes'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
