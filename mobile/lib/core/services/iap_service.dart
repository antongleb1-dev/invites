import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../providers/api_provider.dart';
import '../providers/tokens_provider.dart';

/// Product IDs — must match App Store Connect / Google Play Console
class IAPProductIds {
  static const String packageStart = 'invites_ai_start';
  static const String packagePro = 'invites_ai_pro';
  static const String packageUnlimited = 'invites_ai_unlimited';
  static const String topup10 = 'invites_ai_topup_10';
  static const String topup30 = 'invites_ai_topup_30';
  static const String publish = 'invites_ai_publish';

  static const Set<String> allProductIds = {
    packageStart,
    packagePro,
    packageUnlimited,
    topup10,
    topup30,
    publish,
  };

  /// Map from product ID to our internal package/topup ID
  static String toInternalId(String productId) {
    switch (productId) {
      case packageStart:
        return 'start';
      case packagePro:
        return 'pro';
      case packageUnlimited:
        return 'unlimited';
      case topup10:
        return 'small';
      case topup30:
        return 'medium';
      case publish:
        return 'publish';
      default:
        return productId;
    }
  }

  static const Set<String> packageIds = {
    packageStart,
    packagePro,
    packageUnlimited,
  };

  static const Set<String> topupIds = {
    topup10,
    topup30,
  };
}

/// IAP purchase state
enum IAPPurchaseState {
  idle,
  loading,
  purchasing,
  success,
  error,
}

/// IAP Service provider
final iapServiceProvider = StateNotifierProvider<IAPServiceNotifier, IAPState>((ref) {
  return IAPServiceNotifier(ref);
});

class IAPState {
  final IAPPurchaseState purchaseState;
  final Map<String, ProductDetails> products;
  final bool isAvailable;
  final String? errorMessage;

  const IAPState({
    this.purchaseState = IAPPurchaseState.idle,
    this.products = const {},
    this.isAvailable = false,
    this.errorMessage,
  });

  IAPState copyWith({
    IAPPurchaseState? purchaseState,
    Map<String, ProductDetails>? products,
    bool? isAvailable,
    String? errorMessage,
  }) {
    return IAPState(
      purchaseState: purchaseState ?? this.purchaseState,
      products: products ?? this.products,
      isAvailable: isAvailable ?? this.isAvailable,
      errorMessage: errorMessage,
    );
  }

  /// Get the localized price for a product ID (auto-currency from store)
  String? getPrice(String productId) {
    return products[productId]?.price;
  }
}

class IAPServiceNotifier extends StateNotifier<IAPState> {
  final Ref _ref;
  final InAppPurchase _iap = InAppPurchase.instance;
  StreamSubscription<List<PurchaseDetails>>? _subscription;

  /// Current wedding ID for associating the purchase
  int? _currentWeddingId;

  /// Callback when a purchase completes successfully
  void Function()? onPurchaseSuccess;

  IAPServiceNotifier(this._ref) : super(const IAPState()) {
    _initialize();
  }

