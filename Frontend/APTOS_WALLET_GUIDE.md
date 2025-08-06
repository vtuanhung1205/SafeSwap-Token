# Aptos Wallet Integration Guide

## Overview

This guide explains how to use the Aptos wallet integration feature in SafeSwap. The implementation uses the official Aptos JavaScript SDK to provide a seamless wallet experience.

## Features

### ✅ Implemented Features

1. **Create New Wallet**
   - Generate new Aptos accounts
   - Store wallet information locally
   - Secure private key management

2. **Import Existing Wallet**
   - Import wallets using private keys
   - Support for existing wallet formats
   - Validation of wallet data

3. **Connect to Existing Wallet**
   - Reconnect to previously created wallets
   - Persistent wallet storage
   - Automatic wallet detection

4. **Balance Checking**
   - Query wallet balance on Aptos devnet
   - Real-time balance updates
   - Error handling for network issues

5. **Wallet Management**
   - View wallet address and public key
   - Clear wallet data
   - Secure local storage

## Technical Implementation

### Dependencies

```bash
npm install aptos
```

### Key Components

1. **AptosWalletLogin.jsx**
   - Main wallet interaction component
   - Handles wallet creation, import, and connection
   - Integrates with Aptos SDK

2. **AptosWalletModal.jsx**
   - Modal wrapper for wallet operations
   - Provides consistent UI/UX
   - Handles success/error callbacks

3. **AptosWalletDemo.jsx**
   - Demo component for testing
   - Shows wallet information and balance
   - Provides wallet management tools

### Network Configuration

Currently configured for **Aptos Devnet**:
```javascript
const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");
```

To switch to mainnet, change the URL to:
```javascript
const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com");
```

## Usage Instructions

### 1. Basic Wallet Operations

```javascript
import { AptosClient, AptosAccount } from 'aptos';

// Initialize client
const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");

// Create new wallet
const account = new AptosAccount();
const address = account.address().hex();

// Get balance
const balance = await client.getAccountBalance(address);
console.log(`Balance: ${balance.octa} octa`);
```

### 2. Using the Wallet Components

```javascript
import AptosWalletModal from './components/Auth/AptosWalletModal';

// In your component
const [showWalletModal, setShowWalletModal] = useState(false);

const handleWalletSuccess = (walletData) => {
  console.log('Wallet connected:', walletData);
  // Handle wallet connection
};

<AptosWalletModal
  isOpen={showWalletModal}
  onClose={() => setShowWalletModal(false)}
  onSuccess={handleWalletSuccess}
/>
```

### 3. Storage Management

Wallet data is stored in localStorage:
```javascript
// Store wallet
const walletInfo = {
  address: account.address().hex(),
  publicKey: account.publicKey().hex(),
  privateKey: account.toPrivateKeyObject().privateKeyHex,
};
localStorage.setItem('aptos_wallet', JSON.stringify(walletInfo));

// Retrieve wallet
const stored = localStorage.getItem('aptos_wallet');
const walletInfo = JSON.parse(stored);
```

## Security Considerations

### ⚠️ Important Security Notes

1. **Private Key Storage**
   - Private keys are stored in localStorage (browser)
   - For production, consider encrypted storage
   - Never expose private keys in logs or UI

2. **Network Security**
   - Use HTTPS in production
   - Validate all network responses
   - Handle connection errors gracefully

3. **User Education**
   - Warn users about private key security
   - Provide clear instructions for wallet backup
   - Explain the risks of local storage

## Testing

### Development Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the wallet test page:**
   - Go to `/aptos-wallet-test` (if route is configured)
   - Or use the login modal with "Connect Aptos Wallet"

3. **Test wallet operations:**
   - Create a new wallet
   - Check balance (will be 0 on new wallets)
   - Import/export wallet data
   - Test error scenarios

### Test Scenarios

1. **New Wallet Creation**
   - Click "Create New Wallet"
   - Verify wallet address is generated
   - Check that wallet data is stored

2. **Balance Checking**
   - Connect to existing wallet
   - Click "Check Balance"
   - Verify balance is displayed correctly

3. **Error Handling**
   - Test with invalid private keys
   - Test network connection issues
   - Verify error messages are user-friendly

## Production Considerations

### Environment Setup

1. **Environment Variables**
   ```env
   VITE_APTOS_NETWORK=mainnet
   VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com
   ```

2. **Network Configuration**
   ```javascript
   const network = import.meta.env.VITE_APTOS_NETWORK || 'devnet';
   const nodeUrl = import.meta.env.VITE_APTOS_NODE_URL || 
     'https://fullnode.devnet.aptoslabs.com';
   ```

### Enhanced Security

1. **Encrypted Storage**
   ```javascript
   import CryptoJS from 'crypto-js';

   const encryptWallet = (walletData, password) => {
     return CryptoJS.AES.encrypt(
       JSON.stringify(walletData), 
       password
     ).toString();
   };

   const decryptWallet = (encryptedData, password) => {
     const bytes = CryptoJS.AES.decrypt(encryptedData, password);
     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
   };
   ```

2. **Wallet Backup**
   - Implement seed phrase generation
   - Provide wallet export functionality
   - Add wallet recovery features

## Troubleshooting

### Common Issues

1. **SDK Import Errors**
   - Ensure `aptos` package is installed
   - Check for version compatibility
   - Verify import statements

2. **Network Connection Issues**
   - Check internet connection
   - Verify node URL is correct
   - Test with different networks

3. **Storage Issues**
   - Check localStorage availability
   - Verify data format
   - Handle storage quota exceeded

### Debug Tips

1. **Enable Console Logging**
   ```javascript
   console.log('Wallet data:', walletData);
   console.log('Network response:', response);
   ```

2. **Check Network Status**
   ```javascript
   const checkNetwork = async () => {
     try {
       const response = await fetch(nodeUrl);
       console.log('Network status:', response.status);
     } catch (error) {
       console.error('Network error:', error);
     }
   };
   ```

## Future Enhancements

### Planned Features

1. **Multi-Wallet Support**
   - Support multiple wallet connections
   - Wallet switching functionality
   - Wallet naming and organization

2. **Transaction Support**
   - Send APT tokens
   - Transaction history
   - Gas estimation

3. **Advanced Security**
   - Hardware wallet support
   - Multi-signature wallets
   - Advanced encryption

4. **User Experience**
   - Wallet onboarding flow
   - Educational content
   - Better error messages

## Support

For issues or questions:
1. Check the console for error messages
2. Verify network connectivity
3. Test with different browsers
4. Review the Aptos documentation

## Resources

- [Aptos Documentation](https://aptos.dev/docs)
- [Aptos SDK GitHub](https://github.com/aptos-labs/aptos-core)
- [Aptos Explorer](https://explorer.aptoslabs.com/)
- [Aptos Faucet](https://aptoslabs.com/testnet-faucet) 