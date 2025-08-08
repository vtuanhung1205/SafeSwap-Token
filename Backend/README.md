# SafeSwap Backend API

Backend API cho SafeSwap - nền tảng swap token trên Aptos blockchain với tính năng real-time scam detection.

## ✨ Tính năng chính

- 🔐 **Authentication**: JWT + Google OAuth
- 🎯 **Aptos Wallet Integration**: Kết nối và quản lý ví Aptos
- 💰 **Real-time Price Feed**: Cập nhật giá token theo thời gian thực
- 🛡️ **Scam Detection**: Phân tích và cảnh báo token nguy hiểm
- 📊 **Swap History**: Theo dõi lịch sử giao dịch
- 🔌 **WebSocket**: Cập nhật real-time qua WebSocket
- 📈 **Rate Limiting**: Bảo vệ API khỏi spam

## 🚀 Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd SafeSwap-Token/Backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Thiết lập environment variables
```bash
cp .env.example .env
# Chỉnh sửa các giá trị trong file .env
```

### 4. Chạy MongoDB
```bash
# Sử dụng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Hoặc cài đặt MongoDB local
```

### 5. Khởi chạy server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/safeswap

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Aptos
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com

# APIs
COINGECKO_API_KEY=your-coingecko-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký
- `GET /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/profile` - Thông tin profile
- `POST /api/v1/auth/refresh` - Refresh token

### Wallet
- `POST /api/v1/wallet/connect` - Kết nối ví
- `POST /api/v1/wallet/disconnect` - Ngắt kết nối ví
- `GET /api/v1/wallet/info` - Thông tin ví
- `GET /api/v1/wallet/balance` - Số dư ví
- `GET /api/v1/wallet/transactions` - Lịch sử giao dịch

### Price Feed
- `GET /api/v1/price/all` - Tất cả giá token
- `GET /api/v1/price/token/:symbol` - Giá của token cụ thể
- `GET /api/v1/price/exchange-rate` - Tỷ giá hối đoái
- `POST /api/v1/price/analyze` - Phân tích token

### Swap
- `POST /api/v1/swap/quote` - Lấy quote swap
- `POST /api/v1/swap/execute` - Thực hiện swap
- `GET /api/v1/swap/history` - Lịch sử swap
- `GET /api/v1/swap/stats` - Thống kê swap

## 🏗️ Kiến trúc

```
Backend/
├── src/
│   ├── config/          # Cấu hình database
│   ├── controllers/     # Controllers xử lý request
│   ├── middleware/      # Middleware xử lý request
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── logs/                # Log files
├── dist/                # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Services

### AuthService
- Quản lý JWT tokens
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

- JWT authentication
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
npm run build        # Build TypeScript
npm start           # Chạy production server

# Utilities
npm run lint        # ESLint check
npm test           # Run tests
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

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (Nginx)
5. Set up process manager (PM2)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details 