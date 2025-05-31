import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Updated Firebase configuration for tokyo-scholar-356213 project
FIREBASE_CONFIG = {
    "type": "service_account",
    "project_id": "tokyo-scholar-356213",
    # Other fields will be loaded from credentials file or environment variable
}

# Global Firebase instances
_firebase_app = None
_firestore_client = None
_storage_bucket = None

def initialize_firebase():
    """Initialize Firebase Admin SDK with tokyo-scholar-356213 project."""
    global _firebase_app, _firestore_client, _storage_bucket
    
    if _firebase_app:
        logger.info("Firebase already initialized for tokyo-scholar-356213")
        return
    
    try:
        # Get Firebase credentials from environment
        firebase_creds = os.environ.get('FIREBASE_CREDENTIALS')
        
        if not firebase_creds:
            raise ValueError("FIREBASE_CREDENTIALS environment variable required")
        
        # Load credentials
        if os.path.exists(firebase_creds):
            cred = credentials.Certificate(firebase_creds)
        else:
            # Parse JSON string
            cred_dict = json.loads(firebase_creds)
            cred = credentials.Certificate(cred_dict)
        
        # Initialize with updated project
        _firebase_app = firebase_admin.initialize_app(cred, {
            'projectId': 'tokyo-scholar-356213',
            'storageBucket': 'tokyo-scholar-356213.firebasestorage.app'
        })
        
        # Initialize services
        _firestore_client = firestore.client()
        _storage_bucket = storage.bucket()
        
        logger.info("✅ Firebase initialized successfully for tokyo-scholar-356213")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Firebase: {e}")
        raise

def get_firestore():
    """Get Firestore client for tokyo-scholar-356213 project."""
    if not _firestore_client:
        initialize_firebase()
    return _firestore_client

def get_storage():
    """Get Storage bucket for tokyo-scholar-356213 project."""
    if not _storage_bucket:
        initialize_firebase()
    return _storage_bucket

def get_auth():
    """Get Firebase Auth for tokyo-scholar-356213 project."""
    if not _firebase_app:
        initialize_firebase()
    return auth
