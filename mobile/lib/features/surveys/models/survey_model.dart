class Study {
  final String studyId;
  final String creatorId;
  final String title;
  final String? description;
  final String studyStatus;
  final String studyCategory;
  final int phaseCount;
  final DateTime updatedAt;
  final double totalBudget;
  final List<dynamic> phases;
  final DateTime? endDate; // ← NEW

  Study({
    required this.studyId,
    required this.creatorId,
    required this.title,
    this.description,
    required this.studyStatus,
    required this.studyCategory,
    required this.phaseCount,
    required this.updatedAt,
    required this.totalBudget,
    required this.phases,
    this.endDate, // ← NEW
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

    return Study(
      studyId: json['studyId'] ?? '',
      creatorId: json['creatorId'] ?? '',
      title: json['title'] ?? 'Untitled Survey',
      description: json['description'],
      studyStatus: json['studyStatus'] ?? 'DRAFT',
      studyCategory: json['studyCategory'] ?? 'SURVEY',
      phaseCount: (json['phases'] as List?)?.length ?? 0,
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
      totalBudget: parseBudget(json['totalBudget']),
      phases: json['phases'] as List<dynamic>? ?? [],
      endDate: json['endDate'] != null // ← NEW
          ? DateTime.tryParse(json['endDate'])
          : null,
    );
  }
}
