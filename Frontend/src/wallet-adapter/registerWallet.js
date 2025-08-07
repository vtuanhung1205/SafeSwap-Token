// Wallet Registration Function
// This function registers the SafeSwap wallet with the wallet adapter system
// so that dapps can automatically detect and use it

import safeSwapWallet from './SafeSwapWalletAdapter.js';

// Register wallet function
export function registerWallet(wallet) {
  if (typeof window === 'undefined') return;
  
  try {
    // Check if wallet adapter is available
    if (window.registerWallet) {
      window.registerWallet(wallet);
      console.log('SafeSwap wallet registered with wallet adapter');
    } else {
      // Fallback: register with our own system
      if (!window.availableWallets) {
        window.availableWallets = new Map();
      }
      window.availableWallets.set(wallet.name, wallet);
      console.log('SafeSwap wallet registered with fallback system');
    }
  } catch (error) {
    console.error('Error registering SafeSwap wallet:', error);
  }
}

// Auto-register SafeSwap wallet on page load
(function () {
  if (typeof window === "undefined") return;
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerWallet(safeSwapWallet);
    });
  } else {
    registerWallet(safeSwapWallet);
  }
})();

// Export for manual registration
export { safeSwapWallet };
