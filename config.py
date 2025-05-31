import os

class Config:
    DEBUG = os.getenv('FLASK_DEBUG','false').lower() == 'true'
    
    # Path to Firebase service account key JSON file
    FIREBASE_CREDENTIALS  = os.getenv('FIREBASE_CREDENTIALS')
    if not DEBUG and not FIREBASE_CREDENTIALS:
        # In production, FIREBASE_CREDENTIALS should always be set
        # Consider raising an error or logging a critical warning if not set in non-debug mode
        print("WARNING: FIREBASE_CREDENTIALS environment variable is not set.")

    DEEPSEEK_API_KEY     = os.getenv('DEEPSEEK_API_KEY')
    if not DEBUG and not DEEPSEEK_API_KEY:
        print("WARNING: DEEPSEEK_API_KEY environment variable is not set.")

    # Optional: Default model for DeepSeek if not provided in request
    DEFAULT_DEEPSEEK_MODEL = os.getenv('DEFAULT_DEEPSEEK_MODEL', 'deepseek-r1-distill-qwen-7b')

    # Optional: Add other configurations like logging level
    # LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO').upper()
