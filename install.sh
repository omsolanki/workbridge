#!/bin/bash

echo "🚀 WorkBridge Installation Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the servers"
else
    echo "✅ .env file already exists"
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
if npm install; then
    echo "✅ Server dependencies installed successfully"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
if npm install; then
    echo "✅ Client dependencies installed successfully"
else
    echo "❌ Failed to install client dependencies"
    echo "⚠️  Some dependencies might have issues. You can try installing them manually."
fi
cd ..

echo ""
echo "🎉 Installation completed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Edit .env file with your configuration (MongoDB, AWS, etc.)"
echo "2. Start the backend: cd server && npm run dev"
echo "3. Start the frontend: cd client && npm run dev"
echo "4. Or use Docker: docker-compose up --build"
echo ""
echo "📚 Useful URLs:"
echo "==============="
echo "- Backend API: http://localhost:5000/api"
echo "- Health Check: http://localhost:5000/api/ping"
echo "- API Docs: http://localhost:5000/api/docs"
echo "- Frontend: http://localhost:3000"
echo ""
echo "🔧 Development Commands:"
echo "======================="
echo "- Backend dev: cd server && npm run dev"
echo "- Frontend dev: cd client && npm run dev"
echo "- Backend test: cd server && npm test"
echo "- Frontend test: cd client && npm test"
echo "- Backend build: cd server && npm run build"
echo "- Frontend build: cd client && npm run build" 