# 🚀 **Hướng dẫn Login Backend - SafeSwap**

## 📋 **Tổng quan**

Đã chuyển toàn bộ logic login từ Frontend sang Backend để tối ưu hóa kiến trúc và bảo mật.

## ✅ **Những gì đã thực hiện**

### **1. Backend API (Đã có sẵn)**
- ✅ **Google OAuth**: `/api/auth/google`
- ✅ **Aptos Connect**: `/api/auth/aptos-connect`
- ✅ **Email/Password**: `/api/auth/login`
- ✅ **Register**: `/api/auth/register`
- ✅ **Wallet Login**: `/api/auth/wallet-login`
- ✅ **Profile Management**: `/api/auth/profile`
- ✅ **Wallet Connection**: `/api/auth/connect-wallet`

### **2. Frontend Service**
- ✅ **authService.js**: Service đơn giản để gọi Backend API
- ✅ **AuthContext.jsx**: Context đã được cập nhật để sử dụng Backend
- ✅ **SimpleLogin.jsx**: Component login đơn giản và đẹp

### **3. Dọn dẹp Frontend**
- ✅ **Xóa**: Tất cả file AptosKeylessAuth không cần thiết
- ✅ **Xóa**: WalletProvider và các dependencies phức tạp
- ✅ **Xóa**: Các package Aptos không cần thiết
- ✅ **Cập nhật**: package.json đã được làm sạch

## 🔧 **Cách sử dụng**

### **1. Khởi động Backend**
```bash
cd SafeSwap-Token/Backend
npm install
npm start
```

### **2. Khởi động Frontend**
```bash
cd SafeSwap-Token/Frontend
npm install
npm run dev
```

### **3. Sử dụng Login**
- **Google**: Click "Đăng nhập với Google"
- **Aptos Connect**: Click "Đăng nhập với Aptos Connect"
- **Email**: Nhập email và mật khẩu

## 📊 **Kiến trúc mới**

```
Frontend (React)
├── authService.js (Gọi API)
├── AuthContext.jsx (Quản lý state)
└── SimpleLogin.jsx (UI)

Backend (Express)
├── /api/auth/google
├── /api/auth/aptos-connect
├── /api/auth/login
├── /api/auth/register
└── /api/auth/wallet-login
```

## 🎯 **Lợi ích**

### **1. Bảo mật**
- ✅ Token được lưu ở Backend
- ✅ Validation được thực hiện ở Backend
- ✅ Rate limiting và security headers

### **2. Hiệu suất**
- ✅ Frontend nhẹ hơn
- ✅ Ít dependencies hơn
- ✅ Load time nhanh hơn

### **3. Bảo trì**
- ✅ Code đơn giản hơn
- ✅ Ít lỗi hơn
- ✅ Dễ debug hơn

## 🔧 **Environment Variables**

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APTOS_CONNECT_CLIENT_ID=your_aptos_connect_client_id
VITE_DAPP_URL=https://safeswap-frontend.onrender.com
VITE_CALLBACK_URL=https://safeswap-frontend.onrender.com/aptos-connect-callback
```

### **Backend (.env)**
```env
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
MONGODB_URI=your_mongodb_uri
```

## 🚀 **Test**

### **1. Test Google Login**
1. Click "Đăng nhập với Google"
2. Chọn tài khoản Google
3. Kiểm tra user được tạo trong database

### **2. Test Aptos Connect**
1. Click "Đăng nhập với Aptos Connect"
2. Chọn ví Aptos
3. Kiểm tra wallet được kết nối

### **3. Test Email Login**
1. Nhập email và mật khẩu
2. Click "Đăng nhập"
3. Kiểm tra token được lưu

## 📝 **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/aptos-connect` | Aptos Connect login |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/wallet-login` | Wallet login |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/connect-wallet` | Connect wallet |
| DELETE | `/api/auth/disconnect-wallet` | Disconnect wallet |
| POST | `/api/auth/logout` | Logout |

## 🎉 **Kết quả**

- ✅ **Frontend**: Đơn giản, nhẹ, dễ bảo trì
- ✅ **Backend**: Xử lý tất cả logic phức tạp
- ✅ **Bảo mật**: Token và validation ở Backend
- ✅ **Hiệu suất**: Load time nhanh hơn
- ✅ **UX**: Giao diện đẹp và responsive

**Login system đã được tối ưu hóa hoàn toàn! 🚀**
