#!/bin/bash

echo "🚀 Deploying SafeSwap Backend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the Backend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests if available
if [ -f "test-cors.js" ]; then
    echo "🧪 Running CORS tests..."
    node test-cors.js
fi

# Check if git is available
if command -v git &> /dev/null; then
    echo "📝 Checking git status..."
    git status
    
    echo "💾 Committing changes..."
    git add .
    git commit -m "Fix CORS configuration and add debugging"
    
    echo "🚀 Pushing to repository..."
    git push origin main
else
    echo "⚠️  Git not available. Please manually commit and push changes."
fi

echo "✅ Deployment script completed!"
echo "🔍 Check Render.com dashboard for deployment status."
echo "🧪 Test CORS with: curl -X OPTIONS https://safeswap-backend-service.onrender.com/api/auth/google -H 'Origin: https://safeswap-frontend.onrender.com' -v" 