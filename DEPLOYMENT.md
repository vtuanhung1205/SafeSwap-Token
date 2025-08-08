# SafeSwap Deployment Guide

## 🚀 Deploy to Render.com

### Prerequisites
- GitHub repository connected to Render.com
- MongoDB Atlas cluster set up
- Render.com account

### Step 1: Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file

### Step 2: Environment Variables

The following environment variables are automatically set via `render.yaml`:

#### Backend Environment Variables:
- `NODE_ENV=production`
- `PORT=10000`
- `MONGODB_URI=mongodb+srv://safeswap_user:12345@safeswap.6pk7wds.mongodb.net/safeswap?retryWrites=true&w=majority&appName=SafeSwap`
- `JWT_SECRET=SafeSwap2025SecureJWTSecretKeyForProductionUse!@#$%`
- `JWT_REFRESH_SECRET=SafeSwap2025RefreshTokenSecretKeyForProductionUse!@#$%`
- `APTOS_NETWORK=mainnet`
- `AI_SERVICE_URL=https://safeswap-ai-service.onrender.com`

#### Frontend Environment Variables:
- `VITE_API_URL=https://safeswap-backend-service.onrender.com/api`
- `VITE_WEBSOCKET_URL=https://safeswap-backend-service.onrender.com`

### Step 3: Deploy

#### Option 1: Automatic Deployment
1. Push to main branch
2. Render will automatically deploy

#### Option 2: Manual Deployment
```bash
# Make sure all changes are committed
git add .
git commit -m "Deploy: $(date)"
git push origin main
```

### Step 4: Verify Deployment

#### Backend Health Check:
```bash
curl https://safeswap-backend-service.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-08-08T11:47:02.956Z",
  "uptime": 389.9411164,
  "environment": "production"
}
```

#### Frontend Check:
Visit: https://safeswap-frontend.onrender.com

### Step 5: Monitor Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Check both services:
   - `safeswap-backend-service`
   - `safeswap-frontend`

### Troubleshooting

#### Common Issues:

1. **MongoDB Connection Failed**
   - Check if MongoDB Atlas cluster is accessible
   - Verify connection string in environment variables

2. **Build Failed**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

3. **CORS Issues**
   - Verify ALLOWED_ORIGINS includes frontend URL
   - Check CORS configuration in backend

4. **Environment Variables**
   - Ensure all required variables are set in Render dashboard
   - Check for typos in variable names

### URLs

- **Backend API**: https://safeswap-backend-service.onrender.com
- **Frontend**: https://safeswap-frontend.onrender.com
- **Health Check**: https://safeswap-backend-service.onrender.com/health

### Environment Variables Reference

See `Backend/RENDER_ENV_VARS.txt` for complete list of environment variables.

### Support

If you encounter issues:
1. Check Render deployment logs
2. Verify MongoDB Atlas connection
3. Test API endpoints manually
4. Check browser console for frontend errors 