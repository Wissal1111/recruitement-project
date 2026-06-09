class Study {
  final String studyId;
  final String creatorId;
  final String creatorName;
  final String title;
  final String? description;
  final String studyStatus;
  final String studyCategory;
  final int phaseCount;
  final DateTime updatedAt;
  final double totalBudget;
  final List<dynamic> phases;
  final DateTime? endDate;

  Study({
    required this.studyId,
    required this.creatorId,
    this.creatorName = '',
    required this.title,
    this.description,
    required this.studyStatus,
    required this.studyCategory,
    required this.phaseCount,
    required this.updatedAt,
    required this.totalBudget,
    required this.phases,
    this.endDate,
  });

  bool get isExpired {
    if (endDate == null) return false;
    return DateTime.now().isAfter(endDate!);
  }

  // ✅ Total reward a participant earns across all phases
  double get rewardPerParticipant {
    double total = 0;
    for (final phase in phases) {
      final raw = phase['rewardAmount'];
      if (raw is num) {
        total += raw.toDouble();
      } else if (raw is Map && raw['\$numberDecimal'] != null) {
        total += double.tryParse(raw['\$numberDecimal'].toString()) ?? 0;
      }
    }
    return total;
  }

  // ✅ Max participants from first phase
  int get maxParticipants {
    if (phases.isEmpty) return 0;
    return (phases[0]['maxParticipants'] as num?)?.toInt() ?? 0;
  }

  factory Study.fromJson(Map<String, dynamic> json) {
    double parseBudget(dynamic raw) {
      if (raw == null) return 0.0;
      if (raw is num) return raw.toDouble();
      if (raw is String) return double.tryParse(raw) ?? 0.0;
      if (raw is Map && raw['\$numberDecimal'] != null) {
        return double.tryParse(raw['\$numberDecimal'].toString()) ?? 0.0;
      }
      return 0.0;
    }

    final creatorInfo = json['creator'] as Map<String, dynamic>?;
    final creatorName = creatorInfo != null
        ? '${creatorInfo['firstname'] ?? ''} ${creatorInfo['lastname'] ?? ''}'
            .trim()
        : (json['creatorName'] as String? ?? '');

    return Study(
      studyId: json['studyId'] ?? '',
      creatorId: json['creatorId'] ?? '',
      creatorName: creatorName,
      title: json['title'] ?? 'Untitled Survey',
      description: json['description'],
      studyStatus: json['studyStatus'] ?? 'DRAFT',
      studyCategory: json['studyCategory'] ?? 'SURVEY',
      phaseCount: (json['phases'] as List?)?.length ?? 0,
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
      totalBudget: parseBudget(json['totalBudget']),
      phases: json['phases'] as List<dynamic>? ?? [],
      endDate:
          json['endDate'] != null ? DateTime.tryParse(json['endDate']) : null,
    );
  }
}
