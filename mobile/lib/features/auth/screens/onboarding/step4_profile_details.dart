import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';
import '../../models/registration_state.dart';

class Step4ProfileDetails extends StatefulWidget {
  final int currentStep;
  final RegistrationState data;
  final void Function(RegistrationState) onNext;
  final VoidCallback onBack;

  const Step4ProfileDetails({
    super.key,
    required this.currentStep,
    required this.data,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step4ProfileDetails> createState() => _Step4State();
}

class _Step4State extends State<Step4ProfileDetails> {
  final _professions = [
    'Technology & Design',
    'Healthcare',
    'Education',
    'Finance',
    'Marketing & Advertising',
    'Legal',
    'Engineering',
    'Arts & Entertainment',
    'Science & Research',
    'Human Resources',
    'Sales & Business Development',
    'Operations & Management',
    'Customer Service',
    'Construction & Architecture',
    'Transportation & Logistics',
    'Hospitality & Tourism',
    'Agriculture',
    'Non-Profit & Social Work',
    'Student',
    'Unemployed',
    'Other',
  ];

  final _educationLevels = [
    'No Formal Education',
    'Primary School',
    'Middle School / Junior High',
    'High School Diploma / GED',
    'Some College (No Degree)',
    'Vocational / Trade School',
    'Associate Degree',
    "Bachelor's Degree",
    'Post-Graduate Certificate',
    "Master's Degree",
    'MBA',
    'Professional Degree (JD, MD, PharmD…)',
    'PhD / Doctorate',
    'Postdoctoral Research',
    'Other',
  ];

  String? _profession;
  final _customProfCtrl = TextEditingController();
  String? _education;
  String? _country;
  String? _city;
  DateTime? _dateOfBirth;

  List<String> _countries = [];
  List<String> _cities = [];
  bool _loadingCountries = true;
  bool _loadingCities = false;

  @override
  void initState() {
    super.initState();
    // Match existing profession to list or set as Other
    final existingProf = widget.data.profession ?? '';
    if (_professions.contains(existingProf)) {
      _profession = existingProf;
    } else if (existingProf.isNotEmpty) {
      _profession = 'Other';
      _customProfCtrl.text = existingProf;
    }
    _education = widget.data.education;
    _country = widget.data.country;
    _city = widget.data.city;
    _dateOfBirth = widget.data.dateOfBirth;
    _loadCountries();
  }

  @override
  void dispose() {
    _customProfCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadCountries() async {
    try {
      final dio = Dio();
      final res =
          await dio.get('https://restcountries.com/v3.1/all?fields=name');
      final List data = res.data;
      final names = data.map((c) => c['name']['common'].toString()).toList();
      names.sort();
      if (mounted) {
        setState(() {
          _countries = names;
          _loadingCountries = false;
        });
        if (_country != null) _loadCities(_country!);
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _countries = [
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
            'Czech Republic',
            'Denmark',
            'Egypt',
            'Finland',
            'France',
            'Germany',
            'Greece',
            'Hungary',
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
          _loadingCountries = false;
        });
        if (_country != null) _loadCities(_country!);
      }
    }
  }

  static const Map<String, List<String>> _hardcodedCities = {
    'Algeria': [
      'Adrar',
      'Aïn Defla',
      'Aïn Témouchent',
      'Algiers',
      'Annaba',
      'Batna',
      'Béchar',
      'Béjaïa',
      'Biskra',
      'Blida',
      'Bordj Bou Arréridj',
      'Bouira',
      'Boumerdès',
      'Chlef',
      'Constantine',
      'Djelfa',
      'El Bayadh',
      'El Oued',
      'El Tarf',
      'Ghardaïa',
      'Guelma',
      'Illizi',
      'Jijel',
      'Khenchela',
      'Laghouat',
      'Mascara',
      'Médéa',
      'Mila',
      'Mostaganem',
      "M'Sila",
      'Naâma',
      'Oran',
      'Ouargla',
      'Oum El Bouaghi',
      'Relizane',
      'Saïda',
      'Sétif',
      'Sidi Bel Abbès',
      'Skikda',
      'Souk Ahras',
      'Tamanrasset',
      'Tébessa',
      'Tiaret',
      'Tindouf',
      'Tipaza',
      'Tissemsilt',
      'Tizi Ouzou',
      'Tlemcen',
      'Bordj Badji Mokhtar',
      'Ouled Djellal',
      'Béni Abbès',
      'In Salah',
      'In Guezzam',
      'Touggourt',
      'Djanet',
      'El MGhair',
      'El Meniaa',
      'Other',
    ],
    'France': [
      'Aix-en-Provence',
      'Amiens',
      'Angers',
      'Avignon',
      'Besançon',
      'Bordeaux',
      'Brest',
      'Caen',
      'Clermont-Ferrand',
      'Dijon',
      'Grenoble',
      'Le Havre',
      'Le Mans',
      'Lille',
      'Limoges',
      'Lyon',
      'Marseille',
      'Metz',
      'Montpellier',
      'Mulhouse',
      'Nancy',
      'Nantes',
      'Nice',
      'Nîmes',
      'Orléans',
      'Paris',
      'Perpignan',
      'Reims',
      'Rennes',
      'Rouen',
      'Saint-Étienne',
      'Strasbourg',
      'Toulon',
      'Toulouse',
      'Tours',
      'Villeurbanne',
      'Other',
    ],
    'Tunisia': [
      'Ariana',
      'Béja',
      'Ben Arous',
      'Bizerte',
      'Gabès',
      'Gafsa',
      'Jendouba',
      'Kairouan',
      'Kasserine',
      'Kebili',
      'La Manouba',
      'Le Kef',
      'Mahdia',
      'Médenine',
      'Monastir',
      'Nabeul',
      'Sfax',
      'Sidi Bouzid',
      'Siliana',
      'Sousse',
      'Tataouine',
      'Tozeur',
      'Tunis',
      'Zaghouan',
      'Other',
    ],
    'Morocco': [
      'Agadir',
      'Al Hoceima',
      'Béni Mellal',
      'Casablanca',
      'Dakhla',
      'El Jadida',
      'Errachidia',
      'Essaouira',
      'Fès',
      'Guelmim',
      'Ifrane',
      'Kenitra',
      'Khénifra',
      'Khouribga',
      'Laâyoune',
      'Larache',
      'Marrakech',
      'Meknès',
      'Mohammedia',
      'Nador',
      'Ouarzazate',
      'Oujda',
      'Rabat',
      'Safi',
      'Salé',
      'Settat',
      'Tan-Tan',
      'Tanger',
      'Taroudant',
      'Taza',
      'Tétouan',
      'Tiznit',
      'Other',
    ],
    'United States': [
      'Atlanta',
      'Austin',
      'Baltimore',
      'Boston',
      'Charlotte',
      'Chicago',
      'Columbus',
      'Dallas',
      'Denver',
      'Detroit',
      'El Paso',
      'Fort Worth',
      'Fresno',
      'Houston',
      'Indianapolis',
      'Jacksonville',
      'Las Vegas',
      'Los Angeles',
      'Louisville',
      'Memphis',
      'Mesa',
      'Miami',
      'Milwaukee',
      'Minneapolis',
      'Nashville',
      'New York City',
      'Oklahoma City',
      'Omaha',
      'Philadelphia',
      'Phoenix',
      'Portland',
      'Raleigh',
      'Sacramento',
      'San Antonio',
      'San Diego',
      'San Francisco',
      'San Jose',
      'Seattle',
      'Tucson',
      'Washington D.C.',
      'Other',
    ],
    'United Kingdom': [
      'Birmingham',
      'Bradford',
      'Bristol',
      'Coventry',
      'Edinburgh',
      'Glasgow',
      'Leeds',
      'Leicester',
      'Liverpool',
      'London',
      'Manchester',
      'Newcastle',
      'Nottingham',
      'Oxford',
      'Sheffield',
      'Southampton',
      'Other',
    ],
    'Germany': [
      'Berlin',
      'Bremen',
      'Cologne',
      'Dortmund',
      'Dresden',
      'Düsseldorf',
      'Essen',
      'Frankfurt',
      'Hamburg',
      'Hanover',
      'Leipzig',
      'Munich',
      'Nuremberg',
      'Stuttgart',
      'Other',
    ],
    'Canada': [
      'Calgary',
      'Edmonton',
      'Halifax',
      'Montreal',
      'Ottawa',
      'Quebec City',
      'Toronto',
      'Vancouver',
      'Winnipeg',
      'Other',
    ],
    'Saudi Arabia': [
      'Abha',
      'Al Khobar',
      'Buraidah',
      'Dammam',
      'Hail',
      'Jeddah',
      'Jizan',
      'Mecca',
      'Medina',
      'Riyadh',
      'Tabuk',
      'Taif',
      'Other',
    ],
    'United Arab Emirates': [
      'Abu Dhabi',
      'Ajman',
      'Al Ain',
      'Dubai',
      'Fujairah',
      'Ras Al Khaimah',
      'Sharjah',
      'Umm Al Quwain',
      'Other',
    ],
    'Egypt': [
      'Alexandria',
      'Assiut',
      'Cairo',
      'Giza',
      'Hurghada',
      'Ismailia',
      'Luxor',
      'Mansoura',
      'Port Said',
      'Sharm El Sheikh',
      'Suez',
      'Tanta',
      'Zagazig',
      'Other',
    ],
    'India': [
      'Ahmedabad',
      'Bangalore',
      'Chennai',
      'Delhi',
      'Hyderabad',
      'Jaipur',
      'Kolkata',
      'Lucknow',
      'Mumbai',
      'Nagpur',
      'Pune',
      'Surat',
      'Other',
    ],
  };

  Future<void> _loadCities(String countryName) async {
    setState(() {
      _loadingCities = true;
      _cities = [];
    });

    if (_hardcodedCities.containsKey(countryName)) {
      if (mounted) {
        setState(() {
          _cities = _hardcodedCities[countryName]!;
          _loadingCities = false;
        });
      }
      return;
    }

    try {
      final dio = Dio();
      final res = await dio.post(
        'https://countriesnow.space/api/v0.1/countries/cities',
        data: {'country': countryName},
      );
      final List? cityList = res.data['data'];
      if (mounted) {
        final sorted = (cityList ?? []).map((e) => e.toString()).toList()
          ..sort();
        if (sorted.isEmpty) sorted.add('Other');
        if (!sorted.contains('Other')) sorted.add('Other');
        setState(() {
          _cities = sorted;
          _loadingCities = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _cities = ['Other'];
          _loadingCities = false;
        });
      }
    }
  }

  String get _dobDisplay {
    if (_dateOfBirth == null) return '';
    final d = _dateOfBirth!;
    final month = d.month.toString().padLeft(2, '0');
    final day = d.day.toString().padLeft(2, '0');
    return '${d.year}-$month-$day';
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(2000, 1, 1),
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
          dialogTheme: DialogThemeData(backgroundColor: AppTheme.surfaceLowest),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _dateOfBirth = picked);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header ────────────────────────────────────────
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
                    const SizedBox(width: 12),
                    const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ONBOARDING',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.2,
                                color: AppTheme.primary,
                              )),
                          Text('Step 4 of 6',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.textSecondary,
                              )),
                        ]),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryContainer,
                        borderRadius: BorderRadius.circular(9999),
                      ),
                      child: const Text('66%',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.primary,
                          )),
                    ),
                  ]),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(100),
                    child: const LinearProgressIndicator(
                      value: 4 / 6,
                      minHeight: 4,
                      backgroundColor: AppTheme.surfaceHigh,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppTheme.primary),
                    ),
                  ),
                  const SizedBox(height: 28),
                  const Text('Finalize Your Profile',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary,
                        letterSpacing: -0.5,
                        height: 1.2,
                      )),
                  const SizedBox(height: 10),
                  const Text(
                    "Let's tailor your experience. Please provide details about your professional and educational background.",
                    style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                        height: 1.5),
                  ),
                  const SizedBox(height: 28),

                  // ── Date of Birth ─────────────────────────────────
                  _SectionCard(
                    icon: Icons.calendar_today_outlined,
                    title: 'Date of Birth',
                    child: GestureDetector(
                      onTap: _pickDate,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 16),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceLow,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(children: [
                          Expanded(
                            child: Text(
                              _dateOfBirth == null ? 'mm/dd/yyyy' : _dobDisplay,
                              style: TextStyle(
                                fontSize: 15,
                                color: _dateOfBirth == null
                                    ? AppTheme.textTertiary
                                    : AppTheme.textPrimary,
                              ),
                            ),
                          ),
                          const Icon(Icons.calendar_month_outlined,
                              color: AppTheme.textTertiary, size: 20),
                        ]),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // ── Profession ────────────────────────────────────
                  _SectionCard(
                    icon: Icons.work_outline,
                    title: 'Profession',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        DropdownButtonFormField<String>(
                          value: _professions.contains(_profession)
                              ? _profession
                              : null,
                          hint: const Text('Select your profession',
                              style: TextStyle(
                                  color: AppTheme.textTertiary, fontSize: 15)),
                          decoration: const InputDecoration(),
                          isExpanded: true,
                          items: _professions
                              .map((e) =>
                                  DropdownMenuItem(value: e, child: Text(e)))
                              .toList(),
                          onChanged: (v) => setState(() => _profession = v),
                        ),
                        if (_profession == 'Other') ...[
                          const SizedBox(height: 12),
                          TextField(
                            controller: _customProfCtrl,
                            decoration: const InputDecoration(
                              hintText: 'Please specify your profession...',
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // ── Education ─────────────────────────────────────
                  _SectionCard(
                    icon: Icons.school_outlined,
                    title: 'Level of studies',
                    child: DropdownButtonFormField<String>(
                      value: _educationLevels.contains(_education)
                          ? _education
                          : null,
                      hint: const Text('Select your highest degree',
                          style: TextStyle(
                              color: AppTheme.textTertiary, fontSize: 15)),
                      decoration: const InputDecoration(),
                      isExpanded: true,
                      items: _educationLevels
                          .map(
                              (e) => DropdownMenuItem(value: e, child: Text(e)))
                          .toList(),
                      onChanged: (v) => setState(() => _education = v),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // ── Country ───────────────────────────────────────
                  _SectionCard(
                    icon: Icons.public_outlined,
                    title: 'Country',
                    child: _loadingCountries
                        ? const Center(
                            child: Padding(
                            padding: EdgeInsets.all(8),
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ))
                        : DropdownButtonFormField<String>(
                            value:
                                _countries.contains(_country) ? _country : null,
                            hint: const Text('Select your country',
                                style: TextStyle(
                                    color: AppTheme.textTertiary,
                                    fontSize: 15)),
                            decoration: const InputDecoration(),
                            isExpanded: true,
                            items: _countries
                                .map((c) =>
                                    DropdownMenuItem(value: c, child: Text(c)))
                                .toList(),
                            onChanged: (v) {
                              setState(() {
                                _country = v;
                                _city = null;
                                _cities = [];
                              });
                              if (v != null) _loadCities(v);
                            },
                          ),
                  ),
                  const SizedBox(height: 14),

                  // ── City ──────────────────────────────────────────
                  _SectionCard(
                    icon: Icons.location_city_outlined,
                    title: 'City',
                    child: _loadingCities
                        ? const Center(
                            child: Padding(
                            padding: EdgeInsets.all(8),
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ))
                        : DropdownButtonFormField<String>(
                            value: _cities.contains(_city) ? _city : null,
                            hint: Text(
                              _country == null
                                  ? 'Select country first'
                                  : _cities.isEmpty
                                      ? 'No cities found'
                                      : 'Select your city',
                              style: const TextStyle(
                                  color: AppTheme.textTertiary, fontSize: 15),
                            ),
                            decoration: const InputDecoration(),
                            isExpanded: true,
                            items: _cities
                                .map((c) =>
                                    DropdownMenuItem(value: c, child: Text(c)))
                                .toList(),
                            onChanged: (_country == null || _cities.isEmpty)
                                ? null
                                : (v) => setState(() => _city = v),
                          ),
                  ),
                  const SizedBox(height: 24),

                  // ── Community banner ──────────────────────────────
                  Container(
                    width: double.infinity,
                    height: 130,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1A1060), Color(0xFF4A4BD7)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                    ),
                    child: Stack(children: [
                      Positioned(
                        top: -20,
                        right: -20,
                        child: Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: -30,
                        right: 60,
                        child: Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                      const Positioned(
                        bottom: 20,
                        left: 20,
                        child: Text(
                          'Join 20k+ curators sharing their journey.',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      Positioned(
                        right: 16,
                        bottom: 16,
                        child: Container(
                          width: 34,
                          height: 34,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.help_outline,
                              color: AppTheme.primary, size: 18),
                        ),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),

          // ── Bottom buttons ────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 28),
            child: Row(children: [
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
                  onPressed: () => widget.onNext(widget.data.copyWith(
                    profession: _profession == 'Other'
                        ? _customProfCtrl.text.trim()
                        : _profession ?? '',
                    education: _education,
                    country: _country,
                    city: _city,
                    dateOfBirth: _dateOfBirth,
                  )),
                  trailingIcon: Icons.arrow_forward,
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget child;

  const _SectionCard({
    required this.icon,
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surfaceLowest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primaryContainer,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppTheme.primary, size: 18),
            ),
            const SizedBox(width: 10),
            Text(title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primary,
                )),
          ]),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}
