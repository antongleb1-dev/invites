import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'api_provider.dart';

final tokenBalanceProvider = FutureProvider<int>((ref) async {
  final api = ref.read(apiServiceProvider);
  try {
    return await api.getTokenBalance();
  } catch (e) {
    return 0;
  }
});

final tokenBalanceNotifierProvider = StateNotifierProvider<TokenBalanceNotifier, int>((ref) {
  return TokenBalanceNotifier(ref);
});

class TokenBalanceNotifier extends StateNotifier<int> {
  final Ref _ref;
  
  TokenBalanceNotifier(this._ref) : super(0) {
    _loadBalance();
  }
  
  Future<void> _loadBalance() async {
    try {
      final api = _ref.read(apiServiceProvider);
      state = await api.getTokenBalance();
    } catch (e) {
      state = 0;
    }
  }
  
  void addTokens(int amount) {
    state = state + amount;
  }
  
  void useTokens(int amount) {
    state = state - amount;
    if (state < 0) state = 0;
  }
  
  Future<void> refresh() async {
    await _loadBalance();
  }
}
