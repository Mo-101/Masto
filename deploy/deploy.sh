#!/bin/bash

echo "🛡️ MNTRK Sovereign Grid Deployment"
echo "=================================="

# Check for .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from example..."
    cp .env.example .env
    echo "⚠️ Please edit .env with your actual credentials before continuing."
    exit 1
fi

# Load environment variables
source .env

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env file"
    exit 1
fi

if [ -z "$FIREBASE_CREDENTIALS" ]; then
    echo "❌ FIREBASE_CREDENTIALS not set in .env file"
    exit 1
fi

# Create directories
mkdir -p model

# Initialize database schema
echo "🗄️ Creating Neon database schema..."
python setup/create_neon_schema.py

# Initialize Firestore collections
echo "🔥 Creating Firestore collections..."
python setup/create_firestore_collections.py

# Build and start Docker containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🚀 Starting MNTRK Sovereign Grid..."
docker-compose up -d

echo "✅ MNTRK Sovereign Grid deployed successfully!"
echo "🌐 Access the API at: http://localhost:8080"
