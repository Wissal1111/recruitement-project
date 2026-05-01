class Study {
  final String studyId;
  final String title;
  final String? description;
  final String studyStatus;
  final String studyCategory;
  final int phaseCount;
  final DateTime updatedAt;

  // 🚨 NEW FIELDS TO HOLD THE ACTUAL DATA FOR EDITING
  final double totalBudget;
  final List<dynamic> phases;

  Study({
    required this.studyId,
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
    return Study(
      studyId: json['studyId'] ?? '',
      title: json['title'] ?? 'Untitled Survey',
      description: json['description'],
      studyStatus: json['studyStatus'] ?? 'DRAFT',
      studyCategory: json['studyCategory'] ?? 'SURVEY',
      phaseCount: (json['phases'] as List?)?.length ?? 0,
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
      // 🚨 PARSE THE NEW FIELDS
      totalBudget:
          double.tryParse(json['totalBudget']?.toString() ?? '0') ?? 0.0,
      phases: json['phases'] as List<dynamic>? ?? [],
    );
  }
}
