class RegistrationState {
  final String firstname;
  final String lastname;
  final String email;
  final String password;
  final String? gender;
  final List<String> interests;
  final String? profession;
  final String? education;
  final String? country;
  final String? city;
  final String? socialPlatform;
  final String? usageFrequency;
  final DateTime? dateOfBirth; // ← NEW

  const RegistrationState({
    this.firstname = '',
    this.lastname = '',
    this.email = '',
    this.password = '',
    this.gender,
    this.interests = const [],
    this.profession,
    this.education,
    this.country,
    this.city,
    this.socialPlatform,
    this.usageFrequency,
    this.dateOfBirth, // ← NEW
  });

  RegistrationState copyWith({
    String? firstname,
    String? lastname,
    String? email,
    String? password,
    String? gender,
    List<String>? interests,
    String? profession,
    String? education,
    String? country,
    String? city,
    String? socialPlatform,
    String? usageFrequency,
    DateTime? dateOfBirth, // ← NEW
  }) {
    return RegistrationState(
      firstname: firstname ?? this.firstname,
      lastname: lastname ?? this.lastname,
      email: email ?? this.email,
      password: password ?? this.password,
      gender: gender ?? this.gender,
      interests: interests ?? this.interests,
      profession: profession ?? this.profession,
      education: education ?? this.education,
      country: country ?? this.country,
      city: city ?? this.city,
      socialPlatform: socialPlatform ?? this.socialPlatform,
      usageFrequency: usageFrequency ?? this.usageFrequency,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth, // ← NEW
    );
  }
}
