# 🔧 **Hướng dẫn cài đặt Environment Variables trên Render**

## 🚨 **Lỗi hiện tại**
```
Database connection failed: Error: querySrv ENOTFOUND _mongodb._tcp.safeswap.6pk7wds.mongodb.net
```

## ✅ **Cách khắc phục**

### **1. Tạo MongoDB Atlas Database**

1. **Truy cập**: https://cloud.mongodb.com
2. **Đăng nhập** hoặc tạo tài khoản mới
3. **Tạo cluster mới** (nếu chưa có)
4. **Lấy connection string**

### **2. Cập nhật Environment Variables trên Render**

**Truy cập Render Dashboard:**
1. Vào https://dashboard.render.com
2. Chọn service **safeswap-backend**
3. Click **Environment** tab
4. Thêm/sửa các variables sau:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safeswap?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/safeswap?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Aptos
APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.mainnet.aptoslabs.com

# Server
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://safeswap-frontend.onrender.com
```

### **3. MongoDB Connection String Format**

**Đúng:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Sai (hiện tại):**
```
mongodb+srv://safeswap.6pk7wds.mongodb.net
```

### **4. Các bước chi tiết**

#### **A. Tạo MongoDB Atlas Database**

1. **Tạo Cluster:**
   - Chọn **Shared** (Free tier)
   - Chọn **AWS** và region gần nhất
   - Click **Create**

2. **Tạo Database User:**
   - Vào **Database Access**
   - Click **Add New Database User**
   - Username: `safeswap_user`
   - Password: `your_secure_password`
   - Role: `Read and write to any database`

3. **Whitelist IP:**
   - Vào **Network Access**
   - Click **Add IP Address**
   - Chọn **Allow Access from Anywhere** (0.0.0.0/0)

4. **Lấy Connection String:**
   - Vào **Database** > **Connect**
   - Chọn **Connect your application**
   - Copy connection string

#### **B. Cập nhật Render Environment**

1. **Mở Render Dashboard**
2. **Chọn service safeswap-backend**
3. **Click Environment tab**
4. **Thêm/sửa variables:**

```env
MONGODB_URI=mongodb+srv://safeswap_user:your_password@cluster.mongodb.net/safeswap?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://safeswap_user:your_password@cluster.mongodb.net/safeswap?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://safeswap-frontend.onrender.com
```

5. **Click Save**
6. **Redeploy service**

### **5. Test Connection**

Sau khi cập nhật, kiểm tra logs:

```bash
# Nếu thành công sẽ thấy:
MongoDB Connected: cluster.mongodb.net
```

### **6. Troubleshooting**

**Nếu vẫn lỗi:**

1. **Kiểm tra connection string:**
   - Đảm bảo username/password đúng
   - Đảm bảo cluster name đúng
   - Đảm bảo database name đúng

2. **Kiểm tra Network Access:**
   - IP whitelist phải cho phép 0.0.0.0/0

3. **Kiểm tra Database User:**
   - User phải có quyền Read and Write

4. **Test connection string:**
   - Copy connection string vào MongoDB Compass để test

### **7. Environment Variables Checklist**

```env
# ✅ Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safeswap?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/safeswap?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://safeswap-frontend.onrender.com

# ✅ Optional (for OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
```

**Sau khi cập nhật xong, redeploy service và kiểm tra logs! 🚀**
