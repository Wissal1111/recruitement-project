import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Core palette
  static const primary = Color(0xFF4A4BD7);
  static const primaryLight = Color(0xFF7073FF);
  static const primaryContainer = Color(0xFFE8E8FF);
  static const surfaceBase = Color(0xFFF7F9FE);
  static const surfaceLowest = Color(0xFFFFFFFF);
  static const surfaceLow = Color(0xFFF0F4FA);
  static const surfaceHigh = Color(0xFFE3E9F1);
  static const textPrimary = Color(0xFF0D0D1A);
  static const textSecondary = Color(0xFF6B7A99);
  static const textTertiary = Color(0xFFABB3BC);
  static const successColor = Color(0xFF10B981);
  static const errorColor = Color(0xFFEF4444);

  // Aliases — old screen files reference these names
  static const primaryColor = primary;
  static const backgroundColor = surfaceBase;
  // Signature gradient for primary buttons
  static const primaryGradient = LinearGradient(
    colors: [primary, primaryLight],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // Ambient shadow (uses primary tint, not black)
  static List<BoxShadow> get ambientShadow => [
        BoxShadow(
          color: primary.withOpacity(0.08),
          blurRadius: 40,
          offset: const Offset(0, 20),
        ),
      ];

  static List<BoxShadow> get focusShadow => [
        BoxShadow(
          color: primary.withOpacity(0.15),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ];

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: primary,
          background: surfaceBase,
        ),
        scaffoldBackgroundColor: surfaceBase,
        textTheme: GoogleFonts.plusJakartaSansTextTheme().apply(
          bodyColor: textPrimary,
          displayColor: textPrimary,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: surfaceBase,
          elevation: 0,
          iconTheme: IconThemeData(color: textPrimary),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: surfaceLow,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: primary, width: 2),
          ),
          hintStyle: const TextStyle(color: textTertiary, fontSize: 15),
        ),
        cardTheme: CardThemeData(
          color: surfaceLowest,
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: surfaceLowest,
          selectedItemColor: primary,
          unselectedItemColor: textTertiary,
          elevation: 0,
        ),
      );
}
