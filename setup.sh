#!/bin/bash

# TechVault Quick Start Script

echo "🚀 TechVault Setup & Development Server Launcher"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ npm version: $(npm -v)"

# Install dependencies if node_modules doesn't exist
echo ""
echo "📦 Installing dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "✓ Dependencies installed"

# Check environment files
echo ""
echo "🔧 Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found"
    echo "   Please copy backend/.env.example to backend/.env and configure"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  frontend/.env.local not found"
    echo "   Creating frontend/.env.local with default values..."
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=TechVault
EOF
fi

echo ""
echo "✓ Environment configuration ready"

# MongoDB check
echo ""
echo "🗄️  Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB is installed"
    echo "  Tip: Start MongoDB with 'mongod' in a separate terminal"
else
    echo "⚠️  MongoDB is not installed locally"
    echo "  Using MongoDB Atlas? Update MONGODB_URI in backend/.env"
fi

echo ""
echo "==========================================="
echo "📚 TechVault - Ready for Development!"
echo "==========================================="
echo ""
echo "To start development servers, open 2 terminals:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo "  Runs on http://localhost:5000"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend && npm run dev"
echo "  Runs on http://localhost:3000"
echo ""
echo "📖 Documentation:"
echo "  Setup Guide: COMPLETE_SETUP_GUIDE.md"
echo "  Architecture: ARCHITECTURE.md"
echo ""
echo "Happy coding! 🎉"
