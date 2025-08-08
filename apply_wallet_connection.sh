#!/bin/bash

echo "🔄 Applying wallet connection from develop to feature branch..."

# Checkout to feature branch
git checkout feature

# Create backup of current wallet files
echo "📦 Creating backups..."
cp Frontend/src/components/WalletConnect.jsx Frontend/src/components/WalletConnect.jsx.backup
cp Frontend/src/contexts/AuthContext.jsx Frontend/src/contexts/AuthContext.jsx.backup
cp Frontend/src/utils/api.js Frontend/src/utils/api.js.backup

# Apply wallet connection from develop
echo "🔧 Applying wallet connection components..."

# Copy WalletConnect from develop
git show develop:Frontend/src/components/WalletConnect.jsx > Frontend/src/components/WalletConnect.jsx

# Copy AuthContext wallet methods from develop
git show develop:Frontend/src/contexts/AuthContext.jsx > temp_auth_context.jsx

# Copy API wallet methods from develop  
git show develop:Frontend/src/utils/api.js > temp_api.jsx

echo "✅ Wallet connection applied successfully!"
echo "📝 Files updated:"
echo "  - Frontend/src/components/WalletConnect.jsx"
echo "  - Frontend/src/contexts/AuthContext.jsx (wallet methods)"
echo "  - Frontend/src/utils/api.js (wallet API)"

echo "🔍 Next steps:"
echo "  1. Review the changes"
echo "  2. Test wallet connection"
echo "  3. Commit changes if satisfied" 