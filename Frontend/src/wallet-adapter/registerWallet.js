// Wallet Registration Function
// This function registers the SafeSwap wallet with the wallet adapter system
// so that dapps can automatically detect and use it
// ISOLATED VERSION - Only registers when explicitly needed

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

// Manual registration function - only call when needed
export function registerSafeSwapWallet() {
  if (typeof window === 'undefined') return;
  
  try {
    // Register the wallet
    registerWallet(safeSwapWallet);
    
    // Also make it available globally for the demo
    window.safeSwapWallet = safeSwapWallet;
    
    console.log('SafeSwap wallet manually registered');
    return true;
  } catch (error) {
    console.error('Error manually registering SafeSwap wallet:', error);
    return false;
  }
}

// Auto-register SafeSwap wallet on page load (only for demo pages)
(function () {
  if (typeof window === "undefined") return;
  
  // Only auto-register if we're on the wallet adapter demo page
  const isDemoPage = window.location.pathname.includes('wallet-adapter-demo');
  
  if (isDemoPage) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        registerWallet(safeSwapWallet);
      });
    } else {
      registerWallet(safeSwapWallet);
    }
  }
})();

// Export for manual registration
export { safeSwapWallet };
