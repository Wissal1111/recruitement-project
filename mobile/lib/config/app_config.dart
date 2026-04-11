import 'local_config.dart';

class AppConfig {
  static String get baseUrl =>
      'http://${LocalConfig.backendIp}:${LocalConfig.backendPort}';
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 15000;
}
