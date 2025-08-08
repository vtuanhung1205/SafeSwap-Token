#!/bin/bash

echo "🚀 Starting SafeSwap deployment to Render.com..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first."
    exit 1
fi

# Check if we have changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes before deployment..."
    git add .
    git commit -m "Deploy: $(date)"
fi

# Push to main branch (assuming main is the default branch)
echo "📤 Pushing to main branch..."
git push origin main

echo "✅ Deployment initiated!"
echo "🌐 Backend will be available at: https://safeswap-backend-service.onrender.com"
echo "🌐 Frontend will be available at: https://safeswap-frontend.onrender.com"
echo ""
echo "📊 Monitor deployment at: https://dashboard.render.com"
echo ""
echo "⏳ Deployment usually takes 5-10 minutes..." 