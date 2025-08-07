# SafeSwap Wallet Adapter Implementation

This implementation provides an AIP-62 compatible wallet adapter for SafeSwap that allows dapps to automatically detect and interact with the SafeSwap wallet.

## Overview

The SafeSwap Wallet Adapter implements the wallet-standard interface, making it compatible with dapps that use the Aptos wallet adapter system. This allows users to connect their SafeSwap wallet to any dapp that supports the wallet adapter.

## Features

- ✅ AIP-62 Standard Compliance
- ✅ Automatic Wallet Detection
- ✅ Transaction Signing
- ✅ Message Signing
- ✅ Account Management
- ✅ Event System
- ✅ Browser Extension Support

## Implementation Details

### 1. Wallet Adapter Plugin (`SafeSwapWalletAdapter.js`)

The main wallet adapter implementation that provides:

- **Wallet Detection**: Automatically detects if the wallet is available
- **Connection Management**: Handles wallet connection/disconnection
- **Transaction Signing**: Signs and submits transactions to the Aptos network
- **Message Signing**: Signs messages for authentication
- **Event System**: Provides event listeners for wallet state changes

### 2. Wallet Registration (`registerWallet.js`)

Automatically registers the SafeSwap wallet with the wallet adapter system on page load:

```javascript
// Auto-register SafeSwap wallet on page load
(function () {
  if (typeof window === "undefined") return;
  const myWallet = new SafeSwapWallet();
  registerWallet(myWallet);
})();
```

### 3. Browser Extension Support

The implementation includes browser extension files:

- `manifest.json`: Extension manifest for Chrome/Firefox
- `content-script.js`: Injects wallet adapter into web pages
- `background.js`: Handles extension background tasks

## Usage

### For Dapp Developers

Dapps can automatically detect and use the SafeSwap wallet:

```javascript
// Check if SafeSwap wallet is available
if (window.safeSwapWallet) {
  const wallet = window.safeSwapWallet;
  
  // Connect to wallet
  const result = await wallet.connect();
  console.log('Connected:', result.account);
  
  // Sign transaction
  const signedTx = await wallet.signTransaction(transaction);
  
  // Sign message
  const signature = await wallet.signMessage('Hello SafeSwap!');
}
```

### For Users

1. **Install the Browser Extension** (when published):
   - Download the SafeSwap wallet extension
   - Install it in your browser
   - The wallet will automatically be available to dapps

2. **Use with SafeSwap Dapp**:
   - Visit the SafeSwap dapp
   - Click "Connect Wallet"
   - Select SafeSwap from the available wallets
   - Approve the connection

3. **Test the Implementation**:
   - Visit `/wallet-adapter-demo` on the SafeSwap site
   - Test all wallet functions
   - Verify AIP-62 compliance

## Testing

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the wallet adapter demo:
   ```
   http://localhost:5173/wallet-adapter-demo
   ```

3. Test all wallet functions:
   - Connect/Disconnect
   - Sign Messages
   - Sign Transactions
   - Get Account Info
   - Get Account Resources

### Browser Extension Testing

1. Load the extension in Chrome:
   - Open Chrome Extensions (`chrome://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `Frontend` directory

2. Test on any website:
   - Open browser console
   - Check if `window.safeSwapWallet` is available
   - Test wallet functions

## AIP-62 Compliance

The implementation follows the AIP-62 standard and includes all required functions:

- ✅ `connect()` - Connect to wallet
- ✅ `disconnect()` - Disconnect from wallet
- ✅ `signAndSubmitTransaction()` - Sign and submit transaction
- ✅ `signTransaction()` - Sign transaction
- ✅ `signMessage()` - Sign message
- ✅ Event system for state changes
- ✅ Proper error handling

## Integration with Wallet Adapter Core

To make SafeSwap available to all dapps, you need to update the wallet-adapter-core:

1. **Fork the wallet-adapter-core repository**
2. **Add SafeSwap to the supported wallets**:

```typescript
// In aptos-wallet-adapter/src/standardWallet.ts
export const SafeSwapWallet: AptosStandardSupportedWallet<"SafeSwap"> = {
  name: "SafeSwap" as WalletName<"SafeSwap">,
  url: "https://safeswap-frontend.onrender.com",
  icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzM4NEVGRiIvPgo8L3N2Zz4K",
  readyState: WalletReadyState.NotDetected,
  isAIP62Standard: true,
};
```

3. **Update AvailableWallets type**:
```typescript
export type AvailableWallets = "Nightly" | "Petra" | "T wallet" | "SafeSwap";
```

4. **Submit a pull request** to the wallet-adapter-core repository

## File Structure

```
Frontend/
├── src/
│   ├── wallet-adapter/
│   │   ├── SafeSwapWalletAdapter.js    # Main wallet implementation
│   │   └── registerWallet.js           # Auto-registration
│   ├── components/
│   │   └── WalletAdapterDemo.jsx       # Demo component
│   └── App.jsx                         # Updated with demo route
├── manifest.json                        # Browser extension manifest
├── content-script.js                    # Extension content script
└── WALLET_ADAPTER_README.md            # This file
```

## Next Steps

1. **Publish Browser Extension**:
   - Create extension icons
   - Package the extension
   - Submit to Chrome Web Store

2. **Update Wallet Adapter Core**:
   - Fork the repository
   - Add SafeSwap to supported wallets
   - Submit pull request

3. **Test with Real Dapps**:
   - Test with Aptos dapps
   - Verify compatibility
   - Gather user feedback

4. **Enhance Security**:
   - Implement proper key management
   - Add transaction validation
   - Implement secure storage

## Support

For questions or issues with the wallet adapter implementation, please:

1. Check the demo at `/wallet-adapter-demo`
2. Review the console logs for debugging
3. Test with the Wallet Adapter Demo dapp
4. Submit issues to the SafeSwap repository

## License

This implementation is part of the SafeSwap project and follows the same license terms.
