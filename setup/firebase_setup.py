#!/usr/bin/env python3
"""
Firebase setup and connection test script for mntrk-fcd2b project
"""

import os
import sys
import json
import firebase_admin
from firebase_admin import credentials, firestore

def setup_firebase():
    """Setup and test Firebase connection to mntrk-fcd2b"""
    
    # Check for credentials file
    creds_path = os.environ.get('FIREBASE_CREDENTIALS')
    if not creds_path:
        print("❌ FIREBASE_CREDENTIALS environment variable not set")
        print("Set it with: export FIREBASE_CREDENTIALS=/path/to/firebase-credentials.json")
        return False
    
    try:
        # Load credentials
        if os.path.exists(creds_path):
            cred = credentials.Certificate(creds_path)
        else:
            # Try to parse as JSON string
            try:
                cred_dict = json.loads(creds_path)
                cred = credentials.Certificate(cred_dict)
            except json.JSONDecodeError:
                raise ValueError("FIREBASE_CREDENTIALS must be a valid JSON string or file path")
        
        # Initialize Firebase with specific project
        firebase_admin.initialize_app(cred, {
            'projectId': 'mntrk-fcd2b',
            'storageBucket': 'mntrk-fcd2b.appspot.com'
        })
        
        # Test Firestore connection
        db = firestore.client()
        
        # Write test document
        test_ref = db.collection('system_test').document('connection_test')
        test_ref.set({
            'status': 'firebase_operational',
            'timestamp': firestore.SERVER_TIMESTAMP,
            'test_type': 'connection_verification',
            'service_account': 'firebase-adminsdk-34yxt@mntrk-fcd2b.iam.gserviceaccount.com'
        })
        
        # Read it back
        doc = test_ref.get()
        if doc.exists:
            print("✅ Firebase Firestore connection successful")
            print(f"✅ Test document created: {doc.to_dict()}")
            
            # Clean up test document
            test_ref.delete()
            print("✅ Test document cleaned up")
            return True
        else:
            print("❌ Failed to read test document")
            return False
            
    except Exception as e:
        print(f"❌ Firebase setup failed: {e}")
        return False

if __name__ == "__main__":
    print("🔥 FIREBASE SETUP AND CONNECTION TEST")
    print("=" * 50)
    print(f"Project: mntrk-fcd2b")
    print(f"Service Account: firebase-adminsdk-34yxt@mntrk-fcd2b.iam.gserviceaccount.com")
    print("=" * 50)
    
    if setup_firebase():
        print("✅ Firebase is ready for MNTRK deployment")
    else:
        print("❌ Firebase setup failed - fix issues before proceeding")
        sys.exit(1)
