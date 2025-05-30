import os
from flask import request, jsonify, current_app
from functools import wraps

def init_auth(app):
    """Initialize authentication for the Flask app."""
    app.logger.info("Authentication module initialized")

def check_deepseek_auth():
    """
    Check if DeepSeek API key is available and valid.
    Returns None if auth is successful, or a Flask response if there's an error.
    """
    api_key = os.getenv('DEEPSEEK_API_KEY')
    
    if not api_key:
        current_app.logger.error("DeepSeek API key not found in environment variables")
        return jsonify({
            'error': 'unauthorized',
            'message': 'DeepSeek API key not configured'
        }), 401
    
    # Additional validation could be added here
    # For now, we just check if the key exists and has a reasonable format
    if not api_key.startswith('sk-') or len(api_key) < 10:
        current_app.logger.error("DeepSeek API key appears to be invalid format")
        return jsonify({
            'error': 'unauthorized', 
            'message': 'Invalid DeepSeek API key format'
        }), 401
    
    return None  # Auth successful

def require_api_key(f):
    """
    Decorator to require API key authentication for routes.
    Checks for API key in Authorization header.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'error': 'unauthorized',
                'message': 'Authorization header required'
            }), 401
        
        # Extract API key from "Bearer <key>" or "sk-<key>" format
        if auth_header.startswith('Bearer '):
            api_key = auth_header[7:]
        elif auth_header.startswith('sk-'):
            api_key = auth_header
        else:
            return jsonify({
                'error': 'unauthorized',
                'message': 'Invalid authorization header format'
            }), 401
        
        # Validate API key (this is a simple check - enhance as needed)
        expected_key = os.getenv('API_KEY') or os.getenv('DEEPSEEK_API_KEY')
        if not expected_key or api_key != expected_key:
            return jsonify({
                'error': 'unauthorized',
                'message': 'Invalid API key'
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def check_firebase_auth():
    """
    Check Firebase authentication token.
    Returns None if auth is successful, or a Flask response if there's an error.
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'error': 'unauthorized',
            'message': 'Firebase ID token required'
        }), 401
    
    id_token = auth_header[7:]  # Remove 'Bearer ' prefix
    
    try:
        # Verify the ID token with Firebase Admin SDK
        from firebase_admin import auth
        decoded_token = auth.verify_id_token(id_token)
        # Token is valid, you can access user info via decoded_token
        return None
    except Exception as e:
        current_app.logger.error(f"Firebase token verification failed: {e}")
        return jsonify({
            'error': 'unauthorized',
            'message': 'Invalid Firebase ID token'
        }), 401
