# 🗄️ MongoDB Atlas Setup Guide

## **Step 1: Create MongoDB Atlas Account**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up for a free account
3. Create a new project called "SafeSwap"

## **Step 2: Create Database Cluster**

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create"

## **Step 3: Create Database User**

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Set username: `safeswap_user`
4. Set password: `safeswap123` (or your preferred password)
5. Select "Read and write to any database"
6. Click "Add User"

## **Step 4: Configure Network Access**

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## **Step 5: Get Connection String**

1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

## **Step 6: Update Backend Environment**

Create `Backend/.env` file with:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://safeswap_user:YOUR_PASSWORD@cluster0.mongodb.net/safeswap?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://safeswap_user:YOUR_PASSWORD@cluster0.mongodb.net/safeswap?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=safeswap-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# Other configurations...
```

## **Step 7: Test Connection**

```bash
cd Backend
npm start
```

You should see: "MongoDB Connected: cluster0.mongodb.net"

## **Troubleshooting**

### If you get "bad auth" error:
1. Check username/password in connection string
2. Make sure user has correct permissions
3. Verify network access is configured

### If you get "connection timeout":
1. Check internet connection
2. Verify cluster is running
3. Check firewall settings

## **Production Setup**

For production, use a dedicated MongoDB Atlas cluster with:
- M10 or higher tier
- Dedicated IP whitelist
- Stronger password
- Separate database user for production 