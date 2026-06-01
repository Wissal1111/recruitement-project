import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/api_client.dart';
import '../../../shared/theme.dart';
import '../models/survey_model.dart';
import '../providers/recruitment_provider.dart';
import '../providers/survey_provider.dart';

class SurveysScreen extends ConsumerStatefulWidget {
  const SurveysScreen({super.key});

  @override
  ConsumerState<SurveysScreen> createState() => _SurveysScreenState();
}

class _SurveysScreenState extends ConsumerState<SurveysScreen> {
  int _filterIndex = 0;
  final _filters = ['Browse', 'My Surveys', 'Completed'];

  String _formatDate(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final mySurveys = ref.watch(mySurveysProvider);
    final browsable = ref.watch(browseSurveysProvider);

    return Scaffold(
      backgroundColor: AppTheme.surfaceBase,
      floatingActionButton: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppTheme.ambientShadow,
        ),
        child: IconButton(
          icon: const Icon(Icons.add, color: Colors.white, size: 26),
          onPressed: () => context.push('/surveys/create'),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Column(children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Surveys',
                        style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textPrimary)),
                    Row(children: [
                      const Text('Surveyor',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primary)),
                      const SizedBox(width: 10),
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: AppTheme.primaryContainer,
                        child: const Icon(Icons.person,
                            size: 18, color: AppTheme.primary),
                      ),
                    ]),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Search surveys...',
                    prefixIcon:
                        const Icon(Icons.search, color: AppTheme.textTertiary),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _filters.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final selected = i == _filterIndex;
                      return GestureDetector(
                        onTap: () => setState(() => _filterIndex = i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 18, vertical: 8),
                          decoration: BoxDecoration(
                            color: selected ? AppTheme.primary : Colors.white,
                            borderRadius: BorderRadius.circular(9999),
                          ),
                          child: Text(_filters[i],
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: selected
                                      ? Colors.white
                                      : AppTheme.textSecondary)),
                        ),
                      );
                    },
                  ),
                ),
              ]),
            ),
            const SizedBox(height: 16),
            Expanded(child: _buildBodyContent(mySurveys, browsable)),
          ],
        ),
      ),
    );
  }

  Widget _buildBodyContent(
      AsyncValue<List<Study>> mySurveys, AsyncValue<List<Study>> browsable) {
    // ── TAB 0: BROWSE ──────────────────────────────────────
    if (_filterIndex == 0) {
      return browsable.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => const Center(child: Text('Failed to load surveys')),
        data: (surveys) {
          if (surveys.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.explore_outlined,
                          size: 64, color: AppTheme.textTertiary),
                      SizedBox(height: 16),
                      Text('No surveys available.',
                          style: TextStyle(
                              fontSize: 16,
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w600)),
                      SizedBox(height: 8),
                      Text('Published surveys will appear here.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontSize: 13, color: AppTheme.textTertiary)),
                    ]),
              ),
            );
          }
          return _BrowseList(surveys: surveys);
        },
      );
    }

    // ── TAB 2: COMPLETED ───────────────────────────────────
    if (_filterIndex == 2) {
      return const _CompletedTab();
    }

    // ── TAB 1: MY SURVEYS ──────────────────────────────────
    return mySurveys.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.warning_amber_rounded,
                size: 48, color: AppTheme.textTertiary),
            const SizedBox(height: 16),
            const Text('Session expired.',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary)),
            const SizedBox(height: 8),
            const Text('Please log out and log back in.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textSecondary)),
          ]),
        ),
      ),
      data: (allSurveys) {
        if (allSurveys.isEmpty) {
          return const Center(
              child: Padding(
            padding: EdgeInsets.all(40),
            child:
                Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.assignment_outlined,
                  size: 64, color: AppTheme.textTertiary),
              SizedBox(height: 16),
              Text('No surveys created yet.',
                  style: TextStyle(
                      fontSize: 16,
                      color: AppTheme.textSecondary,
                      fontWeight: FontWeight.w600)),
              SizedBox(height: 8),
              Text('Tap + to create your first survey!',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: AppTheme.textTertiary)),
            ]),
          ));
        }
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          itemCount: allSurveys.length,
          itemBuilder: (context, index) {
            final s = allSurveys[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _MySurveyCard(
                  survey: s,
                  dateString: _formatDate(s.updatedAt),
                  onTap: () => context.push('/surveys/detail', extra: s)),
            );
          },
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────
// COMPLETED TAB
// ─────────────────────────────────────────────────────────
class _CompletedTab extends ConsumerStatefulWidget {
  const _CompletedTab();

