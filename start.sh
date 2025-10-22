#!/bin/bash

# GoWork Application Startup Script
echo "🚀 Starting GoWork Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if NPM is installed
if ! command -v npm &> /dev/null; then
    echo "❌ NPM is not installed. Please install NPM first."
    exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start the server
echo "▶️  Starting server on port 5000..."
echo "🌐 Application will be available at: http://localhost:5000"
echo "📱 For mobile testing, use your computer's IP address"
echo ""
echo "✨ Welcome to GoWork - Field Service Worker App!"
echo "👤 Create a new account or login to get started"
echo ""

node server.js