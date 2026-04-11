import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../shared/theme.dart';
import '../../../shared/widgets/gradient_button.dart';
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

  final _countries = [
    'Algeria',
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'China',
    'Colombia',
    'Egypt',
    'France',
    'Germany',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Japan',
    'Jordan',
    'Kenya',
    'Lebanon',
    'Malaysia',
    'Mexico',
    'Morocco',
    'Netherlands',
    'New Zealand',
    'Nigeria',
    'Norway',
    'Pakistan',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Saudi Arabia',
    'South Africa',
    'South Korea',
    'Spain',
    'Sweden',
    'Switzerland',
    'Thailand',
    'Tunisia',
    'Turkey',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Venezuela',
    'Vietnam',
    'Other',
  ];

  final Map<String, List<String>> _citiesByCountry = {
    'Algeria': [
      'Algiers',
      'Oran',
      'Constantine',
      'Annaba',
      'Blida',
      'Batna',
      'Tlemcen',
      'Sétif',
      'Other'
    ],
    'United States': [
      'New York City',
      'Los Angeles',
      'Chicago',
      'Houston',
      'San Francisco',
      'Other'
    ],
    'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Other'],
    'United Kingdom': [
      'London',
      'Manchester',
      'Birmingham',
      'Leeds',
      'Glasgow',
      'Other'
    ],
    'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Other'],
    'Canada': [
      'Toronto',
      'Montreal',
      'Vancouver',
      'Calgary',
      'Ottawa',
      'Other'
    ],
    'Morocco': [
      'Casablanca',
      'Rabat',
      'Marrakech',
      'Fès',
      'Tangier',
      'Agadir',
      'Other'
    ],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Other'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Other'],
    'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Other'],
    'Tunisia': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Other'],
    'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Other'],
    'Jordan': ['Amman', 'Zarqa', 'Irbid', 'Other'],
    'Iraq': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Other'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Other'],
    'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Other'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Other'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Other'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Other'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Other'],
    'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Other'],
    'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Other'],
    'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Other'],
    'South Africa': [
      'Johannesburg',
      'Cape Town',
      'Durban',
      'Pretoria',
      'Other'
    ],
    'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Other'],
    'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Other'],
    'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Other'],
    'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Other'],
    'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Other'],
  };

  List<String> get _availableCities {
    if (_country == null) return [];
    return _citiesByCountry[_country!] ?? ['Other'];
  }

  final _educationLevels = [
    'High School',
    'Associate Degree',
    "Bachelor's Degree",
    "Master's Degree",
    'PhD / Doctorate',
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
    if (picked != null) setState(() => _pickedImage = File(picked.path));
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(1995, 1, 1),
      firstDate: DateTime(now.year - 100),
      lastDate: DateTime(now.year - 13),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppTheme.primary,
            onPrimary: Colors.white,
            surface: AppTheme.surfaceLowest,
            onSurface: AppTheme.textPrimary,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _dateOfBirth = picked);
  }

  Future<void> _save() async {
    setState(() => _loading = true);

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

    final success =
        await ref.read(profileProvider.notifier).updateProfile(data);

    setState(() => _loading = false);

    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: AppTheme.successColor,
        ),
      );
      context.pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to update profile'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(profileProvider).valueOrNull;

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            // App bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(children: [
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceLow,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.arrow_back_ios_new, size: 16),
                  ),
                ),
                const Expanded(
                    child: Center(
                        child: Text('Edit Profile',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary,
                            )))),
                const SizedBox(width: 40),
              ]),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Personalize your editorial identity.',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 14,
                        )),
                    const SizedBox(height: 28),

                    // Profile photo
                    Center(
                      child: Column(children: [
                        Stack(children: [
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
                                  : null,
                            ),
                            child: _pickedImage == null
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
                        ]),
                        const SizedBox(height: 10),
                        const Text('Profile Photo',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                            )),
                        const SizedBox(height: 4),
                        const Text('Square JPG or PNG, at least 400×400px.',
                            style: TextStyle(
                                color: AppTheme.textSecondary, fontSize: 12)),
                        const SizedBox(height: 12),
                        Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              OutlinedButton(
                                onPressed: _pickImage,
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppTheme.primary,
                                  side:
                                      const BorderSide(color: AppTheme.primary),
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(9999)),
                                ),
                                child: const Text('Upload New'),
                              ),
                              if (_pickedImage != null) ...[
                                const SizedBox(width: 12),
                                TextButton(
                                  onPressed: () =>
                                      setState(() => _pickedImage = null),
                                  child: const Text('Remove',
                                      style: TextStyle(
                                          color: AppTheme.errorColor)),
                                ),
                              ],
                            ]),
                      ]),
                    ),
                    const SizedBox(height: 28),

                    // Bio
                    _Label('SHORT BIOGRAPHY'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _bioCtrl,
                      maxLines: 4,
                      maxLength: 240,
                      decoration:
                          const InputDecoration(hintText: 'Tell your story...'),
                    ),
                    const SizedBox(height: 20),

                    // Profession
                    _Label('PROFESSION'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _professionCtrl,
                      decoration: const InputDecoration(
                          hintText: 'e.g. Senior Designer'),
                    ),
                    const SizedBox(height: 20),

                    // Gender
                    _Label('GENDER'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _gender?.toLowerCase() == 'male'
                          ? 'male'
                          : _gender?.toLowerCase() == 'female'
                              ? 'female'
                              : null,
                      hint: const Text('Select gender',
                          style: TextStyle(color: AppTheme.textTertiary)),
                      decoration: const InputDecoration(),
                      isExpanded: true,
                      items: const [
                        DropdownMenuItem(value: 'male', child: Text('Male')),
                        DropdownMenuItem(
                            value: 'female', child: Text('Female')),
                      ],
                      onChanged: (v) => setState(() => _gender = v),
                    ),
                    const SizedBox(height: 20),

                    // Date of birth
                    _Label('DATE OF BIRTH'),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _pickDate,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 16),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceLow,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(children: [
                          Expanded(
                              child: Text(_dobDisplay,
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: _dateOfBirth == null
                                        ? AppTheme.textTertiary
                                        : AppTheme.textPrimary,
                                  ))),
                          const Icon(Icons.calendar_month_outlined,
                              color: AppTheme.textTertiary, size: 20),
                        ]),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Education
                    _Label('EDUCATION'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _educationLevels.contains(_education)
                          ? _education
                          : null,
                      hint: const Text('Select level',
                          style: TextStyle(color: AppTheme.textTertiary)),
                      decoration: const InputDecoration(),
                      isExpanded: true,
                      items: _educationLevels
                          .map(
                              (e) => DropdownMenuItem(value: e, child: Text(e)))
                          .toList(),
                      onChanged: (v) => setState(() => _education = v),
                    ),
                    const SizedBox(height: 20),

                    // Country
                    _Label('COUNTRY'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _countries.contains(_country) ? _country : null,
                      hint: const Text('Select country',
                          style: TextStyle(color: AppTheme.textTertiary)),
                      decoration: const InputDecoration(),
                      isExpanded: true,
                      items: _countries
                          .map(
                              (c) => DropdownMenuItem(value: c, child: Text(c)))
                          .toList(),
                      onChanged: (v) => setState(() {
                        _country = v;
                        _city = null;
                      }),
                    ),
                    const SizedBox(height: 20),

                    // City
                    _Label('CITY'),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _availableCities.contains(_city) ? _city : null,
                      hint: Text(
                        _country == null
                            ? 'Select country first'
                            : 'Select city',
                        style: const TextStyle(color: AppTheme.textTertiary),
                      ),
                      decoration: const InputDecoration(),
                      isExpanded: true,
                      items: _availableCities
                          .map(
                              (c) => DropdownMenuItem(value: c, child: Text(c)))
                          .toList(),
                      onChanged: _country == null
                          ? null
                          : (v) => setState(() => _city = v),
                    ),
                    const SizedBox(height: 36),

                    // Save / Discard
                    Row(children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => context.pop(),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 54),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(9999)),
                          ),
                          child: const Text('Discard'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GradientButton(
                          label: 'Save Changes',
                          isLoading: _loading,
                          onPressed: _loading ? null : _save,
                        ),
                      ),
                    ]),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Text(text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
        color: AppTheme.textSecondary,
      ));
}
