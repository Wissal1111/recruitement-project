import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme.dart';
import '../../../shared/widgets/gradient_button.dart';

class CreateSurveyScreen extends StatefulWidget {
  const CreateSurveyScreen({super.key});

  @override
  State<CreateSurveyScreen> createState() => _CreateSurveyScreenState();
}

class _CreateSurveyScreenState extends State<CreateSurveyScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _budgetCtrl = TextEditingController();
  final _maxParticipantsCtrl = TextEditingController();
  final _otherProfCtrl = TextEditingController();
  final _otherEduCtrl = TextEditingController();

  bool _isMultiPhase = false;
  RangeValues _ageRange = const RangeValues(18, 45);
  String? _profession;
  String? _education = "Master's Degree";
  String? _country;
  final Set<String> _selectedInterests = {};

  List<String> _countries = [];
  bool _loadingCountries = true;

  final List<String> _professions = [
    'Software Engineer',
    'Web Developer',
    'Mobile Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Cybersecurity Analyst',
    'UI/UX Designer',
    'Product Manager',
    'Project Manager',
    'Business Analyst',
    'Marketing Manager',
    'Digital Marketer',
    'Content Creator',
    'Social Media Manager',
    'SEO Specialist',
    'Graphic Designer',
    'Video Editor',
    'Photographer',
    'Doctor',
    'Nurse',
    'Pharmacist',
    'Dentist',
    'Psychologist',
    'Teacher',
    'Professor',
    'Researcher',
    'Scientist',
    'Accountant',
    'Financial Analyst',
    'Banker',
    'Investment Manager',
    'Lawyer',
    'Paralegal',
    'Judge',
    'Architect',
    'Civil Engineer',
    'Mechanical Engineer',
    'Electrical Engineer',
    'HR Manager',
    'Recruiter',
    'Operations Manager',
    'Entrepreneur',
    'Freelancer',
    'Consultant',
    'Sales Representative',
    'Customer Service',
    'Logistics Manager',
    'Chef',
    'Nutritionist',
    'Personal Trainer',
    'Coach',
    'Journalist',
    'Writer',
    'Editor',
    'Translator',
    'Artist',
    'Musician',
    'Actor',
    'Student',
    'Retired',
    'Other',
  ];

  final List<String> _educationLevels = [
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

  final List<String> _interests = [
    'UX Research',
    'SaaS Growth',
    'AI Ethics',
    'Product Design',
    'Data Science',
    'Marketing',
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Environment',
    'Social Media',
  ];

  @override
  void initState() {
    super.initState();
    _loadCountries();
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
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _countries = [
            'Algeria',
            'Australia',
            'Brazil',
            'Canada',
            'China',
            'Egypt',
            'France',
            'Germany',
            'India',
            'Indonesia',
            'Italy',
            'Japan',
            'Mexico',
            'Morocco',
            'Netherlands',
            'Nigeria',
            'Pakistan',
            'Russia',
            'Saudi Arabia',
            'South Africa',
            'Spain',
            'Tunisia',
            'Turkey',
            'United Arab Emirates',
            'United Kingdom',
            'United States',
            'Other',
          ];
          _loadingCountries = false;
        });
      }
    }
  }

  int get _estimatedAudience {
    final ageSpan = _ageRange.end - _ageRange.start;
    return (ageSpan * 500 + _selectedInterests.length * 1200).round();
  }

  bool get _isFormValid =>
      _titleCtrl.text.isNotEmpty &&
      _budgetCtrl.text.isNotEmpty &&
      _maxParticipantsCtrl.text.isNotEmpty;

  Future<void> _pickEndDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 7)),
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppTheme.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _endDate = picked);
  }

  DateTime? _endDate;

  String _formatEndDate(DateTime date) =>
      '${date.day}/${date.month}/${date.year}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                        color: AppTheme.surfaceLow,
                        borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.close,
                        size: 18, color: AppTheme.textPrimary),
                  ),
                ),
                const SizedBox(width: 14),
                const Text('Create New Survey',
                    style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary)),
              ]),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _Label('SURVEY NAME'),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _titleCtrl,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                          hintText: 'e.g. Q4 Consumer Trend Analysis'),
                    ),
                    const SizedBox(height: 16),

                    _Label('DESCRIPTION'),
                    const SizedBox(height: 8),
                    TextField(
                        controller: _descCtrl,
                        maxLines: 3,
                        decoration: const InputDecoration(
                            hintText: 'Define the primary objective...')),
                    const SizedBox(height: 16),

                    Row(children: [
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            _Label('TOTAL BUDGET (\$)'),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _budgetCtrl,
                              onChanged: (_) => setState(() {}),
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                      decimal: true),
                              decoration: const InputDecoration(
                                  hintText: 'e.g. 1500',
                                  prefixIcon: Icon(Icons.attach_money,
                                      color: AppTheme.textSecondary)),
                            ),
                          ])),
                      const SizedBox(width: 16),
                      Expanded(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                            _Label('MAX PARTICIPANTS'),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _maxParticipantsCtrl,
                              onChanged: (_) => setState(() {}),
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                  hintText: 'e.g. 100',
                                  prefixIcon: Icon(Icons.people_outline,
                                      color: AppTheme.textSecondary)),
                            ),
                          ])),
                    ]),
                    const SizedBox(height: 16),

                    _Label('EXPIRY DATE (OPTIONAL)'),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: _pickEndDate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.surfaceHigh),
                        ),
                        child: Row(children: [
                          const Icon(Icons.calendar_today,
                              size: 18, color: AppTheme.textSecondary),
                          const SizedBox(width: 12),
                          Text(
                            _endDate != null
                                ? 'Expires ${_formatEndDate(_endDate!)}'
                                : 'Pick expiry date...',
                            style: TextStyle(
                                fontSize: 14,
                                color: _endDate != null
                                    ? AppTheme.textPrimary
                                    : AppTheme.textTertiary),
                          ),
                          const Spacer(),
                          if (_endDate != null)
                            GestureDetector(
                              onTap: () => setState(() => _endDate = null),
                              child: const Icon(Icons.close,
                                  size: 16, color: AppTheme.textTertiary),
                            ),
                        ]),
                      ),
                    ),
                    const SizedBox(height: 24),

                    Row(children: [
                      Expanded(
                          child: GestureDetector(
                        onTap: () => setState(() => _isMultiPhase = false),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: 52,
                          decoration: BoxDecoration(
                              gradient: !_isMultiPhase
                                  ? AppTheme.primaryGradient
                                  : null,
                              color: _isMultiPhase ? Colors.white : null,
                              borderRadius: BorderRadius.circular(14)),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.flash_on,
                                    size: 18,
                                    color: !_isMultiPhase
                                        ? Colors.white
                                        : AppTheme.textSecondary),
                                const SizedBox(width: 6),
                                Text('SINGLE PHASE',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.8,
                                        color: !_isMultiPhase
                                            ? Colors.white
                                            : AppTheme.textSecondary)),
                              ]),
                        ),
                      )),
                      const SizedBox(width: 10),
                      Expanded(
                          child: GestureDetector(
                        onTap: () => setState(() => _isMultiPhase = true),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: 52,
                          decoration: BoxDecoration(
                              gradient: _isMultiPhase
                                  ? AppTheme.primaryGradient
                                  : null,
                              color: !_isMultiPhase ? Colors.white : null,
                              borderRadius: BorderRadius.circular(14)),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.layers_outlined,
                                    size: 18,
                                    color: _isMultiPhase
                                        ? Colors.white
                                        : AppTheme.textSecondary),
                                const SizedBox(width: 6),
                                Text('MULTI-PHASE',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.8,
                                        color: _isMultiPhase
                                            ? Colors.white
                                            : AppTheme.textSecondary)),
                              ]),
                        ),
                      )),
                    ]),
                    const SizedBox(height: 24),

                    // Target participants card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20)),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              const Icon(Icons.people_outline,
                                  color: AppTheme.primary, size: 22),
                              const SizedBox(width: 10),
                              const Text('Target Participants',
                                  style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.textPrimary)),
                            ]),
                            const SizedBox(height: 20),
                            Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('AGE RANGE',
                                      style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 1,
                                          color: AppTheme.textSecondary)),
                                  Text(
                                      '${_ageRange.start.round()} — ${_ageRange.end.round()}',
                                      style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: AppTheme.primary)),
                                ]),
                            SliderTheme(
                              data: SliderThemeData(
                                  activeTrackColor: AppTheme.primary,
                                  inactiveTrackColor: AppTheme.surfaceHigh,
                                  thumbColor: AppTheme.primary,
                                  overlayColor:
                                      AppTheme.primary.withOpacity(0.1)),
                              child: RangeSlider(
                                  values: _ageRange,
                                  min: 13,
                                  max: 80,
                                  onChanged: (v) =>
                                      setState(() => _ageRange = v)),
                            ),
                            const SizedBox(height: 16),

                            // Profession dropdown
                            _Label('PROFESSION'),
                            const SizedBox(height: 8),
                            DropdownButtonFormField<String>(
                              value: _profession,
                              isExpanded: true,
                              hint: const Text('Select profession'),
                              decoration: const InputDecoration(),
                              items: _professions
                                  .map((e) => DropdownMenuItem(
                                      value: e, child: Text(e)))
                                  .toList(),
                              onChanged: (v) => setState(() => _profession = v),
                            ),
                            if (_profession == 'Other') ...[
                              const SizedBox(height: 8),
                              TextField(
                                  controller: _otherProfCtrl,
                                  decoration: const InputDecoration(
                                      hintText: 'Type custom profession...')),
                            ],
                            const SizedBox(height: 16),

                            // Education dropdown
                            _Label('EDUCATION'),
                            const SizedBox(height: 8),
                            DropdownButtonFormField<String>(
                              value: _educationLevels.contains(_education)
                                  ? _education
                                  : null,
                              isExpanded: true,
                              hint: const Text('Select education level'),
                              decoration: const InputDecoration(),
                              items: _educationLevels
                                  .map((e) => DropdownMenuItem(
                                      value: e, child: Text(e)))
                                  .toList(),
                              onChanged: (v) => setState(() => _education = v),
                            ),
                            if (_education == 'Other') ...[
                              const SizedBox(height: 8),
                              TextField(
                                  controller: _otherEduCtrl,
                                  decoration: const InputDecoration(
                                      hintText: 'Type custom education...')),
                            ],
                            const SizedBox(height: 16),

                            const Text('KEY INTERESTS',
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1,
                                    color: AppTheme.textSecondary)),
                            const SizedBox(height: 8),
                            Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: _interests.map((interest) {
                                  final selected =
                                      _selectedInterests.contains(interest);
                                  return GestureDetector(
                                    onTap: () => setState(() => selected
                                        ? _selectedInterests.remove(interest)
                                        : _selectedInterests.add(interest)),
                                    child: AnimatedContainer(
                                      duration:
                                          const Duration(milliseconds: 150),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 14, vertical: 7),
                                      decoration: BoxDecoration(
                                          color: selected
                                              ? AppTheme.primary
                                              : AppTheme.surfaceLow,
                                          borderRadius:
                                              BorderRadius.circular(9999)),
                                      child: Text(interest,
                                          style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: selected
                                                  ? Colors.white
                                                  : AppTheme.textSecondary)),
                                    ),
                                  );
                                }).toList()),
                            const SizedBox(height: 16),

                            // Country dropdown — from API
                            _Label('COUNTRY'),
                            const SizedBox(height: 8),
                            _loadingCountries
                                ? const Center(
                                    child: Padding(
                                    padding: EdgeInsets.all(8),
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  ))
                                : DropdownButtonFormField<String>(
                                    value: _country,
                                    isExpanded: true,
                                    hint: const Text('Select country'),
                                    decoration: const InputDecoration(
                                        suffixIcon: Icon(Icons.public_outlined,
                                            size: 18,
                                            color: AppTheme.textTertiary)),
                                    items: _countries
                                        .map((e) => DropdownMenuItem(
                                            value: e, child: Text(e)))
                                        .toList(),
                                    onChanged: (v) =>
                                        setState(() => _country = v),
                                  ),
                          ]),
                    ),
                    const SizedBox(height: 16),

                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                            colors: [Color(0xFF2D2D6B), Color(0xFF4A4BD7)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('AUDIENCE ESTIMATOR',
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.2,
                                    color: Colors.white70)),
                            const SizedBox(height: 6),
                            Text(
                                '~${_estimatedAudience.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                                style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white)),
                            const SizedBox(height: 4),
                            const Text(
                                'Qualified participants matching your criteria.',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.white70,
                                    height: 1.4)),
                          ]),
                    ),
                    const SizedBox(height: 32),

                    GradientButton(
                      label: 'Continue to Questions',
                      onPressed: _isFormValid
                          ? () {
                              context.push('/surveys/build', extra: {
                                'title': _titleCtrl.text,
                                'description': _descCtrl.text,
                                'totalBudget':
                                    double.tryParse(_budgetCtrl.text.trim()) ??
                                        0.0,
                                'maxParticipants': int.tryParse(
                                        _maxParticipantsCtrl.text.trim()) ??
                                    0,
                                'isMultiPhase': _isMultiPhase,
                                'profession': _profession == 'Other'
                                    ? _otherProfCtrl.text
                                    : _profession,
                                'education': _education == 'Other'
                                    ? _otherEduCtrl.text
                                    : _education,
                                'ageMin': _ageRange.start.round(),
                                'ageMax': _ageRange.end.round(),
                                'country': _country,
                                'interests': _selectedInterests.toList(),
                                'endDate': _endDate?.toIso8601String(),
                              });
                            }
                          : null,
                      trailingIcon: Icons.arrow_forward,
                    ),
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
          color: AppTheme.textSecondary));
}
