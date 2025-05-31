#!/bin/bash

# MNTRK Sovereign Observatory - Deployment Script
# Production deployment automation

set -e

echo "🛡️ MNTRK Sovereign Observatory - Deployment Starting"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and configure your environment variables"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DATABASE_URL" "FIREBASE_CREDENTIALS" "DEEPSEEK_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create necessary directories
echo "📁 Creating deployment directories..."
mkdir -p logs models data

# Initialize databases
echo "🗄️ Initializing databases..."
python deploy/create_neon_schema.py
python deploy/create_firestore_collections.py

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f deploy/docker-compose.yml build

# Start services
echo "🚀 Starting Sovereign services..."
docker-compose -f deploy/docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 30

# Run system diagnostics
echo "🔍 Running system diagnostics..."
python deploy/sovereign_diagnostic.py

# Display deployment status
echo ""
echo "🛰️ MNTRK Sovereign Observatory - Deployment Complete"
echo "=================================================="
echo "🌐 Sovereign API: http://localhost:8080"
echo "🗺️ Observatory UI: http://localhost:3000"
echo "📷 Edge Inference: http://localhost:8081"
echo "🔍 System Status: http://localhost:8080/api/system/status"
echo ""
echo "✅ All systems operational - Sovereign Grid is LIVE"
