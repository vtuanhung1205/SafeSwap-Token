# 🔧 **Hướng dẫn cài đặt Node.js và npm**

## 🚨 **Lỗi hiện tại**
```
npm : The term 'npm' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

## ✅ **Cách khắc phục**

### **Bước 1: Cài đặt Node.js**

#### **A. Tải từ trang chủ (Khuyến nghị)**

1. **Truy cập**: https://nodejs.org/
2. **Tải phiên bản LTS** (Long Term Support)
3. **Chạy file cài đặt**
4. **Chọn "Add to PATH"** trong quá trình cài đặt
5. **Restart PowerShell/Command Prompt**

#### **B. Sử dụng Chocolatey (Nếu có)**

```powershell
# Cài đặt Chocolatey trước (nếu chưa có)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Cài đặt Node.js
choco install nodejs
```

#### **C. Sử dụng Winget (Windows 10/11)**

```powershell
winget install OpenJS.NodeJS
```

### **Bước 2: Kiểm tra cài đặt**

Sau khi cài đặt, mở **PowerShell mới** và chạy:

```powershell
node --version
npm --version
```

### **Bước 3: Nếu vẫn lỗi**

#### **A. Kiểm tra PATH**

1. **Mở System Properties**
2. **Click "Environment Variables"**
3. **Trong "System Variables", tìm "Path"**
4. **Kiểm tra có đường dẫn Node.js không**
5. **Nếu không có, thêm:**
   ```
   C:\Program Files\nodejs\
   ```

#### **B. Restart máy tính**

Sau khi cài đặt, restart máy tính để đảm bảo PATH được cập nhật.

### **Bước 4: Test cài đặt**

```powershell
# Kiểm tra Node.js
node --version

# Kiểm tra npm
npm --version

# Test tạo project
mkdir test-node
cd test-node
npm init -y
```

### **Bước 5: Cài đặt dependencies cho SafeSwap**

Sau khi Node.js hoạt động:

```powershell
# Backend
cd SafeSwap-Token/Backend
npm install

# Frontend
cd SafeSwap-Token/Frontend
npm install
```

## 🎯 **Phiên bản khuyến nghị**

- **Node.js**: 18.x hoặc 20.x (LTS)
- **npm**: 9.x hoặc 10.x

## 🔧 **Troubleshooting**

### **Nếu vẫn lỗi PATH:**

1. **Tìm đường dẫn Node.js:**
   ```powershell
   Get-ChildItem "C:\Program Files\nodejs" -ErrorAction SilentlyContinue
   ```

2. **Thêm vào PATH thủ công:**
   - Mở "Edit the system environment variables"
   - Click "Environment Variables"
   - Trong "System Variables", chọn "Path" → "Edit"
   - Click "New" và thêm: `C:\Program Files\nodejs\`

3. **Restart PowerShell**

### **Nếu cài đặt bị lỗi:**

1. **Gỡ cài đặt Node.js cũ** (nếu có)
2. **Xóa thư mục**: `C:\Users\[username]\AppData\Roaming\npm`
3. **Cài đặt lại Node.js**

## ✅ **Kiểm tra sau khi cài đặt**

```powershell
# Kiểm tra Node.js
node --version

# Kiểm tra npm
npm --version

# Test npm
npm --help
```

**Sau khi cài đặt thành công, bạn có thể chạy các lệnh npm! 🚀**
