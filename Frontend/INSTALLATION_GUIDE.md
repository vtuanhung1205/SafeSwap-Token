# 🚀 **SafeSwap Frontend Installation Guide**

## 📋 **Current Status**
✅ **Fixed:** App.jsx structure  
✅ **Fixed:** Main.jsx provider order  
✅ **Fixed:** Temporary WalletProvider  
❌ **Pending:** Install missing packages  

## 🔧 **Step 1: Install Missing Dependencies**

Run these commands in your terminal:

```bash
# Navigate to Frontend directory
cd SafeSwap-Token/Frontend

# Install missing packages
npm install @aptos-labs/wallet-adapter-react @aptos-labs/ts-sdk react-modal
```

## 🔧 **Step 2: Update WalletProvider (After Installation)**

Once packages are installed, update `src/components/AptosKeylessAuth/WalletProvider.tsx`:

```typescript
import React, { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: Network.MAINNET }}
      onError={(error) => {
        console.log("Wallet connection error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
```

## 🔧 **Step 3: Update Types (After Installation)**

Update `src/components/AptosKeylessAuth/types.tsx`:

```typescript
import { ReactNode } from 'react';
import { AnyAptosWallet, Account } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';

// Remove these temporary definitions:
// type AnyAptosWallet = any;
// type Account = any;
// type Network = any;

// Keep all the interface definitions...
```

## 🔧 **Step 4: Add Environment Variables**

Create or update `.env` file in the Frontend directory:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Aptos Connect
VITE_APTOS_CONNECT_CLIENT_ID=your_aptos_connect_client_id_here
VITE_DAPP_URL=https://safeswap-frontend.onrender.com
VITE_CALLBACK_URL=https://safeswap-frontend.onrender.com/aptos-connect-callback
```

## 🔧 **Step 5: Test the Application**

```bash
# Start development server
npm run dev
```

## ✅ **Expected Results**

After completing all steps:

1. **No import errors** in console
2. **Application starts** without TypeScript errors
3. **All routes work** properly
4. **Wallet connection** components load (but may not function until real implementation)
5. **Authentication** works with Google OAuth

## 🚨 **Troubleshooting**

### **If npm install fails:**
```bash
# Clear npm cache
npm cache clean --force

# Try with yarn instead
yarn add @aptos-labs/wallet-adapter-react @aptos-labs/ts-sdk react-modal
```

### **If TypeScript errors persist:**
```bash
# Restart TypeScript server
# In VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### **If environment variables don't work:**
- Make sure `.env` file is in the correct location
- Restart the development server after adding variables

## 📊 **Current Provider Structure**

```
GoogleOAuthProvider
├── Router
│   ├── AuthProvider
│   │   ├── WalletProvider (Temporary)
│   │   │   └── App
│   │   │       ├── Navbar
│   │   │       ├── Routes
│   │   │       └── Footer
```

## 🎯 **Next Steps**

1. **Install packages** using npm/yarn
2. **Update WalletProvider** with real implementation
3. **Update types.tsx** with proper imports
4. **Add environment variables**
5. **Test all functionality**

The application should now work without critical errors! 🚀
