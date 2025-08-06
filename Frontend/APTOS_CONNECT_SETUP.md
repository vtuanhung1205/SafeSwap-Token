# Aptos Connect OAuth Setup Guide

## Tổng quan

Aptos Connect OAuth cho phép người dùng đăng nhập bằng Google hoặc Apple thông qua Aptos Connect, thay vì sử dụng Google OAuth trực tiếp. Điều này cung cấp trải nghiệm đăng nhập nhất quán và bảo mật hơn.

## Cách 1: Sử dụng Aptos Connect với clientId (Khuyến nghị)

### Bước 1: Đăng ký tài khoản Aptos Connect

1. Truy cập [https://aptosconnect.app/](https://aptosconnect.app/)
2. Click "Get Started" hoặc "Sign Up"
3. Tạo tài khoản mới với email của bạn
4. Xác thực email

### Bước 2: Tạo Application

1. Sau khi đăng nhập, click "Create New Application"
2. Điền thông tin:
   - **Application Name**: SafeSwap
   - **Description**: SafeSwap Token Swap Platform
   - **Website URL**: https://safeswap-frontend.onrender.com (production) hoặc http://localhost:5173 (development)
   - **Redirect URI**: https://safeswap-frontend.onrender.com (production) hoặc http://localhost:5173 (development)

### Bước 3: Lấy Client ID

1. Sau khi tạo application, copy **Client ID**
2. Mở file `.env.local` trong thư mục `Frontend/`
3. Thêm dòng sau:
   ```env
   VITE_APTOS_CONNECT_CLIENT_ID=your_client_id_here
   ```

### Bước 4: Cấu hình OAuth Providers

1. Trong dashboard Aptos Connect, vào tab "OAuth Settings"
2. Enable Google và Apple OAuth
3. Cấu hình Google OAuth:
   - Client ID: Lấy từ Google Cloud Console
   - Client Secret: Lấy từ Google Cloud Console
4. Cấu hình Apple OAuth:
   - Service ID: Lấy từ Apple Developer Console
   - Team ID: Lấy từ Apple Developer Console
   - Key ID: Lấy từ Apple Developer Console

## Cách 2: Sử dụng Aptos Connect không cần clientId (Development)

Nếu bạn không muốn đăng ký Aptos Connect, có thể sử dụng fallback mode:

1. Để trống `VITE_APTOS_CONNECT_CLIENT_ID` trong `.env.local`
2. Hệ thống sẽ tự động sử dụng fallback mode với clientId mặc định

## Cấu hình Environment Variables

### Frontend (.env.local)

```env
# Aptos Connect OAuth
VITE_APTOS_CONNECT_CLIENT_ID=your_aptos_connect_client_id_here
VITE_APTOS_CONNECT_REDIRECT_URI=https://your-domain.com

# Aptos Node (QuickNode)
VITE_APTOS_NODE_URL=https://responsive-weathered-hill.aptos-mainnet.quiknode.pro/b363dcabb59e76d6355f22f77644f3a924bce229
```

### Backend (.env)

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Aptos Configuration
APTOS_NODE_URL=https://responsive-weathered-hill.aptos-mainnet.quiknode.pro/b363dcabb59e76d6355f22f77644f3a924bce229
APTOS_NETWORK=mainnet
```

## Testing

### Development

1. Chạy frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

2. Chạy backend:
   ```bash
   cd Backend
   npm run dev
   ```

3. Mở browser và test đăng nhập với Aptos Connect

### Production

1. Deploy frontend với environment variables đã cấu hình
2. Deploy backend với environment variables đã cấu hình
3. Test đăng nhập với Aptos Connect

## Troubleshooting

### Lỗi "Aptos Connect not initialized"

- Kiểm tra `VITE_APTOS_CONNECT_CLIENT_ID` trong `.env.local`
- Đảm bảo network connection ổn định
- Kiểm tra console để xem lỗi chi tiết

### Lỗi "Authentication failed"

- Kiểm tra cấu hình OAuth providers trong Aptos Connect dashboard
- Đảm bảo redirect URI đúng
- Kiểm tra backend logs để xem lỗi chi tiết

### Lỗi "Client ID not found"

- Thêm `VITE_APTOS_CONNECT_CLIENT_ID` vào `.env.local`
- Restart development server
- Clear browser cache

## Security Considerations

1. **Client ID**: Không commit client ID vào git repository
2. **HTTPS**: Sử dụng HTTPS trong production
3. **Redirect URI**: Cấu hình chính xác redirect URI
4. **Token Validation**: Backend sẽ validate tokens từ Aptos Connect

## Features

- ✅ Google OAuth qua Aptos Connect
- ✅ Apple OAuth qua Aptos Connect
- ✅ Automatic user registration
- ✅ JWT token generation
- ✅ User profile management
- ✅ Fallback mode cho development

## Migration từ Google OAuth

Nếu bạn đang sử dụng Google OAuth trực tiếp, có thể migrate sang Aptos Connect:

1. Cập nhật frontend để sử dụng `AptosConnectOAuth` component
2. Cập nhật backend để hỗ trợ `/auth/aptos-connect` endpoint
3. Test migration với user hiện tại
4. Có thể giữ cả 2 methods trong thời gian transition

## Support

Nếu gặp vấn đề, kiểm tra:

1. [Aptos Connect Documentation](https://aptosconnect.app/docs)
2. [Aptos Developer Documentation](https://aptos.dev/)
3. Console logs trong browser
4. Backend logs 