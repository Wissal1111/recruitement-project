class Study {
  final String studyId;
  final String creatorId;
  final String creatorName; // ✅ ADD THIS
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
    this.creatorName = '', // ✅ ADD THIS
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

    // ✅ Try to get creator name from response
    final creatorInfo = json['creator'] as Map<String, dynamic>?;
    final creatorName = creatorInfo != null
        ? '${creatorInfo['firstname'] ?? ''} ${creatorInfo['lastname'] ?? ''}'
            .trim()
        : (json['creatorName'] as String? ?? '');

    return Study(
      studyId: json['studyId'] ?? '',
      creatorId: json['creatorId'] ?? '',
      creatorName: creatorName, // ✅ ADD THIS
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
