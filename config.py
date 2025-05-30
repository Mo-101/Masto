# Centralizes application configuration via environment variables.
import os

class Config:
    DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS') # Path to Firebase service account key JSON file
    DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
