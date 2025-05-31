#!/bin/bash

# Script to help set up Firebase credentials for mntrk-fcd2b project

echo "🔥 Firebase Credentials Setup for mntrk-fcd2b"
echo "=============================================="
echo "This script will help you set up your Firebase credentials."
echo

# Check if credentials file exists
if [ -f "firebase-credentials.json" ]; then
    echo "✅ Found existing firebase-credentials.json file"
    
    # Export the path to the credentials file
    export FIREBASE_CREDENTIALS=$(pwd)/firebase-credentials.json
    echo "✅ Exported FIREBASE_CREDENTIALS environment variable"
    echo "   $FIREBASE_CREDENTIALS"
    
else
    echo "❌ No firebase-credentials.json file found in the current directory"
    echo
    echo "Please download your service account key:"
    echo "1. Go to Firebase Console: https://console.firebase.google.com/project/mntrk-fcd2b/settings/serviceaccounts/adminsdk"
    echo "2. Click 'Generate new private key'"
    echo "3. Save the file as 'firebase-credentials.json' in this directory"
    echo "4. Run this script again"
    echo
    echo "Project ID: mntrk-fcd2b"
    echo "Service Account: firebase-adminsdk-34yxt@mntrk-fcd2b.iam.gserviceaccount.com"
    exit 1
fi

# Test the credentials
echo
echo "Testing Firebase connection..."
python setup/firebase_setup.py

if [ $? -eq 0 ]; then
    echo
    echo "🎉 Firebase credentials are set up correctly!"
    echo
    echo "To use these credentials in your application, add this to your .env file:"
    echo "FIREBASE_CREDENTIALS=$(pwd)/firebase-credentials.json"
    echo
    echo "Or run this command before starting your application:"
    echo "export FIREBASE_CREDENTIALS=$(pwd)/firebase-credentials.json"
else
    echo
    echo "❌ Firebase connection test failed. Please check your credentials."
fi
