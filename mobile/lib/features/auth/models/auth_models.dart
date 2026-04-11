class LoginRequest {
  final String email;
  final String password;
  LoginRequest({required this.email, required this.password});
  Map<String, dynamic> toJson() => {'email': email, 'password': password};
}

class RegisterRequest {
  final String firstname;
  final String lastname;
  final String email;
  final String password;
  RegisterRequest({
    required this.firstname,
    required this.lastname,
    required this.email,
    required this.password,
  });
  Map<String, dynamic> toJson() => {
        'firstname': firstname,
        'lastname': lastname,
        'email': email,
        'password': password,
      };
}

class User {
  final String userId;
  final String firstname;
  final String lastname;
  final String email;
  final bool isActive;
  final String? profilePictureUrl;

  User({
    required this.userId,
    required this.firstname,
    required this.lastname,
    required this.email,
    this.isActive = true,
    this.profilePictureUrl,
  });

  // For register response: { accessToken, refreshToken, userId }
  factory User.fromRegisterResponse(Map<String, dynamic> json, String firstname,
      String lastname, String email) {
    return User(
      userId: json['userId'] ?? '',
      firstname: firstname,
      lastname: lastname,
      email: email,
      isActive: true,
    );
  }

  // For login response: { accessToken, refreshToken, user: { userId } }
  factory User.fromLoginResponse(Map<String, dynamic> json) {
    final userMap = json['user'] as Map<String, dynamic>? ?? {};
    return User(
      userId: userMap['userId'] ?? '',
      firstname: '',
      lastname: '',
      email: '',
      isActive: true,
    );
  }
}
