#!/usr/bin/env python3
"""
REAL Firebase connection test for tokyo-scholar-356213 project
"""
import os
import sys
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("firebase-test")

def test_firebase_connection():
    """Test Firebase connection with detailed diagnostics"""
    print("\n🔥 TESTING FIREBASE CONNECTION")
    print("=" * 50)
    
    # Check environment variable
    firebase_creds = os.environ.get('FIREBASE_CREDENTIALS')
    if not firebase_creds:
        logger.error("❌ FIREBASE_CREDENTIALS environment variable not set")
        logger.error("Set it with: export FIREBASE_CREDENTIALS=/path/to/firebase-credentials.json")
        return False
    
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        logger.info("📝 Loading Firebase credentials...")
        
        # Load credentials
        if os.path.exists(firebase_creds):
            logger.info(f"🔑 Loading credentials from file: {firebase_creds}")
            cred = credentials.Certificate(firebase_creds)
        else:
            logger.info("🔑 Loading credentials from environment variable JSON")
            try:
                cred_dict = json.loads(firebase_creds)
                cred = credentials.Certificate(cred_dict)
            except json.JSONDecodeError:
                logger.error("❌ Invalid JSON in FIREBASE_CREDENTIALS")
                logger.error("Please check the format of your credentials")
                return False
        
        # Get project ID
        project_id = cred.project_id
        logger.info(f"🔍 Project ID: {project_id}")
        
        # Initialize Firebase
        try:
            firebase_admin.get_app()
            logger.info("🔄 Firebase app already initialized")
        except ValueError:
            logger.info("🚀 Initializing Firebase app...")
            firebase_admin.initialize_app(cred)
        
        logger.info("✅ Firebase Admin SDK initialized successfully")
        
        # Test Firestore
        logger.info("📊 Testing Firestore connection...")
        db = firestore.client()
        
        # Write test document
        test_doc = {
            'status': 'connection_test',
            'timestamp': firestore.SERVER_TIMESTAMP,
            'test_id': f"test-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        }
        
        doc_ref = db.collection('system_tests').add(test_doc)
        logger.info(f"✅ Firestore write successful: {doc_ref[1].id}")
        
        # Read test document
        logger.info("📖 Testing Firestore read...")
        docs = db.collection('system_tests').limit(1).stream()
        doc_found = False
        for doc in docs:
            doc_found = True
            logger.info(f"✅ Firestore read successful: {doc.id}")
            break
        
        if not doc_found:
            logger.warning("⚠️ No documents found in system_tests collection")
        
        # Test collections
        logger.info("📁 Checking Firestore collections...")
        collections = db.collections()
        collection_list = [collection.id for collection in collections]
        
        if collection_list:
            logger.info(f"📋 Found collections: {', '.join(collection_list)}")
        else:
            logger.warning("⚠️ No collections found in Firestore")
        
        logger.info("\n✅ FIREBASE CONNECTION TEST SUCCESSFUL")
        logger.info(f"🔥 Connected to Firebase project: {project_id}")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Missing Firebase package: {e}")
        logger.error("Install with: pip install firebase-admin")
        return False
    except Exception as e:
        logger.error(f"❌ Firebase connection test failed: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        return False

def main():
    """Run Firebase connection test"""
    print("\n🛡️ SOVEREIGN GRID - FIREBASE CONNECTION TEST")
    print("=" * 50)
    
    if test_firebase_connection():
        print("\n🔥 FIREBASE CONNECTION SUCCESSFUL - SOVEREIGN GRID READY")
        return True
    else:
        print("\n❌ FIREBASE CONNECTION FAILED - CHECK CONFIGURATION")
        return False

if __name__ == "__main__":
    main()
