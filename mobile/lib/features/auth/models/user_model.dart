class UserModel {
  final String userId;
  final String firstname;
  final String lastname;
  final String email;
  final bool isActive;
  final String? profilePictureUrl;
  final DateTime? lastLogin;
  final DateTime createdAt;

  UserModel({
    required this.userId,
    required this.firstname,
    required this.lastname,
    required this.email,
    required this.isActive,
    this.profilePictureUrl,
    this.lastLogin,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userId: json['userId'] ?? '',
      firstname: json['firstname'] ?? '',
      lastname: json['lastname'] ?? '',
      email: json['email'] ?? '',
      isActive: json['isActive'] ?? false,
      profilePictureUrl: json['profilePictureUrl'],
      lastLogin: json['lastLogin'] != null
          ? DateTime.parse(json['lastLogin'])
          : null,
      createdAt: DateTime.parse(
          json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'firstname': firstname,
    'lastname': lastname,
    'email': email,
    'isActive': isActive,
    'profilePictureUrl': profilePictureUrl,
  };

  String get fullName => '$firstname $lastname';
}