import os
import logging
import connexion
from flask import jsonify, current_app
from flask_cors import CORS
from python_dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import your modules
from shared.database import init_db
from api.auth import init_auth
from api.ai.routes import ai_bp
from api.agents.routes import agents_bp
from ml_pipeline.pipeline import MLPipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app(config_object='config.Config'):
    """
    Create and configure the Flask application using Connexion.
    
    Args:
        config_object: Configuration class to use
        
    Returns:
        Connexion app instance
    """
    
    # Initialize Connexion app with OpenAPI 3.1 support
    conn_app = connexion.App(
        __name__,
        specification_dir='.',
        options={
            'swagger_ui': True,
            'serve_spec': True
        }
    )
    
    # Add the unified API specification
    try:
        conn_app.add_api(
            'swagger.yaml',
            strict_validation=True,
            validate_responses=True,
            pythonic_params=True
        )
        logger.info("Successfully loaded swagger.yaml")
    except Exception as e:
        logger.error(f"Failed to load swagger.yaml: {e}")
        raise
    
    # Get the underlying Flask app
    app = conn_app.app
    
    # Load configuration
    app.config.from_object(config_object)
    
    # Enable CORS
    CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])
    
    # Initialize services
    with app.app_context():
        try:
            init_db(app)
            init_auth(app)
            logger.info("Successfully initialized database and auth")
        except Exception as e:
            logger.error(f"Failed to initialize services: {e}")
            raise
    
    # Register additional Flask blueprints
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(agents_bp, url_prefix='/api/agents')
    
    # Initialize ML Pipeline
    app.ml_pipeline = MLPipeline()
    
    # Health check endpoint
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'ok',
            'service': 'MNTRK API',
            'version': '1.0.1'
        })
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            'message': 'MNTRK Unified API',
            'version': '1.0.1',
            'docs': '/ui',
            'health': '/health'
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'not_found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.exception("Internal server error occurred")
        return jsonify({
            'error': 'internal_server_error',
            'message': 'An internal server error occurred'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        logger.exception(f"Unhandled exception: {error}")
        if app.config.get('DEBUG'):
            message = str(error)
        else:
            message = 'An internal server error occurred'
        return jsonify({
            'error': 'internal_server_error',
            'message': message
        }), 500
    
    logger.info("MNTRK Flask application created successfully")
    return conn_app

def main():
    """Main entry point for the application."""
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    app = create_app()
    
    logger.info(f"Starting MNTRK API on port {port}")
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )

if __name__ == '__main__':
    main()
