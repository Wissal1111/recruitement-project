import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucid_curator/features/profile/repository/profile_repository.dart';

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

  String? _country;
  String? _city;
  String? _education;
  String? _gender;
  DateTime? _dateOfBirth;
  File? _pickedImage;

  bool _loading = false;
  bool _isDataLoaded = false;

  final _countries = ['Algeria', 'France', 'United States', 'Other'];
  final _genders = ['Male', 'Female', 'Other'];

  final Map<String, List<String>> _citiesByCountry = {
    'Algeria': ['Algiers', 'Oran', 'Constantine', 'Sidi Bel Abbes', 'Other'],
    'France': ['Paris', 'Lyon', 'Marseille', 'Other'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Other'],
  };

  final _educationLevels = [
    'High School',
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    'Other',
  ];

  List<String> get _availableCities {
    if (_country == null) return [];
    return _citiesByCountry[_country!] ?? ['Other'];
  }

  String get _dobDisplay {
    if (_dateOfBirth == null) return 'Select Date of Birth';
    final m = _dateOfBirth!.month.toString().padLeft(2, '0');
    final d = _dateOfBirth!.day.toString().padLeft(2, '0');
    return '${_dateOfBirth!.year}-$m-$d';
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final profile = await ref.read(profileProvider.future);

    if (mounted && profile != null) {
      setState(() {
        _bioCtrl.text = profile.bio ?? '';
        _professionCtrl.text = profile.profession ?? '';

        if (_countries.contains(profile.country)) _country = profile.country;

        if (_country != null && _availableCities.contains(profile.city)) {
          _city = profile.city;
        }

        if (_educationLevels.contains(profile.education))
          _education = profile.education;

        if (profile.gender != null) {
          final g = profile.gender!.toLowerCase();
          if (g == 'male')
            _gender = 'Male';
          else if (g == 'female')
            _gender = 'Female';
          else
            _gender = 'Other';
        }

        _dateOfBirth = profile.dateOfBirth;
        _isDataLoaded = true;
      });
    } else {
      if (mounted) setState(() => _isDataLoaded = true);
    }
  }

  @override
  void dispose() {
    _bioCtrl.dispose();
    _professionCtrl.dispose();
    super.dispose();
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

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(1995),
      firstDate: DateTime(now.year - 100),
      lastDate: DateTime(now.year - 13),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppTheme.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  Future<void> _save() async {
    setState(() => _loading = true);

    try {
      String? newPhotoUrl;

      if (_pickedImage != null) {
        try {
          newPhotoUrl = await ref
              .read(profileRepositoryProvider)
              .uploadProfilePicture(_pickedImage!);
        } catch (e) {
          debugPrint("Photo upload skipped: backend route missing.");
        }
      }

      final data = <String, dynamic>{};
      if (_bioCtrl.text.isNotEmpty) data['bio'] = _bioCtrl.text.trim();
      if (_professionCtrl.text.isNotEmpty)
        data['profession'] = _professionCtrl.text.trim();
      if (_country != null) data['country'] = _country;
      if (_city != null) data['city'] = _city;
      if (_education != null) data['education'] = _education;
      if (_gender != null) data['gender'] = _gender!.toUpperCase();
      if (_dateOfBirth != null)
        data['dateOfBirth'] = _dateOfBirth!.toIso8601String();
      if (newPhotoUrl != null) data['profilePictureUrl'] = newPhotoUrl;

      final success =
          await ref.read(profileProvider.notifier).updateProfile(data);

      if (success) {
        await ref.read(profileProvider.notifier).refresh();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Profile updated successfully!'),
                backgroundColor: AppTheme.successColor),
          );
          context.pop();
        }
      } else {
        throw Exception("Failed to save changes on the server.");
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('${e.toString().replaceAll("Exception: ", "")}'),
              backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isDataLoaded) {
      return const Scaffold(
        backgroundColor: AppTheme.surfaceBase,
        body: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }

    final profile = ref.watch(profileProvider).valueOrNull;

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceBase,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              color: AppTheme.textPrimary, size: 20),
          onPressed: () => context.pop(),
        ),
        title: const Text('Edit Profile',
            style: TextStyle(
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 18)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // PROFILE IMAGE
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 110,
                      height: 110,
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
                                    image: NetworkImage(
                                        profile!.profilePictureUrl!),
                                    fit: BoxFit.cover,
                                  )
                                : null),
                      ),
                      child: (_pickedImage == null &&
                              profile?.profilePictureUrl == null)
                          ? const Icon(Icons.person,
                              size: 50, color: AppTheme.primary)
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.camera_alt,
                              color: Colors.white, size: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              _buildLabel('Profession'),
              TextField(
                controller: _professionCtrl,
                decoration: _inputDecoration('e.g. Data Scientist'),
              ),
              const SizedBox(height: 16),

              _buildLabel('Bio'),
              TextField(
                controller: _bioCtrl,
                maxLines: 3,
                decoration:
                    _inputDecoration('Tell us a little about yourself...'),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Country'),
                        DropdownButtonFormField<String>(
                          isExpanded: true, // 🚨 FIXES THE OVERFLOW
                          value: _country,
                          decoration: _inputDecoration('Select'),
                          items: _countries
                              .map((c) => DropdownMenuItem(
                                  value: c,
                                  child:
                                      Text(c, overflow: TextOverflow.ellipsis)))
                              .toList(),
                          onChanged: (val) {
                            setState(() {
                              _country = val;
                              _city = null;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('City'),
                        DropdownButtonFormField<String>(
                          isExpanded: true, // 🚨 FIXES THE OVERFLOW
                          value: _city,
                          decoration: _inputDecoration('Select'),
                          items: _availableCities
                              .map((c) => DropdownMenuItem(
                                  value: c,
                                  child:
                                      Text(c, overflow: TextOverflow.ellipsis)))
                              .toList(),
                          onChanged: _country == null
                              ? null
                              : (val) => setState(() => _city = val),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              _buildLabel('Education Level'),
              DropdownButtonFormField<String>(
                isExpanded: true, // 🚨 FIXES THE OVERFLOW
                value: _education,
                decoration: _inputDecoration('Select your education'),
                items: _educationLevels
                    .map((e) => DropdownMenuItem(
                        value: e,
                        child: Text(e, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _education = val),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Gender'),
                        DropdownButtonFormField<String>(
                          isExpanded: true, // 🚨 FIXES THE OVERFLOW
                          value: _gender,
                          decoration: _inputDecoration('Select'),
                          items: _genders
                              .map((g) => DropdownMenuItem(
                                  value: g,
                                  child:
                                      Text(g, overflow: TextOverflow.ellipsis)))
                              .toList(),
                          onChanged: (val) => setState(() => _gender = val),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Date of Birth'),
                        GestureDetector(
                          onTap: _pickDate,
                          child: Container(
                            height: 54,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border:
                                  Border.all(color: const Color(0xFFE5E7EB)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today,
                                    size: 18, color: AppTheme.textSecondary),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _dobDisplay,
                                    style: TextStyle(
                                      color: _dateOfBirth == null
                                          ? AppTheme.textSecondary
                                          : AppTheme.textPrimary,
                                      fontSize: 14,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    minimumSize: const Size(double.infinity, 54),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: _loading ? null : _save,
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text('Save Changes',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6, left: 2),
      child: Text(text,
          style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppTheme.textSecondary)),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
      enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
      focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppTheme.primary)),
    );
  }
}
