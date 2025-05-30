import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Union
from flask import current_app

def setup_logging(app):
    """Setup logging configuration for the application."""
    if not app.config.get('DEBUG'):
        # Production logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s %(levelname)s %(name)s %(message)s'
        )
    else:
        # Debug logging
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s %(levelname)s %(name)s %(funcName)s:%(lineno)d %(message)s'
        )

def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """Safely parse JSON string, returning default value on error."""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError) as e:
        if current_app:
            current_app.logger.warning(f"Failed to parse JSON: {e}")
        return default

def safe_json_dumps(obj: Any, default: str = "{}") -> str:
    """Safely serialize object to JSON string."""
    try:
        return json.dumps(obj, default=str)
    except (TypeError, ValueError) as e:
        if current_app:
            current_app.logger.warning(f"Failed to serialize to JSON: {e}")
        return default

def parse_iso_timestamp(timestamp_str: str) -> datetime:
    """
    Parse ISO 8601 timestamp string to datetime object.
    Handles various formats including 'Z' suffix and timezone offsets.
    """
    if not timestamp_str:
        raise ValueError("Timestamp string cannot be empty")
    
    # Handle 'Z' suffix (UTC)
    if timestamp_str.endswith('Z'):
        timestamp_str = timestamp_str[:-1] + '+00:00'
    
    try:
        dt = datetime.fromisoformat(timestamp_str)
        # If naive datetime, assume UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError as e:
        raise ValueError(f"Invalid timestamp format: {timestamp_str}") from e

def format_timestamp(dt: datetime) -> str:
    """Format datetime object to ISO 8601 string in UTC."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()

def validate_coordinates(latitude: float, longitude: float) -> bool:
    """Validate geographic coordinates."""
    try:
        lat = float(latitude)
        lon = float(longitude)
        return -90 <= lat <= 90 and -180 <= lon <= 180
    except (ValueError, TypeError):
        return False

def sanitize_string(input_str: str, max_length: int = 1000) -> str:
    """Sanitize string input by removing potentially harmful characters."""
    if not isinstance(input_str, str):
        return ""
    
    # Remove null bytes and control characters
    sanitized = ''.join(char for char in input_str if ord(char) >= 32 or char in '\t\n\r')
    
    # Truncate to max length
    return sanitized[:max_length]

def create_error_response(error_type: str, message: str, status_code: int = 400) -> Dict[str, Any]:
    """Create standardized error response."""
    return {
        'error': error_type,
        'message': message,
        'timestamp': format_timestamp(datetime.now(timezone.utc))
    }

def validate_required_fields(data: Dict[str, Any], required_fields: list) -> Optional[str]:
    """
    Validate that all required fields are present in data.
    Returns error message if validation fails, None if successful.
    """
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)
    
    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}"
    
    return None

def log_api_request(endpoint: str, method: str, user_id: Optional[str] = None):
    """Log API request for monitoring and debugging."""
    if current_app:
        current_app.logger.info(
            f"API Request - Endpoint: {endpoint}, Method: {method}, User: {user_id or 'anonymous'}"
        )

class APIResponse:
    """Helper class for creating consistent API responses."""
    
    @staticmethod
    def success(data: Any = None, message: str = "Success", status_code: int = 200) -> tuple:
        """Create success response."""
        response = {
            'status': 'success',
            'message': message,
            'timestamp': format_timestamp(datetime.now(timezone.utc))
        }
        if data is not None:
            response['data'] = data
        
        return response, status_code
    
    @staticmethod
    def error(error_type: str, message: str, status_code: int = 400) -> tuple:
        """Create error response."""
        response = create_error_response(error_type, message, status_code)
        return response, status_code
    
    @staticmethod
    def not_found(resource: str = "Resource") -> tuple:
        """Create not found response."""
        return APIResponse.error(
            'not_found',
            f'{resource} not found',
            404
        )
    
    @staticmethod
    def unauthorized(message: str = "Unauthorized access") -> tuple:
        """Create unauthorized response."""
        return APIResponse.error(
            'unauthorized',
            message,
            401
        )
    
    @staticmethod
    def server_error(message: str = "Internal server error") -> tuple:
        """Create server error response."""
        return APIResponse.error(
            'internal_server_error',
            message,
            500
        )
