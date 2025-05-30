from flask import request, jsonify, current_app

_api_key_header = 'Authorization' # Standard header for API keys

def init_auth(app):
    """
    Placeholder for more complex authentication initialization (e.g., JWT, OAuth).
    Currently, auth is primarily handled by check_deepseek_auth for specific routes.
    """
    # Example: app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    # Example: jwt = JWTManager(app)
    pass

def check_deepseek_auth():
    """
    Checks for the DeepSeek API key in the Authorization header.
    The key is expected to be in the format "Bearer <YOUR_API_KEY>".
    """
    auth_header = request.headers.get(_api_key_header)
    expected_api_key = current_app.config.get('DEEPSEEK_API_KEY')

    if not expected_api_key:
        current_app.logger.error("DEEPSEEK_API_KEY is not configured in the application.")
        # This is a server configuration error, so 500 is appropriate.
        return jsonify({'error':'server_configuration_error', 'message':'DeepSeek API key is not configured on the server.'}), 500

    if not auth_header:
        return jsonify({'error':'unauthorized', 'message':f"Missing {_api_key_header} header."}), 401
    
    parts = auth_header.split()

    if parts[0].lower() != 'bearer' or len(parts) == 1 or len(parts) > 2:
        return jsonify({'error':'unauthorized', 'message':f"Invalid {_api_key_header} header format. Expected 'Bearer <token>'."}), 401
    
    token = parts[1]
    if token != expected_api_key:
        return jsonify({'error':'unauthorized', 'message':'Invalid DeepSeek API key.'}), 401
    
    return None # Authentication successful
