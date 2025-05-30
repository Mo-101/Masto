import firebase_admin
from firebase_admin import credentials, initialize_app, firestore, _apps
from flask import current_app # For logging within Flask app context

_db_client = None

def init_db(app): # app instance is passed from create_app
    """
    Initializes the Firebase Admin SDK using credentials from Flask app config.
    Ensures Firebase is initialized only once.
    """
    global _db_client
    
    # Check if Firebase default app is already initialized to prevent errors
    if not firebase_admin._apps: # Correct way to check if default app is initialized
        cred_path = app.config.get('FIREBASE_CREDENTIALS')
        if not cred_path:
            # Use Flask's logger if available (within app context)
            log_message = "FIREBASE_CREDENTIALS path not set in Flask config. Please set the environment variable."
            if app and hasattr(app, 'logger'):
                app.logger.error(log_message)
            else:
                print(f"ERROR: {log_message}") # Fallback if logger not available
            raise RuntimeError(log_message)
        
        try:
            cred = credentials.Certificate(cred_path)
            initialize_app(cred)
            if app and hasattr(app, 'logger'):
                app.logger.info("Firebase Admin SDK initialized successfully.")
            else:
                print("INFO: Firebase Admin SDK initialized successfully.")
        except Exception as e:
            log_message = f"Failed to initialize Firebase Admin SDK: {e}"
            if app and hasattr(app, 'logger'):
                app.logger.error(log_message)
            else:
                print(f"ERROR: {log_message}")
            raise RuntimeError(log_message)
            
    _db_client = firestore.client()

def get_db():
    """
    Returns an initialized Firestore client.
    Raises RuntimeError if Firebase Admin SDK is not initialized.
    """
    if not _db_client:
        # This situation should ideally be avoided by ensuring init_db is called correctly
        # during app creation.
        log_message = 'Firebase not initialized. Ensure init_db() is called successfully during app creation.'
        if current_app and hasattr(current_app, 'logger'): # current_app might not be available if called outside request context
            current_app.logger.error(log_message)
        else:
            print(f"ERROR: {log_message}")
        raise RuntimeError(log_message)
    return _db_client
