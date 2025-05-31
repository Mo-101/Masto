#!/bin/bash

echo "🔥 DEPLOYING FIREBASE FUNCTIONS TO TOKYO-SCHOLAR-356213"
echo "=" * 60

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --no-localhost

# Set the project
echo "🎯 Setting Firebase project to tokyo-scholar-356213..."
firebase use tokyo-scholar-356213

# Install function dependencies
echo "📦 Installing function dependencies..."
cd functions
npm install
cd ..

# Deploy functions
echo "🚀 Deploying Firebase Functions..."
firebase deploy --only functions

# Deploy Firestore rules and indexes
echo "🔒 Deploying Firestore rules..."
firebase deploy --only firestore

# Deploy storage rules
echo "📁 Deploying Storage rules..."
firebase deploy --only storage

echo "✅ Firebase Functions deployment complete!"
echo "🌐 Functions URL: https://us-central1-tokyo-scholar-356213.cloudfunctions.net/"
