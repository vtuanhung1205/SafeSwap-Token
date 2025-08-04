# SafeSwap Token Backend

Backend API cho SafeSwap Token - Hệ thống quản lý giao dịch token trên Aptos blockchain với tính năng bảo mật và phân tích rủi ro real-time.

## 🚀 Tính năng chính

### 🔗 Aptos Blockchain Integration
- Kết nối trực tiếp với Aptos mainnet
- Quản lý giao dịch token real-time
- Hỗ trợ đầy đủ các ví Aptos (Petra, Martian, Pontem, etc.)
- Validation và security checks

### 💰 Transaction Management
- Theo dõi giao dịch real-time
- Lưu trữ lịch sử giao dịch
- Phân tích rủi ro AI
- Export dữ liệu giao dịch

### 🔐 Security & Authentication
- JWT authentication
- Rate limiting
- Input validation
- Error handling
- Logging system

### 📊 Analytics & Monitoring
- Dashboard analytics
- Risk analysis
- Transaction trends
- Network statistics

## 🛠️ Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm hoặc yarn

### Cài đặt dependencies
```bash
cd Backend
npm install
```

### Cấu hình môi trường
1. Copy file `env.example` thành `.env`
```bash
cp env.example .env
```

2. Cập nhật các biến môi trường trong `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/safeswap

# Aptos Configuration
APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
APTOS_NETWORK=mainnet

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Khởi chạy server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Authentication
```
POST /api/auth/register     - Đăng ký tài khoản
POST /api/auth/login        - Đăng nhập
GET  /api/auth/profile      - Lấy thông tin profile
PUT  /api/auth/profile      - Cập nhật profile
POST /api/auth/connect-wallet - Kết nối ví
```

### Transactions
```
GET    /api/transactions                    - Lấy danh sách giao dịch
POST   /api/transactions                    - Tạo giao dịch mới
GET    /api/transactions/:hash              - Lấy chi tiết giao dịch
PUT    /api/transactions/:hash              - Cập nhật giao dịch
GET    /api/transactions/stats/summary      - Thống kê giao dịch
GET    /api/transactions/analytics/overview - Phân tích giao dịch
GET    /api/transactions/export/csv         - Export giao dịch
```

### Tokens
```
GET /api/tokens/:address/:name              - Lấy metadata token
GET /api/tokens/balances                    - Lấy balance tokens
GET /api/tokens/balance/:address/:name      - Lấy balance token cụ thể
GET /api/tokens/popular/list                - Danh sách token phổ biến
GET /api/tokens/search                      - Tìm kiếm token
GET /api/tokens/price/:address/:name        - Lấy giá token
POST /api/tokens/validate                   - Validate token
```

### Wallet
```
GET    /api/wallet/supported                - Danh sách ví hỗ trợ
POST   /api/wallet/generate                 - Tạo ví mới
POST   /api/wallet/import                   - Import ví
GET    /api/wallet/info/:address            - Thông tin ví
GET    /api/wallet/balance/:address         - Balance ví
GET    /api/wallet/tokens/:address          - Tokens trong ví
POST   /api/wallet/check-connection         - Kiểm tra kết nối
POST   /api/wallet/validate-transaction     - Validate giao dịch
POST   /api/wallet/estimate-fee             - Ước tính phí
POST   /api/wallet/transfer                 - Chuyển token
GET    /api/wallet/history/:address         - Lịch sử giao dịch
```

### Users
```
GET  /api/users/stats                       - Thống kê user
GET  /api/users/dashboard                   - Dashboard user
PUT  /api/users/preferences                 - Cập nhật preferences
GET  /api/users/risk-profile                - Risk profile
PUT  /api/users/risk-profile                - Cập nhật risk profile
GET  /api/users/limits                      - Giới hạn giao dịch
PUT  /api/users/limits                      - Cập nhật limits
```

### Analytics
```
GET /api/analytics/overview                 - Tổng quan analytics
GET /api/analytics/trends                   - Xu hướng giao dịch
GET /api/analytics/risk-analysis            - Phân tích rủi ro
GET /api/analytics/network-stats            - Thống kê network
```

## 🔧 WebSocket Events

### Client Events
```javascript
// Join user room
socket.emit('join-user', userId);

// Subscribe to transaction updates
socket.emit('subscribe-transactions', userId);

// Subscribe to price updates
socket.emit('subscribe-prices');
```

### Server Events
```javascript
// Transaction created
socket.on('transaction-created', { transaction });

// Transaction updated
socket.on('transaction-updated', { hash, status, additionalData });

// Price update
socket.on('price-update', { timestamp, prices });
```

## 🏗️ Cấu trúc dự án

```
Backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── Transaction.js       # Transaction model
│   │   └── User.js              # User model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── transactions.js      # Transaction routes
│   │   ├── tokens.js            # Token routes
│   │   ├── users.js             # User routes
│   │   ├── analytics.js         # Analytics routes
│   │   └── wallet.js            # Wallet routes
│   ├── services/
│   │   ├── aptosService.js      # Aptos blockchain service
│   │   ├── transactionService.js # Transaction management
│   │   └── walletService.js     # Wallet management
│   ├── utils/
│   │   └── logger.js            # Logging utility
│   └── index.js                 # Main server file
├── logs/                        # Log files
├── package.json                 # Dependencies
├── env.example                  # Environment variables example
└── README.md                    # This file
```

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Password hashing với bcrypt
- Session management
- Rate limiting

### Input Validation
- Express-validator cho tất cả inputs
- Address validation cho Aptos
- Amount validation
- Token validation

### Error Handling
- Centralized error handling
- Detailed error logging
- User-friendly error messages
- Graceful degradation

## 📊 Monitoring & Logging

### Logging
- Winston logger
- Structured logging
- Log rotation
- Error tracking

### Health Checks
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure MongoDB production URI
3. Set strong JWT secret
4. Configure rate limiting
5. Set up monitoring

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [API Docs]
- Issues: [GitHub Issues]
- Email: support@safeswap.com

---

**SafeSwap Token Backend** - Secure, Real-time Aptos Token Management System 