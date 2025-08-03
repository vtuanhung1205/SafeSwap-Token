# 🚀 SafeSwap Deployment Guide

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- Git
- MongoDB database (local or cloud)
- Render/Vercel accounts (optional)

## 🔧 Environment Setup

### 1. Backend Environment Variables

Create `.env` file in `Backend/` directory:

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
```

### 2. Frontend Environment Variables

Create `.env` file in `Frontend/` directory:

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# App Configuration
VITE_APP_NAME=SafeSwap
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment Options

### Option 1: Render.com (Recommended)

#### Backend Deployment

1. **Connect Repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**
   ```
   Name: safeswap-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - Add all variables from `Backend/env.example`
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `ALLOWED_ORIGINS` to include your frontend domain

#### Frontend Deployment

1. **Create Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend**
   ```
   Name: safeswap-frontend
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   - Add `VITE_API_URL` pointing to your backend URL

### Option 2: Vercel

#### Backend Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Backend**
   ```bash
   cd Backend
   vercel --prod
   ```

#### Frontend Deployment

1. **Deploy Frontend**
   ```bash
   cd Frontend
   vercel --prod
   ```

### Option 3: Railway

1. **Connect Repository**
   - Go to [Railway Dashboard](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configure Service**
   - Railway will auto-detect Node.js
   - Set environment variables in Railway dashboard

### Option 4: Heroku

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy Backend**
   ```bash
   cd Backend
   heroku create safeswap-backend
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   git push heroku main
   ```

3. **Deploy Frontend**
   ```bash
   cd Frontend
   heroku create safeswap-frontend
   heroku buildpacks:set mars/create-react-app
   git push heroku main
   ```

## 🐳 Docker Deployment

### Backend Docker

```bash
cd Backend
docker build -t safeswap-backend .
docker run -p 5000:5000 --env-file .env safeswap-backend
```

### Frontend Docker

```bash
cd Frontend
docker build -t safeswap-frontend .
docker run -p 3000:3000 safeswap-frontend
```

### AI Service Docker

```bash
cd A-A-C
docker build -t safeswap-ai .
docker run -p 5001:5000 --env-file .env safeswap-ai
```

## 🔧 Manual Deployment Steps

### 1. Install Dependencies

```bash
# Backend
cd Backend
npm install

# Frontend
cd Frontend
npm install
```

### 2. Build Frontend

```bash
cd Frontend
npm run build
```

### 3. Start Backend

```bash
cd Backend
npm start
```

### 4. Test Deployment

```bash
# Test Backend
curl http://localhost:5000/health

# Test Frontend
curl http://localhost:3000
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to Git
- Use platform-specific secret management
- Rotate API keys regularly

### 2. CORS Configuration
- Set `ALLOWED_ORIGINS` to specific domains
- Avoid using `*` in production

### 3. Database Security
- Use MongoDB Atlas for production
- Enable network access controls
- Use strong passwords

### 4. SSL/HTTPS
- Enable HTTPS on all platforms
- Use proper SSL certificates
- Redirect HTTP to HTTPS

## 📊 Monitoring & Logging

### 1. Health Checks
- Backend: `GET /health`
- AI Service: `GET /health`
- Frontend: Static files

### 2. Logging
- Backend logs to `logs/` directory
- Use Winston for structured logging
- Monitor error rates

### 3. Performance
- Monitor response times
- Set up alerts for downtime
- Track API usage

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` configuration
   - Ensure frontend URL is included

2. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure database is accessible

3. **Build Failures**
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

4. **Session Issues**
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
cd Backend && npm run dev

# Test frontend locally
cd Frontend && npm run dev

# Check logs
tail -f Backend/logs/combined.log
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review logs for error messages
3. Test locally before deploying
4. Use platform monitoring tools

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy SafeSwap

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd Backend && npm install
      - run: cd Backend && npm test
      # Add deployment steps for your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd Frontend && npm install
      - run: cd Frontend && npm run build
      # Add deployment steps for your platform
```

---

**Happy Deploying! 🚀** 