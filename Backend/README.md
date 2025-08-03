# SafeSwap Backend API

Backend API cho SafeSwap - nền tảng swap token trên Aptos blockchain với tính năng real-time scam detection.

## ✨ Tính năng chính

- 🔐 **Google OAuth Authentication**: Đăng nhập đơn giản với Google
- 🎯 **Aptos Wallet Integration**: Kết nối và quản lý ví Aptos
- 💰 **Real-time Price Feed**: Cập nhật giá token theo thời gian thực
- 🛡️ **Scam Detection**: Phân tích và cảnh báo token nguy hiểm
- 📊 **Swap History**: Theo dõi lịch sử giao dịch
- 🔌 **WebSocket**: Cập nhật real-time qua WebSocket
- 📈 **Rate Limiting**: Bảo vệ API khỏi spam

## 🚀 Quick Start

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Thiết lập environment variables
```bash
cp env.example .env
# Chỉnh sửa các giá trị trong file .env
```

### 3. Chạy development server
```bash
npm run dev
```

### 4. Chạy production server
```bash
npm start
```

## 🔧 Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safeswap

# Aptos Configuration
APTOS_NETWORK=testnet
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com

# External APIs
COINGECKO_API_KEY=your-coingecko-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000

# Logging
LOG_FORMAT=combined
LOG_LEVEL=info

# AI Service (Optional)
AI_SERVICE_URL=https://your-ai-service-url.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📋 API Endpoints

### Authentication (Google OAuth)
- `POST /api/auth/google` - Đăng nhập với Google
- `GET /api/auth/profile` - Thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/status` - Kiểm tra trạng thái đăng nhập
- `GET /api/auth/validate` - Xác thực session

### Wallet
- `POST /api/wallet/connect` - Kết nối ví
- `POST /api/wallet/disconnect` - Ngắt kết nối ví
- `GET /api/wallet/info` - Thông tin ví
- `GET /api/wallet/balance` - Số dư ví
- `GET /api/wallet/transactions` - Lịch sử giao dịch

### Price Feed
- `GET /api/price/all` - Tất cả giá token
- `GET /api/price/token/:symbol` - Giá của token cụ thể
- `GET /api/price/exchange-rate` - Tỷ giá hối đoái
- `POST /api/price/analyze` - Phân tích token

### Swap
- `POST /api/swap/quote` - Lấy quote swap
- `POST /api/swap/execute` - Thực hiện swap
- `GET /api/swap/history` - Lịch sử swap
- `GET /api/swap/stats` - Thống kê swap

## 🏗️ Kiến trúc

```
Backend/
├── src/
│   ├── config/          # Cấu hình database, swagger
│   ├── controllers/     # Controllers xử lý request
│   ├── middleware/      # Middleware xử lý request
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── jobs/            # Cron jobs
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── logs/                # Log files
├── package.json
└── README.md
```

## 🔄 Services

### AuthService
- Quản lý session-based authentication
- Google OAuth integration
- User management

### AptosService
- Kết nối Aptos blockchain
- Quản lý ví và balance
- Transaction handling

### PriceFeedService
- Fetch giá từ CoinGecko
- Cập nhật real-time với cron job
- Tính toán exchange rates

### ScamDetectionService
- Phân tích token addresses
- Kiểm tra suspicious patterns
- Risk scoring system

### WebSocketService
- Real-time price updates
- Client connection management
- Event broadcasting

## 📊 Database Models

### User
- Email, name, avatar
- Google OAuth integration
- Wallet address linking

### Wallet
- Aptos wallet information
- Balance tracking
- Connection status

### TokenPrice
- Token price data
- Market statistics
- Last update timestamps

### SwapTransaction
- Swap transaction records
- Status tracking
- Scam risk scores

## 🔒 Security Features

- Session-based authentication
- Rate limiting
- Input validation
- Error handling
- CORS protection
- Helmet security headers

## 📦 Scripts

```bash
# Development
npm run dev          # Chạy với nodemon

# Production
npm start           # Chạy production server

# Utilities
npm run lint        # ESLint check
```

## 🔧 Development

### 1. Cài đặt development dependencies
```bash
npm install --save-dev
```

### 2. Chạy development server
```bash
npm run dev
```

### 3. Monitor logs
```bash
tail -f logs/combined.log
```

## 🌐 WebSocket Events

### Client -> Server
- `subscribe_prices` - Subscribe to price updates
- `unsubscribe_prices` - Unsubscribe from price updates

### Server -> Client
- `initial_prices` - Initial price data
- `price_update` - Real-time price updates
- `subscription_success` - Subscription confirmation

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Winston logging to files
- Real-time error reporting
- Performance metrics

## 🚀 Production Deployment

### Render.com (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Railway
1. Connect GitHub repository
2. Set environment variables
3. Auto-deploy

### Heroku
1. Install Heroku CLI
2. Set environment variables
3. Deploy with Git

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` configuration
   - Ensure frontend URL is included

2. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure database is accessible

3. **Session Issues**
   - Check cookie settings
   - Verify domain configuration
   - Test with different browsers

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Test backend locally
npm run dev

# Check logs
tail -f logs/combined.log
```

## 📞 Support

For backend issues:
1. Check logs in `logs/` directory
2. Review environment variables
3. Test endpoints with Postman
4. Monitor health check endpoint

---

**Happy Coding! 🚀** 