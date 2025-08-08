# API Mapping Check - Frontend to Backend

## 1. Authentication APIs

### Frontend Calls (Frontend/src/utils/api.js)
```javascript
// Auth API
export const authAPI = {
  googleLogin: (googleData) => api.post('/auth/google', googleData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};
```

### Backend Endpoints (Backend/src/routes/auth.routes.js)
- ✅ `POST /auth/google` - Google OAuth login
- ✅ `GET /auth/profile` - Get user profile  
- ✅ `PUT /auth/profile` - Update user profile
- ✅ `POST /auth/logout` - Logout

### Response Format Mapping
- ✅ Frontend expects: `response.data.data.user`
- ✅ Backend returns: `{ success: true, data: user.toJSON() }`

## 2. Wallet APIs

### Frontend Calls (Frontend/src/utils/api.js)
```javascript
// Wallet API
export const walletAPI = {
  connect: (address, publicKey) => api.post('/wallet/connect', { address, publicKey }),
  disconnect: () => api.post('/wallet/disconnect'),
  getInfo: () => api.get('/wallet/info'),
  getTransactions: (params = {}) => api.get('/transactions', { params }),
};
```

### Backend Endpoints (Backend/src/routes/wallet.routes.js)
- ✅ `POST /wallet/connect` - Connect wallet
- ✅ `POST /wallet/disconnect` - Disconnect wallet
- ✅ `GET /wallet/info` - Get wallet info
- ✅ `GET /transactions` - Get transactions (via transaction routes)

### Request/Response Format Mapping
- ✅ Frontend sends: `{ address, publicKey }`
- ✅ Backend expects: `{ address, publicKey }` in req.body
- ✅ Frontend expects: `{ success: true, data: { wallet } }`
- ✅ Backend returns: `{ success: true, data: { wallet } }`

## 3. Transaction APIs

### Frontend Calls (Frontend/src/utils/api.js)
```javascript
// Transaction API
export const transactionAPI = {
  getUserTransactions: (params = {}) => api.get('/transactions', { params }),
};
```

### Backend Endpoints (Backend/src/routes/transactions.routes.js)
- ✅ `GET /transactions` - Get user transactions

## 4. User APIs

### Frontend Calls (Frontend/src/utils/api.js)
```javascript
// User API
export const userAPI = {
  getUserStats: () => api.get('/users/stats'),
  getSwapHistory: (params = {}) => api.get('/users/swap-history', { params }),
  getUserActivity: (params = {}) => api.get('/users/activity', { params }),
};
```

### Backend Endpoints (Backend/src/routes/users.routes.js)
- ❌ `GET /users/stats` - NOT IMPLEMENTED
- ❌ `GET /users/swap-history` - NOT IMPLEMENTED  
- ❌ `GET /users/activity` - NOT IMPLEMENTED

## 5. System APIs

### Frontend Calls (Frontend/src/utils/api.js)
```javascript
// System API
export const systemAPI = {
  health: () => api.get('/health'),
};
```

### Backend Endpoints (Backend/src/index.js)
- ✅ `GET /health` - Health check

## 6. Blockchain Data Fetching

### Frontend Blockchain Calls
1. **Dashboard.jsx** - Uses AptosClient for balance fetching
2. **Wallet.jsx** - Uses AptosClient for balance and transactions
3. **SwapForm.jsx** - Uses AptosClient for swap operations

### Backend Blockchain Calls (Backend/src/services/aptos.service.js)
1. **getAccountBalance()** - Fetches APT balance from blockchain
2. **getTokenBalance()** - Fetches token balances from blockchain
3. **getAccountResources()** - Fetches account resources from blockchain
4. **getTransactionHistory()** - Fetches transaction history from blockchain

## Issues Found

### 1. Missing User API Endpoints
Frontend calls these endpoints but they don't exist in backend:
- `GET /users/stats`
- `GET /users/swap-history` 
- `GET /users/activity`

### 2. Authentication Token Handling
- ✅ Frontend stores token as `localStorage.getItem('token')`
- ✅ Backend expects `Authorization: Bearer <token>`
- ✅ Token format: `response.data.data.tokens.accessToken`

### 3. Wallet Connection Flow
- ✅ Frontend sends: `{ address, publicKey }`
- ✅ Backend validates address format
- ✅ Backend checks for existing wallet connections
- ✅ Backend returns: `{ success: true, data: { wallet } }`

## Recommendations

1. **Implement missing user API endpoints** or remove frontend calls
2. **Add error handling** for missing user APIs in Dashboard
3. **Test wallet connection** with detailed logging
4. **Verify blockchain data fetching** works correctly 