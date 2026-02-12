import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/providers/tokens_provider.dart';
import '../../../../core/services/iap_service.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../home/providers/chat_provider.dart';

class BuyTokensScreen extends ConsumerWidget {
  const BuyTokensScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final iapState = ref.watch(iapServiceProvider);

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

                const SizedBox(height: 8),

                Text(
                  l10n.choosePackageSubtitle,
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ).animate().fadeIn(delay: 100.ms, duration: 400.ms),

                const SizedBox(height: 24),

                // How it works
                _buildHowItWorks(l10n).animate().fadeIn(delay: 200.ms, duration: 400.ms),

                const SizedBox(height: 24),

                // AI Packages
                Text(
                  l10n.aiPackagesTitle,
                  style: AppTypography.headlineMedium,
                ).animate().fadeIn(delay: 300.ms, duration: 400.ms),

                const SizedBox(height: 16),

                ...aiPackages.asMap().entries.map((entry) {
                  final index = entry.key;
                  final package = entry.value;
                  return _PackageCard(
                    package: package,
                    price: iapState.getPrice(package.storeProductId),
                    l10n: l10n,
                    onBuy: () => _purchasePackage(context, ref, package, l10n),
                  ).animate().fadeIn(
                        delay: Duration(milliseconds: 400 + (index * 100)),
                        duration: 400.ms,
                      ).slideY(begin: 0.1, end: 0);
                }),

                const SizedBox(height: 24),

                // Topups
                Text(
                  l10n.needMoreEdits,
                  style: AppTypography.headlineMedium,
                ).animate().fadeIn(delay: 700.ms, duration: 400.ms),

                const SizedBox(height: 16),

                ...aiTopups.asMap().entries.map((entry) {
                  final index = entry.key;
                  final topup = entry.value;
                  return _TopupCard(
                    topup: topup,
                    price: iapState.getPrice(topup.storeProductId),
                    l10n: l10n,
                    onBuy: () => _purchaseTopup(context, ref, topup, l10n),
                  ).animate().fadeIn(
                        delay: Duration(milliseconds: 800 + (index * 100)),
                        duration: 400.ms,
                      ).slideY(begin: 0.1, end: 0);
                }),

                const SizedBox(height: 16),

                // Restore purchases button
                Center(
                  child: TextButton(
                    onPressed: () => _restorePurchases(context, ref, l10n),
                    child: Text(
                      l10n.restorePurchases,
                      style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                    ),
                  ),
                ).animate().fadeIn(delay: 1000.ms, duration: 400.ms),

                // Purchase status indicator
                if (iapState.purchaseState == IAPPurchaseState.purchasing)
                  _buildPurchasingOverlay(l10n),

                if (iapState.purchaseState == IAPPurchaseState.success)
                  _buildSuccessMessage(l10n),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHowItWorks(AppLocalizations l10n) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.howPackagesWork, style: AppTypography.titleMedium),
          const SizedBox(height: 12),
          _buildStep('1', l10n.packagesStep1),
          const SizedBox(height: 8),
          _buildStep('2', l10n.packagesStep2),
          const SizedBox(height: 8),
          _buildStep('3', l10n.packagesStep3),
        ],
      ),
    );
  }

  Widget _buildStep(String number, String text) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Text(
              number,
              style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(text, style: AppTypography.bodyMedium),
        ),
      ],
    );
  }

  Widget _buildPurchasingOverlay(AppLocalizations l10n) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const SizedBox(
            width: 20, height: 20,
            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Text(l10n.purchasePending, style: AppTypography.bodyMedium),
        ],
      ),
    );
  }

  Widget _buildSuccessMessage(AppLocalizations l10n) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 20),
          const SizedBox(width: 12),
          Text(l10n.purchaseSuccess,
              style: AppTypography.bodyMedium.copyWith(color: Colors.green)),
        ],
      ),
    );
  }

  void _purchasePackage(BuildContext context, WidgetRef ref, AIPackage package, AppLocalizations l10n) async {
    final savedId = ref.read(savedInvitationIdProvider);
    if (savedId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.createInvitationFirst),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    final iapService = ref.read(iapServiceProvider.notifier);
    iapService.onPurchaseSuccess = () {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.purchaseSuccess),
            backgroundColor: Colors.green,
          ),
        );
      }
    };

    final success = await iapService.purchaseProduct(
      package.storeProductId,
      weddingId: savedId,
    );

    if (!success && context.mounted) {
      final iapState = ref.read(iapServiceProvider);
      if (iapState.purchaseState == IAPPurchaseState.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.purchaseError),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _purchaseTopup(BuildContext context, WidgetRef ref, AIPackage topup, AppLocalizations l10n) async {
    final savedId = ref.read(savedInvitationIdProvider);
    if (savedId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.createInvitationFirst),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    final iapService = ref.read(iapServiceProvider.notifier);
    iapService.onPurchaseSuccess = () {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.purchaseSuccess),
            backgroundColor: Colors.green,
          ),
        );
      }
    };

    final success = await iapService.purchaseProduct(
      topup.storeProductId,
      weddingId: savedId,
    );

    if (!success && context.mounted) {
      final iapState = ref.read(iapServiceProvider);
      if (iapState.purchaseState == IAPPurchaseState.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.purchaseError),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _restorePurchases(BuildContext context, WidgetRef ref, AppLocalizations l10n) async {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.restoringPurchases)),
    );

    final iapService = ref.read(iapServiceProvider.notifier);
    await iapService.restorePurchases();

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.purchasesRestored)),
      );
    }
  }
}

class _PackageCard extends StatelessWidget {
  final AIPackage package;
  final String? price;
  final AppLocalizations l10n;
  final VoidCallback onBuy;

  const _PackageCard({
    required this.package,
    required this.price,
    required this.l10n,
    required this.onBuy,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: package.isPopular
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
                    gradient: package.isPopular
                        ? AppColors.primaryGradient
                        : null,
                    color: package.isPopular ? null : AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '${package.edits}',
                        style: AppTypography.titleMedium.copyWith(
                          color: package.isPopular ? Colors.white : AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        l10n.editsUnit,
                        style: AppTypography.bodySmall.copyWith(
                          color: package.isPopular
                              ? Colors.white.withOpacity(0.8)
                              : AppColors.primary,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        package.name,
                        style: AppTypography.titleMedium,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        price ?? l10n.priceNotAvailable,
                        style: AppTypography.headlineSmall.copyWith(
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
                  child: Text(l10n.buy),
                ),
              ],
            ),
          ),
          if (package.isPopular)
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
                  l10n.popular,
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

class _TopupCard extends StatelessWidget {
  final AIPackage topup;
  final String? price;
  final AppLocalizations l10n;
  final VoidCallback onBuy;

  const _TopupCard({
    required this.topup,
    required this.price,
    required this.l10n,
    required this.onBuy,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.add_circle_outline, color: AppColors.primary, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '${topup.name} — ${price ?? l10n.priceNotAvailable}',
                style: AppTypography.titleSmall,
              ),
            ),
            OutlinedButton(
              onPressed: onBuy,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
              child: Text(l10n.add),
            ),
          ],
        ),
      ),
    );
  }
}
