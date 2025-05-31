#!/bin/bash

# SOVEREIGN GRID DEPLOYMENT SCRIPT
# Deploys all components of the MNTRK system

echo "🛡️ SOVEREIGN GRID DEPLOYMENT SEQUENCE"
echo "======================================"

# Set environment variables
export FIREBASE_CREDENTIALS=$(pwd)/firebase-credentials.json

echo "🔥 Phase 1: Firebase Connection Test"
python setup/test_firebase_connection.py
if [ $? -ne 0 ]; then
    echo "❌ Firebase connection failed. Aborting deployment."
    exit 1
fi

echo ""
echo "📁 Phase 2: Initialize Firestore Collections"
python setup/initialize_firestore_collections.py
if [ $? -ne 0 ]; then
    echo "❌ Firestore initialization failed. Aborting deployment."
    exit 1
fi

echo ""
echo "🗄️ Phase 3: Neon Database Setup"
python setup/create_neon_schema.py
if [ $? -ne 0 ]; then
    echo "❌ Neon database setup failed. Aborting deployment."
    exit 1
fi

echo ""
echo "🤖 Phase 4: Test DeepSeek Integration"
python -c "
from DeepSeekIntegration import DeepSeekClient
client = DeepSeekClient()
response = client.generate_response('Test connection')
print('✅ DeepSeek integration operational')
"

echo ""
echo "🐳 Phase 5: Docker Build"
docker build -t mntrk-sovereign .
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Aborting deployment."
    exit 1
fi

echo ""
echo "🚀 Phase 6: Start Services"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Service startup failed."
    exit 1
fi

echo ""
echo "🛡️ SOVEREIGN GRID DEPLOYMENT COMPLETE"
echo "======================================"
echo "✅ Firebase: Operational"
echo "✅ Firestore: Collections initialized"
echo "✅ Neon Database: Schema created"
echo "✅ DeepSeek AI: Connected"
echo "✅ Docker Services: Running"
echo ""
echo "🌐 Access your Sovereign Grid at:"
echo "   Main API: http://localhost:8080"
echo "   Agents API: http://localhost:8081"
echo "   Observatory UI: http://localhost:3000"
echo ""
echo "🔐 Your system is now SOVEREIGN and OPERATIONAL"
