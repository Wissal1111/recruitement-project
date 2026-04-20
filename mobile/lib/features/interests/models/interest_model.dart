class Interest {
  final String interestId;
  final String name;
  final String? description;

  Interest({
    required this.interestId,
    required this.name,
    this.description,
  });

  factory Interest.fromJson(Map<String, dynamic> json) => Interest(
        interestId: json['interestId'] ?? json['id'] ?? '',
        name: json['name'] ?? '',
        description: json['description'],
      );
}

class UserInterest {
  final String id;
  final String interestId;
  final String name;

  UserInterest({
    required this.id,
    required this.interestId,
    required this.name,
  });

  factory UserInterest.fromJson(Map<String, dynamic> json) {
    // Handle nested interest object or flat structure
    final interest = json['interest'] as Map<String, dynamic>?;
    return UserInterest(
      id: json['id'] ?? '',
      interestId: interest?['interestId'] ?? json['interestId'] ?? '',
      name: interest?['name'] ?? json['name'] ?? '',
    );
  }
}
