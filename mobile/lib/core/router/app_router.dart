import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/shell/presentation/screens/shell_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/preview/presentation/screens/preview_screen.dart';
import '../../features/tokens/presentation/screens/buy_tokens_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/manage/presentation/screens/manage_invitation_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull != null;
      final isLoggingIn = state.matchedLocation == '/login';
      
      if (!isLoggedIn && !isLoggingIn) {
        return '/login';
      }
      
      if (isLoggedIn && isLoggingIn) {
        return '/';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      // Manage invitation (outside shell — no bottom nav)
      GoRoute(
        path: '/manage/:id',
        builder: (context, state) {
          final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
          return ManageInvitationScreen(invitationId: id);
        },
      ),
      ShellRoute(
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/preview',
            builder: (context, state) {
              final invitationId = state.extra as String?;
              return PreviewScreen(invitationId: invitationId);
            },
          ),
          GoRoute(
            path: '/tokens',
            builder: (context, state) => const BuyTokensScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
