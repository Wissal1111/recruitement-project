class UserProfile {
  final String profileId;
  final String userId;
  final int? age;
  final String? gender;
  final DateTime? dateOfBirth;
  final String? education;
  final String? profession;
  final String? country;
  final String? city;
  final String? bio;
  final String? profilePictureUrl;
  final double totalEarnings;
  final int completionScore;

  UserProfile({
    required this.profileId,
    required this.userId,
    this.age,
    this.gender,
    this.dateOfBirth,
    this.education,
    this.profession,
    this.country,
    this.city,
    this.bio,
    this.profilePictureUrl,
    this.totalEarnings = 0,
    this.completionScore = 0,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      profileId: json['profileId'] ?? '',
      userId: json['userId'] ?? '',
      age: json['age'],
      gender: json['gender'],
      dateOfBirth: json['dateOfBirth'] != null
          ? DateTime.tryParse(json['dateOfBirth'])
          : null,
      education: json['education'],
      profession: json['profession'],
      country: json['country'],
      city: json['city'],
      bio: json['bio'],
      profilePictureUrl: json['profilePictureUrl'],
      totalEarnings:
          double.tryParse(json['totalEarnings']?.toString() ?? '0') ?? 0,
      completionScore: json['completionScore'] ?? 0,
    );
  }

  Map<String, dynamic> toUpdateJson() {
    final map = <String, dynamic>{};
    if (age != null) map['age'] = age;
    if (gender != null) map['gender'] = gender;
    if (dateOfBirth != null) {
      map['dateOfBirth'] = dateOfBirth!.toIso8601String();
    }
    if (education != null) map['education'] = education;
    if (profession != null) map['profession'] = profession;
    if (country != null) map['country'] = country;
    if (city != null) map['city'] = city;
    if (bio != null) map['bio'] = bio;
    return map;
  }
}
