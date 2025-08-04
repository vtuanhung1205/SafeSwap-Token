# SafeSwap Backend - Optimized for Production

## Overview

This is the optimized backend for SafeSwap, designed for production use with real funds. The system has been streamlined to focus on essential functionality while maintaining security and performance.

## Key Optimizations

### 1. **Wallet-Based Authentication**
- Removed complex user management system
- Users are identified by wallet address
- Session-based authentication for API access
- No personal data storage required

### 2. **CoinGecko Integration**
- Real-time token data from CoinGecko API
- Cached responses to reduce API calls
- Comprehensive token information and pricing
- Support for multiple platforms (Aptos, Ethereum, Solana)

### 3. **Minimal Database Storage**
- Only essential data stored in database
- Transaction history for audit trails
- Session management for authentication
- No user profiles or wallet storage

### 4. **Clean API Design**
- RESTful endpoints with consistent responses
- Comprehensive Swagger documentation
- Proper error handling and validation
- Rate limiting for security

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│                 │    │                 │    │   Services      │
│ - React App     │◄──►│ - Express.js    │◄──►│ - CoinGecko API │
│ - Wallet Connect│    │ - MongoDB       │    │ - Aptos Network │
│ - Swap Interface│    │ - Session Mgmt  │    │ - Blockchain    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## API Endpoints

### User Management (`/api/user`)
- `POST /connect` - Connect wallet and create session
- `POST /disconnect` - Disconnect wallet and remove session
- `GET /me` - Get current user information
- `POST /validate` - Validate session
- `GET /stats` - Get session statistics
- `GET /health` - Health check

### Token Management (`/api/tokens`)
- `GET /all` - Get all tokens from CoinGecko
- `GET /platform/:platform` - Get tokens by platform
- `GET /:tokenId` - Get token information
- `GET /:tokenId/price` - Get token price
- `POST /prices` - Get multiple token prices
- `GET /search` - Search tokens
- `GET /trending` - Get trending tokens
- `GET /health` - Health check
- `POST /clear-cache` - Clear cache

### Swap Operations (`/api/swap`)
- `POST /quote` - Get swap quote
- `POST /execute` - Execute swap transaction
- `GET /transaction/:hash` - Get transaction status
- `GET /history` - Get swap history
- `GET /health` - Health check

### Transaction Management (`/api/transactions`)
- `GET /history` - Get user transaction history
- `GET /:hash` - Get transaction by hash
- `PUT /:hash/status` - Update transaction status
- `GET /stats` - Get transaction statistics
- `GET /volume-24h` - Get 24h volume
- `GET /status/:status` - Get transactions by status
- `GET /chain/:chainId` - Get transactions by chain
- `DELETE /:hash` - Delete transaction (admin)
- `GET /health` - Health check

## Database Models

### Session Model
```javascript
{
  sessionId: String,
  walletAddress: String,
  walletType: String,
  lastActivity: Date,
  expiresAt: Date,
  userAgent: String,
  ipAddress: String
}
```

### SwapTransaction Model
```javascript
{
  walletAddress: String,
  fromToken: String,
  toToken: String,
  fromTokenAddress: String,
  toTokenAddress: String,
  fromAmount: Number,
  toAmount: Number,
  exchangeRate: Number,
  slippage: Number,
  transactionHash: String,
  sequenceNumber: Number,
  version: Number,
  gasUsed: Number,
  gasUnitPrice: Number,
  maxGasAmount: Number,
  status: String,
  chainId: String,
  blockNumber: Number,
  errorMessage: String,
  errorCode: String,
  timestamp: Date,
  expirationTimestamp: Date
}
```

## Authentication Flow

1. **Wallet Connection**
   ```
   User connects wallet → Create session → Return sessionId
   ```

2. **API Access**
   ```
   Include sessionId in header → Validate session → Access API
   ```

3. **Transaction Tracking**
   ```
   Execute swap → Save transaction → Track status → Update history
   ```

## Security Features

- **Session Management**: Secure session handling with expiration
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Proper error responses without sensitive data
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: HTTP security headers

## Performance Optimizations

- **Caching**: CoinGecko responses cached for 5 minutes
- **Database Indexes**: Optimized queries for transaction history
- **Connection Pooling**: Efficient database connections
- **Compression**: Response compression for large datasets
- **Graceful Shutdown**: Proper server shutdown handling

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/safeswap

# Server
PORT=3001
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Logging
LOG_FORMAT=combined
```

## Testing

Run the test script to verify all endpoints:

```bash
node test-optimized-backend.js
```

This will test:
- Health checks
- User authentication
- Token operations
- Swap functionality
- Transaction management
- Service health

## Deployment

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Environment variables configured

### Steps
1. Install dependencies: `npm install`
2. Set environment variables
3. Start server: `npm start`
4. Access Swagger docs: `http://localhost:3001/api-docs`

## Monitoring

- **Health Checks**: `/health` endpoint for basic status
- **Service Health**: Individual service health endpoints
- **Logging**: Comprehensive request and error logging
- **Metrics**: Transaction volume and success rates

## Benefits

1. **Simplified Architecture**: Reduced complexity and maintenance
2. **Real-time Data**: Live token prices and information
3. **Scalability**: Efficient resource usage
4. **Security**: Minimal data storage reduces attack surface
5. **Performance**: Optimized for high throughput
6. **Maintainability**: Clean, well-documented code

## Future Enhancements

- WebSocket support for real-time updates
- Advanced caching strategies
- Multi-chain support expansion
- Enhanced analytics and reporting
- Admin dashboard for monitoring

---

This optimized backend provides a solid foundation for a production-ready swap platform while maintaining simplicity and security. 