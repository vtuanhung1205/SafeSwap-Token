# SafeSwap Backend API Endpoints

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://safeswap-backend-service.onrender.com`

## Swagger Documentation
- **Development**: `http://localhost:5000/api-docs`
- **Production**: `https://safeswap-backend-service.onrender.com/api-docs`

## API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/google` | Google OAuth login | ❌ |
| `GET` | `/api/auth/profile` | Get user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update user profile | ✅ |
| `POST` | `/api/auth/logout` | Logout user | ✅ |

### 💰 Wallet Management (`/api/wallet`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/wallet/connect` | Connect wallet to user | ✅ |
| `POST` | `/api/wallet/disconnect` | Disconnect wallet | ✅ |
| `GET` | `/api/wallet/info` | Get wallet information | ✅ |
| `GET` | `/api/wallet/balance` | Get wallet balance | ✅ |
| `GET` | `/api/wallet/transactions` | Get transaction history | ✅ |

### 📊 Transaction Management (`/api/transactions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/transactions` | Get user transactions | ✅ |

### 💱 Token Swapping (`/api/swap`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/swap/quote` | Get swap quote | ❌ |
| `POST` | `/api/swap/execute` | Execute swap transaction | ✅ |
| `GET` | `/api/swap/history` | Get swap history | ✅ |
| `GET` | `/api/swap/tokens` | Get available tokens | ❌ |
| `POST` | `/api/swap/validate` | Validate swap parameters | ❌ |
| `GET` | `/api/swap/pairs` | Get trading pairs | ❌ |
| `POST` | `/api/swap/estimate-gas` | Estimate gas for swap | ❌ |

### 📊 Price Information (`/api/price`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/price/all` | Get all token prices | ❌ |
| `GET` | `/api/price/token/{symbol}` | Get specific token price | ❌ |
| `GET` | `/api/price/exchange-rate` | Get exchange rate | ❌ |
| `GET` | `/api/price/history/{symbol}` | Get price history | ❌ |
| `GET` | `/api/price/market-data` | Get market data | ❌ |
| `GET` | `/api/price/top-gainers` | Get top gainers | ❌ |
| `GET` | `/api/price/top-losers` | Get top losers | ❌ |

### 🔧 System Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Health check | ❌ |
| `GET` | `/cors-test` | CORS test | ❌ |
| `GET` | `/` | API welcome | ❌ |

## Authentication

### Bearer Token
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Token Format
- **Access Token**: Short-lived (1 hour)
- **Refresh Token**: Long-lived (7 days)

## Rate Limiting

- **Strict**: 5 requests per minute (auth endpoints)
- **Standard**: 100 requests per minute (other endpoints)

## Error Responses

```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2025-08-08T12:00:00.000Z"
}
```

## Success Responses

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Testing with Swagger

1. Visit the Swagger UI at `/api-docs`
2. Click "Authorize" to add your Bearer token
3. Test any endpoint directly from the UI
4. View request/response schemas
5. Try different parameters and see responses

## WebSocket Support

- **Endpoint**: `/socket.io`
- **Events**: Real-time price updates, transaction notifications
- **Authentication**: Token-based via query parameter

## CORS Configuration

Allowed origins:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`
- `https://safeswap-token.vercel.app`
- `https://safeswap-frontend.onrender.com` 