  @override
  ConsumerState<_CompletedTab> createState() => _CompletedTabState();
}

class _CompletedTabState extends ConsumerState<_CompletedTab> {
  List<Map<String, dynamic>> _studies = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/api/responses/me/by-study');
      final raw = res.data;
      List grouped = [];
      if (raw is Map && raw['data'] is List) {
        grouped = raw['data'];
      } else if (raw is List) {
        grouped = raw;
      }

      final List<Map<String, dynamic>> result = [];

      for (final group in grouped) {
        final studyId = group['studyId']?.toString() ?? '';
        final responses = group['responses'] as List? ?? [];
        final submitted =
            responses.where((r) => r['status'] == 'SUBMITTED').toList();
        if (submitted.isEmpty) continue;

        final studyData =
            await ref.read(surveyRepositoryProvider).getStudyById(studyId);
        if (studyData == null) continue;

        final study = Study.fromJson(studyData);
        final totalPhases = study.phases.length;
        final completedPhases = submitted.length;
        final isFullyComplete = completedPhases >= totalPhases;

        // ✅ Find next phase index to continue from
        // Get all submitted phaseIds
        final submittedPhaseIds =
            submitted.map((r) => r['phaseId']?.toString() ?? '').toSet();

        int nextPhaseIndex = 0;
        for (int i = 0; i < study.phases.length; i++) {
          final phaseId = study.phases[i]['phaseId']?.toString() ?? '';
          if (!submittedPhaseIds.contains(phaseId)) {
            nextPhaseIndex = i;
            break;
          }
          // All phases submitted — stay on last
          nextPhaseIndex = study.phases.length - 1;
        }

        double totalEarned = 0;
        final phaseBreakdown = <Map<String, dynamic>>[];

        for (final response in submitted) {
          final phaseId = response['phaseId']?.toString() ?? '';
          final phaseIdx =
              study.phases.indexWhere((p) => p['phaseId'] == phaseId);
          final phase =
              phaseIdx >= 0 ? study.phases[phaseIdx] : <String, dynamic>{};
          final rawReward = phase['rewardAmount'];
          double reward = 0;
          if (rawReward is num) {
            reward = rawReward.toDouble();
          } else if (rawReward is Map && rawReward['\$numberDecimal'] != null) {
            reward =
                double.tryParse(rawReward['\$numberDecimal'].toString()) ?? 0;
          }
          totalEarned += reward;
          phaseBreakdown.add({
            'phaseName': 'Phase ${phaseIdx + 1}',
            'reward': reward,
            'submittedAt': response['submittedAt'],
            'phaseId': phaseId,
            'answers': response['answers'] ?? [],
            'snapshot': response['snapshot'] ?? {},
          });
        }

        result.add({
          'study': study,
          'totalEarned': totalEarned,
          'completedPhases': completedPhases,
          'totalPhases': totalPhases,
          'isFullyComplete': isFullyComplete,
          'phaseBreakdown': phaseBreakdown,
          'nextPhaseIndex': nextPhaseIndex, // ✅ stored
        });
      }

      if (mounted) {
        setState(() {
          _studies = result;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Completed tab load error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _continueOrUpdate(Study study, int nextPhaseIndex) async {
    if (!mounted) return;
    context.push('/surveys/answer', extra: {
      'survey': study,
      'phaseIndex': nextPhaseIndex,
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_studies.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.check_circle_outline,
                size: 64, color: AppTheme.textTertiary),
            SizedBox(height: 16),
            Text('No surveys yet.',
                style: TextStyle(
                    fontSize: 16,
                    color: AppTheme.textSecondary,
                    fontWeight: FontWeight.w600)),
            SizedBox(height: 8),
            Text('Surveys you participate in will appear here.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppTheme.textTertiary)),
          ]),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        setState(() => _isLoading = true);
        await _load();
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _studies.length,
        itemBuilder: (context, index) {
          final item = _studies[index];
          final study = item['study'] as Study;
          final totalEarned = item['totalEarned'] as double;
          final completedPhases = item['completedPhases'] as int;
          final totalPhases = item['totalPhases'] as int;
          final isFullyComplete = item['isFullyComplete'] as bool;
          final phaseBreakdown =
              item['phaseBreakdown'] as List<Map<String, dynamic>>;
          final nextPhaseIndex = item['nextPhaseIndex'] as int;

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.surfaceHigh)),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // ── Status row ───────────────────────────
              Row(children: [
                Icon(
                    isFullyComplete
                        ? Icons.check_circle
                        : Icons.pending_outlined,
                    color: isFullyComplete
                        ? AppTheme.successColor
                        : AppTheme.primary,
                    size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                      isFullyComplete
                          ? 'COMPLETED'
                          : 'IN PROGRESS ($completedPhases/$totalPhases phases)',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: isFullyComplete
                              ? AppTheme.successColor
                              : AppTheme.primary,
                          letterSpacing: 1)),
                ),
                Text('\$${totalEarned.toStringAsFixed(0)} earned',
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primary)),
              ]),
              const SizedBox(height: 12),

