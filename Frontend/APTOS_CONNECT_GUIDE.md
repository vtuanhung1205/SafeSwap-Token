# Aptos Connect Integration Guide

## Overview

This guide explains how to integrate **Aptos Connect** - the official Web3 authentication solution for Aptos blockchain. Aptos Connect allows users to connect with any Aptos wallet (Martian, Pontem, Petra, etc.) through a unified interface.

## What is Aptos Connect?

Aptos Connect is the official Web3 authentication solution provided by Aptos Labs. It allows dApps to connect with any Aptos wallet through a standardized interface, similar to WalletConnect for Ethereum.

**Key Features:**
- ✅ Connect with any Aptos wallet
- ✅ Secure Web3 authentication
- ✅ No private key storage required
- ✅ Official Aptos solution
- ✅ Cross-platform compatibility

## Implementation

### 1. Components Created

#### `AptosConnectLogin.jsx`
Main component for handling Aptos Connect authentication:
- Detects if Aptos Connect is available
- Redirects to Aptos Connect if needed
- Handles wallet selection (Martian, Pontem, Petra)
- Provides fallback options

#### `AptosConnectModal.jsx`
Modal wrapper for the login component:
- Consistent UI/UX with existing modals
- Handles success/error callbacks
- Provides close functionality

#### `AptosConnectCallback.jsx`
Handles the callback from Aptos Connect:
- Processes wallet connection data
- Stores wallet information
- Shows success/error states
- Redirects back to app

### 2. Integration with LoginModal

Updated `LoginModal.jsx` to include Aptos Connect option:
- Added "Connect Aptos Wallet" button
- Integrated with existing Google login
- Maintains consistent design

## How It Works

### 1. User Flow

```
User clicks "Connect Aptos Wallet"
    ↓
AptosConnectModal opens
    ↓
User chooses wallet or "Connect with Aptos Connect"
    ↓
Redirects to Aptos Connect or specific wallet
    ↓
User authenticates with their wallet
    ↓
Callback to your app with wallet data
    ↓
Store wallet info and show success
```

### 2. URL Structure

**Aptos Connect URL:**
```
https://aptosconnect.app/prompt/?request=<base64_encoded_request>
```

**Request Format:**
```json
{
  "connect": {
    "url": "https://your-app.com/callback",
    "name": "SafeSwap",
    "icon": "https://your-app-icon.com/icon.png"
  }
}
```

**Callback URL:**
```
https://your-app.com/callback?wallet=<address>&publicKey=<key>&provider=<wallet_name>
```

### 3. Wallet Data Structure

```javascript
{
  type: 'aptos-connect',
  address: '0x...', // Wallet address
  publicKey: '0x...', // Public key
  authKey: '0x...', // Auth key
  provider: 'martian' // Wallet provider name
}
```

## Supported Wallets

### Popular Aptos Wallets
1. **Martian Wallet** - Most popular Aptos wallet
2. **Pontem Wallet** - Official Aptos wallet
3. **Petra Wallet** - Aptos Labs wallet
4. **Any other Aptos wallet** - Through Aptos Connect

### Wallet URLs
- Martian: `https://martianwallet.xyz/connect`
- Pontem: `https://pontem.network/connect`
- Petra: `https://petra.app/connect`
- Aptos Connect: `https://aptosconnect.app/prompt/`

## Security Considerations

### ✅ Security Features
- **No Private Key Storage**: Private keys never leave the user's wallet
- **Secure Authentication**: Uses Web3 standards for authentication
- **HTTPS Required**: All connections use secure protocols
- **User Consent**: Users must explicitly approve connections

### ⚠️ Important Notes
- Always use HTTPS in production
- Validate all callback data
- Handle connection errors gracefully
- Store wallet data securely

## Testing

### Development Testing

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the connection flow:**
   - Click "Connect Aptos Wallet" in login modal
   - Choose a wallet or "Connect with Aptos Connect"
   - Complete authentication in wallet
   - Verify callback handling

3. **Test different scenarios:**
   - Successful connection
   - User rejection
   - Network errors
   - Invalid callback data

### Test URLs

**Local Development:**
```
http://localhost:5173/callback?wallet=0x123...&publicKey=0x456...&provider=martian
```

**Production:**
```
https://your-app.com/callback?wallet=0x123...&publicKey=0x456...&provider=martian
```

## Production Setup

### 1. Environment Configuration

```env
VITE_APP_NAME=SafeSwap
VITE_APP_ICON=https://your-app-icon.com/icon.png
VITE_CALLBACK_URL=https://your-app.com/callback
```

### 2. Update Component Configuration

```javascript
// In AptosConnectLogin.jsx
const appName = import.meta.env.VITE_APP_NAME || 'SafeSwap';
const appIcon = import.meta.env.VITE_APP_ICON || 'https://your-app-icon.com/icon.png';
const callbackUrl = import.meta.env.VITE_CALLBACK_URL || window.location.origin + '/callback';
```

### 3. Routing Setup

Add callback route to your router:

```javascript
// In your router configuration
{
  path: '/callback',
  element: <AptosConnectCallback />
}
```

## Advanced Features

### 1. Multi-Wallet Support

```javascript
const handleMultipleWallets = (wallets) => {
  wallets.forEach(wallet => {
    console.log(`Connected: ${wallet.provider} - ${wallet.address}`);
  });
};
```

### 2. Wallet Switching

```javascript
const switchWallet = (newWallet) => {
  // Disconnect current wallet
  localStorage.removeItem('aptos_connect_wallet');
  
  // Connect new wallet
  handleAptosConnectLogin();
};
```

### 3. Transaction Support

```javascript
const sendTransaction = async (walletData, transaction) => {
  // Use wallet data to send transactions
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet: walletData.address,
      transaction: transaction
    })
  });
};
```

## Troubleshooting

### Common Issues

1. **Callback Not Working**
   - Check URL parameters
   - Verify callback route is configured
   - Ensure HTTPS is used in production

2. **Wallet Not Detected**
   - Check if wallet extension is installed
   - Verify wallet supports Aptos Connect
   - Try different wallet options

3. **Connection Errors**
   - Check network connectivity
   - Verify Aptos Connect URL is correct
   - Handle user rejection gracefully

### Debug Tips

```javascript
// Enable debug logging
console.log('Aptos Connect URL:', aptosConnectUrl);
console.log('Callback data:', walletData);
console.log('Wallet provider:', provider);
```

## Best Practices

### 1. User Experience
- Show loading states during connection
- Provide clear error messages
- Offer multiple wallet options
- Guide users to install wallets if needed

### 2. Security
- Always validate callback data
- Use HTTPS in production
- Handle errors gracefully
- Don't store sensitive data

### 3. Performance
- Lazy load components
- Cache wallet data appropriately
- Minimize redirects
- Optimize callback handling

## Resources

- [Aptos Connect Documentation](https://aptos.dev/guides/aptos-connect)
- [Aptos Wallets](https://aptos.dev/ecosystem/wallets)
- [Aptos Connect App](https://aptosconnect.app)
- [Aptos Developer Portal](https://aptos.dev)

## Support

For issues or questions:
1. Check the Aptos Connect documentation
2. Verify wallet compatibility
3. Test with different wallets
4. Review callback handling

The Aptos Connect integration provides a secure, user-friendly way to connect with any Aptos wallet, making it the recommended approach for Aptos dApp authentication. 