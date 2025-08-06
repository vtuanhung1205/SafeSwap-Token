# Aptos API Key Setup Guide

## Tổng quan
Để tránh rate limits khi sử dụng public Aptos node, bạn nên sử dụng API key từ các provider như QuickNode hoặc Alchemy.

## Bước 1: Chọn Provider

### Option 1: QuickNode (Khuyến nghị)
1. Truy cập: https://www.quicknode.com/
2. Đăng ký tài khoản
3. Tạo endpoint cho Aptos Mainnet
4. Copy endpoint URL

### Option 2: Alchemy
1. Truy cập: https://www.alchemy.com/
2. Đăng ký tài khoản
3. Tạo app cho Aptos Mainnet
4. Copy API key

## Bước 2: Cấu hình Environment Variables

### Development (.env.local)
```bash
# Sử dụng public node (có rate limits)
VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
```

### Production (.env.production)
```bash
# QuickNode
VITE_APTOS_NODE_URL=https://aptos-mainnet.quiknode.pro/YOUR_API_KEY/

# Hoặc Alchemy
VITE_APTOS_API_KEY=your_alchemy_api_key_here
```

## Bước 3: Deploy với API Key

### Render
1. Vào dashboard của Render
2. Chọn service của bạn
3. Vào tab "Environment"
4. Thêm biến môi trường:
   - `VITE_APTOS_NODE_URL` = `https://aptos-mainnet.quiknode.pro/YOUR_API_KEY/`

### Vercel
1. Vào dashboard của Vercel
2. Chọn project
3. Vào tab "Settings" > "Environment Variables"
4. Thêm biến môi trường tương tự

## Bước 4: Kiểm tra

Sau khi deploy, kiểm tra console để đảm bảo:
- ✅ Không có warning về API key
- ✅ Các request đến Aptos node thành công
- ✅ Không bị rate limit

## Lưu ý bảo mật

1. **Không commit API key vào git**
2. **Sử dụng environment variables**
3. **Rotate API key định kỳ**
4. **Monitor usage để tránh vượt quota**

## Troubleshooting

### Lỗi "Rate limit exceeded"
- Kiểm tra API key đã được cấu hình đúng chưa
- Đảm bảo environment variable được set trong production

### Lỗi "Invalid API key"
- Kiểm tra API key có đúng format không
- Đảm bảo endpoint URL đúng với provider

### Lỗi "Network error"
- Kiểm tra kết nối internet
- Đảm bảo provider service đang hoạt động 