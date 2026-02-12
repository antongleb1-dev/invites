import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_provider.dart';
import '../services/iap_service.dart';

/// AI Package info model
class PackageStatus {
  final bool hasPackage;
  final String? packageName; // 'start', 'pro', 'unlimited'
  final int editsLimit;
  final int editsUsed;
  final int editsRemaining;

  const PackageStatus({
    this.hasPackage = false,
    this.packageName,
    this.editsLimit = 0,
    this.editsUsed = 0,
    this.editsRemaining = 0,
  });

  factory PackageStatus.fromJson(Map<String, dynamic> json) {
    return PackageStatus(
      hasPackage: json['hasPackage'] as bool? ?? false,
      packageName: json['package'] as String?,
      editsLimit: json['editsLimit'] as int? ?? 0,
      editsUsed: json['editsUsed'] as int? ?? 0,
      editsRemaining: json['editsRemaining'] as int? ?? 0,
    );
  }

  String get displayName {
    switch (packageName) {
      case 'start':
        return 'Start';
      case 'pro':
        return 'Pro';
      case 'unlimited':
        return 'Unlimited';
      default:
        return 'Free';
    }
  }
}

/// AI packages — prices come from the store (auto-localized currency)
class AIPackage {
  final String id;
  final String name;
  final int edits;
  final String storeProductId; // Maps to App Store / Google Play product
  final bool isPopular;

  const AIPackage({
    required this.id,
    required this.name,
    required this.edits,
    required this.storeProductId,
    this.isPopular = false,
  });
}

/// Available AI packages (prices loaded from store)
const aiPackages = [
  AIPackage(
    id: 'start',
    name: 'Start',
    edits: 15,
    storeProductId: IAPProductIds.packageStart,
  ),
  AIPackage(
    id: 'pro',
    name: 'Pro',
    edits: 50,
    storeProductId: IAPProductIds.packagePro,
    isPopular: true,
  ),
  AIPackage(
    id: 'unlimited',
    name: 'Unlimited',
    edits: 200,
    storeProductId: IAPProductIds.packageUnlimited,
  ),
];

/// Available topup options (prices loaded from store)
const aiTopups = [
  AIPackage(
    id: 'small',
    name: '+10 Edits',
    edits: 10,
    storeProductId: IAPProductIds.topup10,
  ),
  AIPackage(
    id: 'medium',
    name: '+30 Edits',
    edits: 30,
    storeProductId: IAPProductIds.topup30,
  ),
];

/// Legacy token balance (mapped to edits remaining)
final tokenBalanceNotifierProvider = StateNotifierProvider<TokenBalanceNotifier, int>((ref) {
  return TokenBalanceNotifier(ref);
});

class TokenBalanceNotifier extends StateNotifier<int> {
  final Ref _ref;

  TokenBalanceNotifier(this._ref) : super(1); // 1 free message by default

  Future<void> refresh() async {
    // Edits remaining is managed per-invitation on the backend
    state = state; // Trigger rebuild
  }

  void setEditsRemaining(int count) {
    state = count;
  }
}
