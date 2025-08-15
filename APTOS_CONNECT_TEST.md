# 🧪 **Aptos Connect Implementation Test Guide**

## ✅ **What We've Implemented:**

1. **Frontend Component**: `AptosConnectButton.jsx`
2. **Auth Service Method**: `aptosConnectLogin()` in `authService.js`
3. **Auth Context**: `aptosConnectLogin()` function
4. **Backend Controller**: `aptosConnectAuth()` method
5. **Backend Route**: `/api/auth/aptos-connect` endpoint
6. **LoginModal Integration**: Added button to login modal

## 🧪 **Testing Steps:**

### **1. Frontend Test:**
```bash
cd Frontend
npm run dev
```

**Check:**
- Open browser console
- Navigate to login page
- Look for "Connect with Aptos" button
- Button should be styled with purple-to-blue gradient

### **2. Backend Test:**
```bash
cd Backend
npm start
```

**Check:**
- Server should start without errors
- Look for new route: `/api/auth/aptos-connect`
- Check logs for any startup errors

### **3. Integration Test:**
1. **Open Login Modal**
2. **Click "Connect with Aptos"**
3. **Select a wallet** (Martian, Pontem, Rise, Fewcha)
4. **Approve connection**
5. **Check console logs** for:
   ```
   Attempting Aptos Connect login with: {address: "...", publicKey: "...", ...}
   ```

### **4. Backend Logs:**
Look for:
```
New Aptos Connect user created: 0x1234...
```
or
```
Aptos Connect login for existing user: 0x1234...
```

## 🚨 **Common Issues & Solutions:**

### **Issue 1: "aptosConnectLogin is not a function"**
**Solution:** Check that `authService.aptosConnectLogin` is properly exported

### **Issue 2: "Cannot read property 'address' of undefined"**
**Solution:** Check that `account` object is available from `useWallet()`

### **Issue 3: "Backend route not found"**
**Solution:** Verify the route is properly added to `auth.routes.js`

### **Issue 4: "User model validation error"**
**Solution:** Check User model schema supports `walletAddress` and `wallets` fields

### **Issue 5: "Parameter mismatch error"**
**Solution:** Ensure frontend sends `addressString` and `publicKeyString`, not `address` and `publicKey`

## 🔍 **Debugging:**

### **Frontend Console:**
```javascript
// Check if wallet is connected
console.log('Wallet connected:', connected);
console.log('Account:', account);

// Check if function exists
console.log('aptosConnectLogin:', typeof aptosConnectLogin);
```

### **Backend Logs:**
```javascript
// Add more logging in controller
console.log('Received aptos-connect request:', req.body);
console.log('User found/created:', user);

// Check parameter names
console.log('addressString:', req.body.addressString);
console.log('publicKeyString:', req.body.publicKeyString);
```

## 📱 **Expected User Flow:**

1. **User clicks "Connect with Aptos"**
2. **Wallet selector opens** (Martian, Pontem, Rise, Fewcha)
3. **User selects wallet**
4. **Wallet extension popup appears**
5. **User approves connection**
6. **Frontend receives account data**
7. **Frontend calls backend API**
8. **Backend creates/updates user**
9. **Backend returns JWT tokens**
10. **User is logged in**

## 🎯 **Success Indicators:**

- ✅ Button appears in login modal
- ✅ Wallet connection works
- ✅ Backend receives request
- ✅ User account created/updated
- ✅ JWT tokens returned
- ✅ User logged in successfully
- ✅ Toast notification shows success

## 🚀 **Next Steps After Testing:**

1. **Test with different wallets** (Martian, Pontem, Rise, Fewcha)
2. **Test error scenarios** (network issues, invalid data)
3. **Test user persistence** (login again with same wallet)
4. **Test logout functionality**
5. **Test wallet disconnection**

## 📝 **Notes:**

- **Wallet Connection**: Uses existing Aptos wallet adapter setup
- **Authentication**: Creates new user or links to existing user
- **Security**: JWT tokens for session management
- **User Experience**: Seamless wallet-based authentication
- **Fallback**: Google OAuth still available as alternative

**Test this step by step and let me know if you encounter any issues!** 🎉 