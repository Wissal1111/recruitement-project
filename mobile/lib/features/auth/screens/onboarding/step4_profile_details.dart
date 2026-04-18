import 'package:flutter/material.dart';
import '../../models/registration_state.dart';
import '../../../../shared/theme.dart';
import '../../../../shared/widgets/gradient_button.dart';

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
  late final TextEditingController _professionCtrl;
  String? _education;
  String? _country;
  String? _city;
  DateTime? _dateOfBirth;

  final _educationLevels = [
    'High School',
    'Associate Degree',
    "Bachelor's Degree",
    "Master's Degree",
    'PhD / Doctorate',
    'Other',
  ];

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
      'Phoenix',
      'San Francisco',
      'Other'
    ],
    'France': [
      'Paris',
      'Lyon',
      'Marseille',
      'Toulouse',
      'Nice',
      'Nantes',
      'Other'
    ],
    'United Kingdom': [
      'London',
      'Manchester',
      'Birmingham',
      'Leeds',
      'Glasgow',
      'Edinburgh',
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
    'Australia': [
      'Sydney',
      'Melbourne',
      'Brisbane',
      'Perth',
      'Adelaide',
      'Other'
    ],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Other'],
    'India': [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Hyderabad',
      'Chennai',
      'Kolkata',
      'Other'
    ],
    'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Other'],
    'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Other'],
    'Morocco': [
      'Casablanca',
      'Rabat',
      'Marrakech',
      'Fès',
      'Tangier',
      'Agadir',
      'Other'
    ],
    'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Other'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Other'],
    'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Other'],
    'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Other'],
    'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Other'],
    'South Africa': [
      'Johannesburg',
      'Cape Town',
      'Durban',
      'Pretoria',
      'Other'
    ],
    'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Other'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Other'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Other'],
    'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Other'],
    'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Other'],
    'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Other'],
    'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Other'],
    'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Other'],
    'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Other'],
    'Philippines': ['Manila', 'Quezon City', 'Cebu', 'Davao', 'Other'],
    'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Other'],
    'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Other'],
    'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Other'],
    'Jordan': ['Amman', 'Zarqa', 'Irbid', 'Other'],
    'Tunisia': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Other'],
    'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Other'],
    'Poland': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Other'],
    'Ukraine': ['Kyiv', 'Kharkiv', 'Odessa', 'Other'],
    'Romania': ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Other'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Other'],
    'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Other'],
    'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'Other'],
    'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Other'],
    'Portugal': ['Lisbon', 'Porto', 'Braga', 'Other'],
    'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Other'],
    'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Other'],
    'Greece': ['Athens', 'Thessaloniki', 'Patras', 'Other'],
    'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Other'],
    'Iran': ['Tehran', 'Isfahan', 'Mashhad', 'Other'],
    'Iraq': ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Other'],
    'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Other'],
    'Ireland': ['Dublin', 'Cork', 'Limerick', 'Galway', 'Other'],
    'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Other'],
    'Venezuela': ['Caracas', 'Maracaibo', 'Valencia', 'Other'],
    'Peru': ['Lima', 'Arequipa', 'Trujillo', 'Other'],
  };

  List<String> get _availableCities {
    if (_country == null) return [];
    return _citiesByCountry[_country!] ?? ['Other'];
  }

  // Format DateTime to display string
  String get _dobDisplay {
    if (_dateOfBirth == null) return '';
    final d = _dateOfBirth!;
    final month = d.month.toString().padLeft(2, '0');
    final day = d.day.toString().padLeft(2, '0');
    return '${d.year}-$month-$day';
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final minDate = DateTime(now.year - 100);
    final maxDate = DateTime(now.year - 13); // must be 13+

    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime(2000, 1, 1),
      firstDate: minDate,
      lastDate: maxDate,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppTheme.primary,
              onPrimary: Colors.white,
              surface: AppTheme.surfaceLowest,
              onSurface: AppTheme.textPrimary,
            ), dialogTheme: DialogThemeData(backgroundColor: AppTheme.surfaceLowest),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  @override
  void initState() {
    super.initState();
    _professionCtrl = TextEditingController(text: widget.data.profession);
    _education = widget.data.education;
    _country = widget.data.country;
    _city = widget.data.city;
    _dateOfBirth = widget.data.dateOfBirth;
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

                  // ── Date of Birth ──────────────────────────────────
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
                    child: TextField(
                      controller: _professionCtrl,
                      decoration: const InputDecoration(
                        hintText: 'e.g. Senior Creative Director',
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // ── Education ─────────────────────────────────────
                  _SectionCard(
                    icon: Icons.school_outlined,
                    title: 'Level of studies',
                    child: DropdownButtonFormField<String>(
                      initialValue: _education,
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
                    child: DropdownButtonFormField<String>(
                      initialValue: _country,
                      hint: const Text('Select your country',
                          style: TextStyle(
                              color: AppTheme.textTertiary, fontSize: 15)),
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
                  ),
                  const SizedBox(height: 14),

                  // ── City ──────────────────────────────────────────
                  _SectionCard(
                    icon: Icons.location_city_outlined,
                    title: 'City',
                    child: DropdownButtonFormField<String>(
                      initialValue: _availableCities.contains(_city) ? _city : null,
                      hint: Text(
                        _country == null
                            ? 'Select country first'
                            : 'Select your city',
                        style: const TextStyle(
                            color: AppTheme.textTertiary, fontSize: 15),
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
                      // Decorative circles
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
                    profession: _professionCtrl.text.trim(),
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

// ── Reusable section card ─────────────────────────────────────────────────────
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