              // ── Survey title ─────────────────────────
              Text(study.title,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary)),
              if (study.description != null &&
                  study.description!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(study.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 13, color: AppTheme.textSecondary)),
              ],
              const SizedBox(height: 16),
              const Divider(color: AppTheme.surfaceHigh),
              const SizedBox(height: 8),

              // ── Phase breakdown ──────────────────────
              ...phaseBreakdown.map((phase) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(children: [
                      Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                              color: AppTheme.successColor,
                              shape: BoxShape.circle)),
                      const SizedBox(width: 10),
                      const Icon(Icons.check_circle_outline,
                          size: 14, color: AppTheme.successColor),
                      const SizedBox(width: 6),
                      Text(phase['phaseName'],
                          style: const TextStyle(
                              fontSize: 13, color: AppTheme.textSecondary)),
                      const Spacer(),
                      Text(
                          '\$${(phase['reward'] as double).toStringAsFixed(0)}',
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.primary)),
                    ]),
                  )),

              // ── Remaining phases ─────────────────────
              if (!isFullyComplete) ...[
                ...List.generate(
                    totalPhases - completedPhases,
                    (i) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Row(children: [
                            Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                    color: AppTheme.surfaceHigh,
                                    shape: BoxShape.circle)),
                            const SizedBox(width: 10),
                            const Icon(Icons.radio_button_unchecked,
                                size: 14, color: AppTheme.textTertiary),
                            const SizedBox(width: 6),
                            Text('Phase ${completedPhases + i + 1}',
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.textTertiary)),
                            const Spacer(),
                            const Text('Pending',
                                style: TextStyle(
                                    fontSize: 12,
                                    color: AppTheme.textTertiary)),
                          ]),
                        )),
              ],
              const SizedBox(height: 16),

              // ── Action button ────────────────────────
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _continueOrUpdate(study, nextPhaseIndex),
                  icon: Icon(
                      isFullyComplete ? Icons.edit_outlined : Icons.play_arrow,
                      size: 18,
                      color: Colors.white),
                  label: Text(
                      isFullyComplete
                          ? 'Update Answers'
                          : 'Continue Phase ${nextPhaseIndex + 1}',
                      style: const TextStyle(
                          color: Colors.white, fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: isFullyComplete
                          ? AppTheme.successColor
                          : AppTheme.primary,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      minimumSize: const Size(double.infinity, 48)),
                ),
              ),
            ]),
          );
        },
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// BROWSE LIST
// ─────────────────────────────────────────────────────────
class _BrowseList extends ConsumerStatefulWidget {
  final List<Study> surveys;
  const _BrowseList({required this.surveys});

  @override
  ConsumerState<_BrowseList> createState() => _BrowseListState();
}

