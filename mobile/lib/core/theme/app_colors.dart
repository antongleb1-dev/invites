import 'package:flutter/material.dart';

class AppColors {
  // Primary colors - elegant gold/champagne
  static const Color primary = Color.fromARGB(255, 212, 175, 55);
  static const Color primaryLight = Color.fromARGB(255, 240, 215, 140);
  static const Color primaryDark = Color.fromARGB(255, 170, 140, 45);
  
  // Accent colors
  static const Color accent = Color.fromARGB(255, 45, 45, 45);
  static const Color accentLight = Color.fromARGB(255, 80, 80, 80);
  
  // Background colors
  static const Color background = Color.fromARGB(255, 255, 252, 245);
  static const Color surface = Color.fromARGB(255, 255, 255, 255);
  static const Color card = Color.fromARGB(255, 255, 255, 255);
  
  // Text colors
  static const Color textPrimary = Color.fromARGB(255, 35, 35, 35);
  static const Color textSecondary = Color.fromARGB(255, 100, 100, 100);
  static const Color textMuted = Color.fromARGB(255, 150, 150, 150);
  static const Color textOnPrimary = Color.fromARGB(255, 255, 255, 255);
  
  // Status colors
  static const Color success = Color.fromARGB(255, 76, 175, 80);
  static const Color error = Color.fromARGB(255, 244, 67, 54);
  static const Color warning = Color.fromARGB(255, 255, 152, 0);
  static const Color info = Color.fromARGB(255, 33, 150, 243);
  
  // Border & Divider
  static const Color border = Color.fromARGB(255, 230, 230, 230);
  static const Color divider = Color.fromARGB(255, 240, 240, 240);
  
  // Gradient
  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color.fromARGB(255, 255, 252, 245),
      Color.fromARGB(255, 255, 248, 235),
    ],
  );
  
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color.fromARGB(255, 240, 215, 140),
      Color.fromARGB(255, 212, 175, 55),
    ],
  );
}
