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
  });

  factory Study.fromJson(Map<String, dynamic> json) {
    // MongoDB Decimal128 comes as either a number, a string, or { "$numberDecimal": "1200" }
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
    );
  }
}