  Future<void> _initialize() async {
    final available = await _iap.isAvailable();
    if (!available) {
      state = state.copyWith(isAvailable: false);
      return;
    }

    state = state.copyWith(isAvailable: true, purchaseState: IAPPurchaseState.loading);

    // Listen for purchase updates
    _subscription = _iap.purchaseStream.listen(
      _onPurchaseUpdated,
      onDone: () => _subscription?.cancel(),
      onError: (error) {
        state = state.copyWith(
          purchaseState: IAPPurchaseState.error,
          errorMessage: error.toString(),
        );
      },
    );

    // Load product details
    await _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final response = await _iap.queryProductDetails(IAPProductIds.allProductIds);

      if (response.notFoundIDs.isNotEmpty) {
        // Some products not found — this is expected during development
        // Products will appear once configured in App Store Connect / Google Play Console
      }

      final productsMap = <String, ProductDetails>{};
      for (final product in response.productDetails) {
        productsMap[product.id] = product;
      }

      state = state.copyWith(
        products: productsMap,
        purchaseState: IAPPurchaseState.idle,
      );
    } catch (e) {
      state = state.copyWith(
        purchaseState: IAPPurchaseState.idle,
        errorMessage: e.toString(),
      );
    }
  }

  /// Purchase a package or topup
  Future<bool> purchaseProduct(String productId, {int? weddingId}) async {
    _currentWeddingId = weddingId;

    final product = state.products[productId];
    if (product == null) {
      state = state.copyWith(
        purchaseState: IAPPurchaseState.error,
        errorMessage: 'Product not available',
      );
      return false;
    }

    state = state.copyWith(purchaseState: IAPPurchaseState.purchasing);

    try {
      final purchaseParam = PurchaseParam(productDetails: product);
      // All our products are consumables (can be purchased again)
      final success = await _iap.buyConsumable(
        purchaseParam: purchaseParam,
        autoConsume: true,
      );

      if (!success) {
        state = state.copyWith(purchaseState: IAPPurchaseState.error);
        return false;
      }
      return true;
    } catch (e) {
      state = state.copyWith(
        purchaseState: IAPPurchaseState.error,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  /// Publish an invitation via IAP
  Future<bool> purchasePublish({required int weddingId}) async {
    return purchaseProduct(IAPProductIds.publish, weddingId: weddingId);
  }

  /// Handle purchase updates from the store
  void _onPurchaseUpdated(List<PurchaseDetails> purchaseDetailsList) {
    for (final purchase in purchaseDetailsList) {
      switch (purchase.status) {
        case PurchaseStatus.pending:
          state = state.copyWith(purchaseState: IAPPurchaseState.purchasing);
          break;

        case PurchaseStatus.purchased:
        case PurchaseStatus.restored:
          _handleSuccessfulPurchase(purchase);
          break;

        case PurchaseStatus.error:
          state = state.copyWith(
            purchaseState: IAPPurchaseState.error,
            errorMessage: purchase.error?.message ?? 'Purchase failed',
          );
          if (purchase.pendingCompletePurchase) {
            _iap.completePurchase(purchase);
          }
          break;

        case PurchaseStatus.canceled:
          state = state.copyWith(purchaseState: IAPPurchaseState.idle);
          if (purchase.pendingCompletePurchase) {
            _iap.completePurchase(purchase);
          }
          break;
      }
    }
  }

  /// Handle a successful purchase — verify with backend
  Future<void> _handleSuccessfulPurchase(PurchaseDetails purchase) async {
    try {
      final api = _ref.read(apiServiceProvider);
      final internalId = IAPProductIds.toInternalId(purchase.productID);

      // Determine if it's a package, topup, or publish
      if (IAPProductIds.packageIds.contains(purchase.productID)) {
        // Package purchase — register with backend
        if (_currentWeddingId != null) {
          await api.purchasePackage(
            weddingId: _currentWeddingId!,
            packageId: internalId,
          );
        }
      } else if (IAPProductIds.topupIds.contains(purchase.productID)) {
        // Topup purchase
        if (_currentWeddingId != null) {
          await api.purchaseTopup(
            weddingId: _currentWeddingId!,
            topupId: internalId,
          );
        }
      } else if (purchase.productID == IAPProductIds.publish) {
        // Publish purchase
        if (_currentWeddingId != null) {
          await api.activateFreeWithAIPackage(_currentWeddingId!);
        }
      }

      state = state.copyWith(purchaseState: IAPPurchaseState.success);
      onPurchaseSuccess?.call();

      // Reset state after delay
      Future.delayed(const Duration(seconds: 2), () {
        if (state.purchaseState == IAPPurchaseState.success) {
          state = state.copyWith(purchaseState: IAPPurchaseState.idle);
        }
      });
    } catch (e) {
      // Even if backend fails, the purchase was successful in-store
      state = state.copyWith(purchaseState: IAPPurchaseState.success);
    }

    // Complete the purchase
    if (purchase.pendingCompletePurchase) {
      await _iap.completePurchase(purchase);
    }
  }

  /// Restore previous purchases
  Future<void> restorePurchases() async {
    state = state.copyWith(purchaseState: IAPPurchaseState.loading);
    try {
      await _iap.restorePurchases();
      state = state.copyWith(purchaseState: IAPPurchaseState.idle);
    } catch (e) {
      state = state.copyWith(
        purchaseState: IAPPurchaseState.error,
        errorMessage: e.toString(),
      );
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
