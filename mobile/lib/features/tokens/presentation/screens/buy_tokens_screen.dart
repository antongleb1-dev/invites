import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/providers/tokens_provider.dart';
import '../../../../l10n/app_localizations.dart';

class BuyTokensScreen extends ConsumerWidget {
  const BuyTokensScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final tokenBalance = ref.watch(tokenBalanceNotifierProvider);

    final packages = [
      {'tokens': 10, 'price': '\$0.99', 'popular': false},
      {'tokens': 50, 'price': '\$3.99', 'popular': true},
      {'tokens': 100, 'price': '\$6.99', 'popular': false},
      {'tokens': 500, 'price': '\$29.99', 'popular': false},
    ];

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.buyTokens,
                  style: AppTypography.headlineLarge,
                ).animate().fadeIn(duration: 400.ms),
                
                const SizedBox(height: 24),
                
                // Current balance card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        l10n.tokenBalance,
                        style: AppTypography.titleMedium.copyWith(
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.token, color: Colors.white, size: 32),
                          const SizedBox(width: 8),
                          Text(
                            '$tokenBalance',
                            style: AppTypography.displayMedium.copyWith(
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 200.ms, duration: 400.ms).scale(begin: const Offset(0.95, 0.95)),
                
                const SizedBox(height: 32),
                
                // Token packages
                ...packages.asMap().entries.map((entry) {
                  final index = entry.key;
                  final package = entry.value;
                  return _TokenPackageCard(
                    tokens: package['tokens'] as int,
                    price: package['price'] as String,
                    isPopular: package['popular'] as bool,
                    onBuy: () {
                      // TODO: Handle purchase
                    },
                  ).animate().fadeIn(
                    delay: Duration(milliseconds: 300 + (index * 100)),
                    duration: 400.ms,
                  ).slideY(begin: 0.1, end: 0);
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TokenPackageCard extends StatelessWidget {
  final int tokens;
  final String price;
  final bool isPopular;
  final VoidCallback onBuy;
  
  const _TokenPackageCard({
    required this.tokens,
    required this.price,
    required this.isPopular,
    required this.onBuy,
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: isPopular
            ? Border.all(color: AppColors.primary, width: 2)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.token, color: AppColors.primary, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$tokens Tokens',
                        style: AppTypography.titleMedium,
                      ),
                      Text(
                        price,
                        style: AppTypography.headlineMedium.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: onBuy,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('Buy'),
                ),
              ],
            ),
          ),
          if (isPopular)
            Positioned(
              top: 0,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(8),
                    bottomRight: Radius.circular(8),
                  ),
                ),
                child: Text(
                  'POPULAR',
                  style: AppTypography.labelSmall.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
