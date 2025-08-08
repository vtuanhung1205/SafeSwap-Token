#!/bin/bash

echo "🚀 Deploying SafeSwap Frontend to Render.com..."

# Build the frontend
echo "📦 Building frontend..."
cd Frontend
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

cd ..

# Commit and push changes
echo "📝 Committing changes..."
git add .
git commit -m "Deploy frontend: $(date)"

echo "📤 Pushing to repository..."
git push origin main

echo "✅ Frontend deployment initiated!"
echo "🌐 Frontend will be available at: https://safeswap-frontend.onrender.com"
echo ""
echo "📊 Monitor deployment at: https://dashboard.render.com"
echo ""
echo "⏳ Deployment usually takes 3-5 minutes..." 