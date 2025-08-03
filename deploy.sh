#!/bin/bash

# SafeSwap Deploy Script
echo "🚀 Starting SafeSwap Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Dependencies check passed!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend
    cd Backend
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    cd ..
    
    # Frontend
    cd Frontend
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
    
    print_status "Dependencies installed successfully!"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd Frontend
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Failed to build frontend"
        exit 1
    fi
    cd ..
    
    print_status "Frontend built successfully!"
}

# Test backend
test_backend() {
    print_status "Testing backend..."
    
    cd Backend
    npm test
    if [ $? -ne 0 ]; then
        print_warning "Backend tests failed, but continuing deployment..."
    fi
    cd ..
}

# Deploy to Render (Backend)
deploy_backend_render() {
    print_status "Deploying backend to Render..."
    
    # Check if render CLI is installed
    if ! command -v render &> /dev/null; then
        print_warning "Render CLI not found. Please install it first:"
        echo "curl -s https://render.com/download-cli/install.sh | bash"
        print_status "You can also deploy manually via Render dashboard"
        return
    fi
    
    cd Backend
    render deploy
    cd ..
}

# Deploy to Vercel (Frontend)
deploy_frontend_vercel() {
    print_status "Deploying frontend to Vercel..."
    
    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Please install it first:"
        echo "npm i -g vercel"
        print_status "You can also deploy manually via Vercel dashboard"
        return
    fi
    
    cd Frontend
    vercel --prod
    cd ..
}

# Main deployment function
main() {
    print_status "Starting SafeSwap deployment process..."
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Test backend
    test_backend
    
    # Build frontend
    build_frontend
    
    # Deploy backend
    deploy_backend_render
    
    # Deploy frontend
    deploy_frontend_vercel
    
    print_status "Deployment process completed!"
    print_status "Please check your deployment platforms for status updates."
}

# Run main function
main "$@" 