# Initializes Firebase Firestore client.
import firebase_admin
from firebase_admin import credentials, firestore, _apps
from flask import current_app

_db_client = None

def init_db(app=None): # app parameter is kept for consistency but current_app is used
    """
    Initializes the Firebase Admin SDK using credentials from Flask app config.
    Ensures Firebase is initialized only once.
    """
    global _db_client
    
    # Check if Firebase default app is already initialized
    if not _apps: # Equivalent to if not firebase_admin._apps:
        cred_path = current_app.config.get('FIREBASE_CREDENTIALS')
        if not cred_path:
            current_app.logger.error("FIREBASE_CREDENTIALS path not set in Flask config.")
            raise RuntimeError('FIREBASE_CREDENTIALS path not set in Flask config. Please set the environment variable.')
        
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            current_app.logger.info("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            current_app.logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            raise RuntimeError(f"Failed to initialize Firebase Admin SDK: {e}")
            
    _db_client = firestore.client()

def get_db():
    """
    Returns an initialized Firestore client.
    Raises RuntimeError if Firebase Admin SDK is not initialized.
    """
    if not _db_client:
        # This assumes init_db() has been called during app setup (e.g., in create_app).
        # If current_app is available and _db_client is None, it implies init_db might have failed or wasn't called.
        if current_app:
            current_app.logger.warning("get_db() called before Firebase client was initialized. Attempting to initialize now.")
            # Attempt re-initialization if app context exists. This is a fallback.
            # Proper initialization should occur in create_app.
            init_db(current_app)
            if not _db_client: # Check again after attempting re-initialization
                 raise RuntimeError('Firebase client could not be initialized. Check logs for errors.')
        else:
            # No app context, cannot initialize here.
            raise RuntimeError('Firebase not initialized and no Flask app context available. Ensure init_db(app) is called.')
    return _db_client