class _BrowseListState extends ConsumerState<_BrowseList> {
  final Map<String, int?> _scores = {};
  Map<String, dynamic>? _userProfile;
  bool _profileLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadProfileThenScores();
  }

  @override
  void didUpdateWidget(_BrowseList oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If surveys list changed, compute scores for new ones
    if (oldWidget.surveys != widget.surveys) {
      for (final survey in widget.surveys) {
        if (!_scores.containsKey(survey.studyId)) {
          _computeScore(survey);
        }
      }
    }
  }

  Future<void> _loadProfileThenScores() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/api/profile');
      _userProfile = res.data as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Profile load failed: $e');
    }
    if (mounted) setState(() => _profileLoaded = true);
    for (final survey in widget.surveys) {
      _computeScore(survey);
    }
  }

  Future<void> _computeScore(Study survey) async {
    try {
      final criteria = await ref
          .read(recruitmentRepositoryProvider)
          .getStudyCriteria(survey.studyId);
      final score = _calculateMatchScore(criteria);
      if (mounted) {
        setState(() => _scores[survey.studyId] = score);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _scores[survey.studyId] = -1);
      }
    }
  }

  int _calculateMatchScore(Map<String, dynamic>? criteria) {
    if (criteria == null || _userProfile == null) return -1;
    final profile = _userProfile!['profile'] as Map<String, dynamic>?;
    if (profile == null) return -1;

    int total = 0;
    int matched = 0;

    final ageMin = criteria['ageMin'] as int?;
    final ageMax = criteria['ageMax'] as int?;
    if (ageMin != null || ageMax != null) {
      total++;
      final dob = profile['dateOfBirth'] as String?;
      if (dob != null) {
        final birthDate = DateTime.tryParse(dob);
        if (birthDate != null) {
          final age = DateTime.now().difference(birthDate).inDays ~/ 365;
          if ((ageMin == null || age >= ageMin) &&
              (ageMax == null || age <= ageMax)) matched++;
        }
      }
    }

    final country = criteria['country'] as String?;
    if (country != null && country.isNotEmpty) {
      total++;
      final userCountry = (profile['country'] as String? ?? '').toLowerCase();
      if (userCountry == country.toLowerCase()) matched++;
    }

    final edu = criteria['educationLevel'] as String?;
    if (edu != null && edu.isNotEmpty) {
      total++;
      final userEdu = (profile['education'] as String? ?? '').toLowerCase();
      const eduMap = {
        'HIGH_SCHOOL': 'high school',
        'BACHELORS_DEGREE': "bachelor's degree",
        'MASTERS_DEGREE': "master's degree",
        'PHD': 'phd',
      };
      final mapped = (eduMap[edu] ?? edu.replaceAll('_', ' ')).toLowerCase();
      if (userEdu == mapped) matched++;
    }

    final gender = criteria['gender'] as String?;
    if (gender != null && gender.isNotEmpty) {
      total++;
      final userGender = (profile['gender'] as String? ?? '').toLowerCase();
      if (userGender == gender.toLowerCase()) matched++;
    }

    if (total == 0) return -1;
    return ((matched / total) * 100).round();
  }

  @override
  Widget build(BuildContext context) {
    if (!_profileLoaded) {
      return const Center(child: CircularProgressIndicator());
    }

    final visible = widget.surveys.where((s) {
      final score = _scores[s.studyId];
      if (score == null) return true; // still loading
      if (score == -1) return true; // no criteria = open to all
      return score >= 70;
    }).toList();

    if (visible.isEmpty && _scores.length == widget.surveys.length) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.search_off, size: 64, color: AppTheme.textTertiary),
            SizedBox(height: 16),
            Text('No matching surveys.',
                style: TextStyle(
                    fontSize: 16,
                    color: AppTheme.textSecondary,
                    fontWeight: FontWeight.w600)),
            SizedBox(height: 8),
            Text('Surveys need at least 70% profile match.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppTheme.textTertiary)),
          ]),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: visible.length,
      itemBuilder: (context, index) {
        final survey = visible[index];
        final score = _scores[survey.studyId];
        return _BrowseCard(survey: survey, matchScore: score);
      },
    );
  }
}

// ─────────────────────────────────────────────────────────
// BROWSE CARD
// ─────────────────────────────────────────────────────────
class _BrowseCard extends StatelessWidget {
  final Study survey;
  final int? matchScore;
  const _BrowseCard({required this.survey, this.matchScore});

