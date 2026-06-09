class UserProfile {
  final String profileId;
  final String userId;
  final String? firstname; // ✅ ADD
  final String? lastname; // ✅ ADD
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
    this.firstname, // ✅ ADD
    this.lastname, // ✅ ADD
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
    // ✅ Profile can be nested or flat
    final profile = json['profile'] as Map<String, dynamic>? ?? json;

    return UserProfile(
      profileId: profile['profileId'] ?? json['profileId'] ?? '',
      userId: json['userId'] ?? profile['userId'] ?? '',
      firstname: json['firstname'], // ✅ from parent
      lastname: json['lastname'], // ✅ from parent
      age: profile['age'],
      gender: profile['gender'],
      dateOfBirth: profile['dateOfBirth'] != null
          ? DateTime.tryParse(profile['dateOfBirth'])
          : null,
      education: profile['education'],
      profession: profile['profession'],
      country: profile['country'],
      city: profile['city'],
      bio: profile['bio'],
      profilePictureUrl:
          json['profilePictureUrl'] ?? profile['profilePictureUrl'],
      totalEarnings:
          double.tryParse(profile['totalEarnings']?.toString() ?? '0') ?? 0,
      completionScore: profile['completionScore'] ?? 0,
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