  Color _scoreColor(int score) {
    if (score >= 90) return const Color(0xFF059669);
    if (score >= 70) return AppTheme.primary;
    return AppTheme.textSecondary;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.surfaceHigh, width: 1.5)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
                color: const Color(0xFFD1FAE5),
                borderRadius: BorderRadius.circular(9999)),
            child: Text(survey.studyStatus,
                style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF059669),
                    letterSpacing: 1)),
          ),
          const Spacer(),
          // ── Match score badge ──────────────────────
          if (matchScore == null)
            const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2))
          else if (matchScore == -1)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                  color: AppTheme.primaryContainer,
                  borderRadius: BorderRadius.circular(9999)),
              child: const Row(children: [
                Icon(Icons.public, size: 12, color: AppTheme.primary),
                SizedBox(width: 4),
                Text('Open to all',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary)),
              ]),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                  color: _scoreColor(matchScore!).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(9999)),
              child: Row(children: [
                Icon(Icons.person_pin,
                    size: 12, color: _scoreColor(matchScore!)),
                const SizedBox(width: 4),
                Text('$matchScore% match',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _scoreColor(matchScore!))),
              ]),
            ),
        ]),
        const SizedBox(height: 12),
        Text(survey.title,
            style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppTheme.textPrimary)),
        const SizedBox(height: 4),
        Text(survey.description ?? 'No description.',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style:
                const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
        const SizedBox(height: 12),
        Row(children: [
          const Icon(Icons.layers_outlined,
              size: 14, color: AppTheme.textTertiary),
          const SizedBox(width: 4),
          Text('${survey.phaseCount} PHASES',
              style:
                  const TextStyle(fontSize: 12, color: AppTheme.textTertiary)),
          const SizedBox(width: 16),
          const Icon(Icons.attach_money, size: 14, color: AppTheme.primary),
          const SizedBox(width: 2),
          Text('\$${survey.totalBudget.toStringAsFixed(0)}',
              style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.primary,
                  fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () =>
                  context.push('/surveys/participant-detail', extra: survey),
              style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.textPrimary,
                  side: const BorderSide(color: AppTheme.surfaceHigh),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
              child: const Text('Details'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () =>
                  context.push('/surveys/participant-detail', extra: survey),
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
              child: const Text('Participate'),
            ),
          ),
        ]),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────
// MY SURVEY CARD
// ─────────────────────────────────────────────────────────
class _MySurveyCard extends StatelessWidget {
  final Study survey;
  final String dateString;
  final VoidCallback onTap;
  const _MySurveyCard(
      {required this.survey, required this.dateString, required this.onTap});

  Color _statusColor() {
    switch (survey.studyStatus) {
      case 'DRAFT':
        return AppTheme.textSecondary;
      case 'PUBLISHED':
        return AppTheme.primary;
      case 'ACTIVE':
        return AppTheme.successColor;
      case 'COMPLETED':
        return const Color(0xFF059669);
      default:
        return AppTheme.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final expired = survey.isExpired;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppTheme.ambientShadow),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                  color: _statusColor().withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6)),
              child: Text(survey.studyStatus,
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: _statusColor(),
                      letterSpacing: 1)),
            ),
            const SizedBox(width: 8),
            if (expired)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                    color: AppTheme.errorColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6)),
                child: const Row(children: [
                  Icon(Icons.timer_off_outlined,
                      size: 11, color: AppTheme.errorColor),
                  SizedBox(width: 3),
                  Text('EXPIRED',
                      style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.errorColor,
                          letterSpacing: 1)),
                ]),
              ),
            const Spacer(),
            Text(dateString,
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textTertiary)),
          ]),
          const SizedBox(height: 12),
          Text(survey.title,
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary)),
          if (survey.endDate != null) ...[
            const SizedBox(height: 6),
            Row(children: [
              Icon(expired ? Icons.timer_off_outlined : Icons.timer_outlined,
                  size: 13,
                  color: expired ? AppTheme.errorColor : AppTheme.textTertiary),
              const SizedBox(width: 4),
              Text(
                  expired
                      ? 'Expired ${survey.endDate!.day}/${survey.endDate!.month}/${survey.endDate!.year}'
                      : 'Expires ${survey.endDate!.day}/${survey.endDate!.month}/${survey.endDate!.year}',
                  style: TextStyle(
                      fontSize: 12,
                      color: expired
                          ? AppTheme.errorColor
                          : AppTheme.textTertiary)),
            ]),
          ],
          const SizedBox(height: 8),
          Row(children: [
            const Icon(Icons.layers_outlined,
                size: 14, color: AppTheme.textTertiary),
            const SizedBox(width: 4),
            Text('${survey.phaseCount} PHASES',
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textTertiary)),
            const SizedBox(width: 16),
            const Icon(Icons.monetization_on_outlined,
                size: 14, color: AppTheme.primary),
            const SizedBox(width: 4),
            Text('\$${survey.totalBudget.toStringAsFixed(0)} BUDGET',
                style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.primary,
                    fontWeight: FontWeight.bold)),
          ]),
        ]),
      ),
    );
  }
}
