import os
import connexion
from flask import jsonify, current_app
from shared.database    import init_db
from api.auth           import init_auth # Assuming api/auth.py
from api.ai.routes      import ai_bp
from api.agents.routes  import agents_bp

# Read runtime flags from env for request/response validation by Connexion
VALIDATE_REQUESTS  = os.getenv('VALIDATE_REQUESTS','true').lower()  == 'true'
VALIDATE_RESPONSES = os.getenv('VALIDATE_RESPONSES','true').lower() == 'true'


def create_app(config_object='config.Config'):
    # 1) Initialize Connexion app, pointing to swagger.yaml in the project root
    conn_app = connexion.App(
        __name__,
        specification_dir='.',
        options={'swagger_ui': True} # Enable Swagger UI at /ui
    )
    # Add the API specified in swagger.yaml
    conn_app.add_api(
        'swagger.yaml',
        strict_validation=VALIDATE_REQUESTS,
        validate_responses=VALIDATE_RESPONSES,
        pythonic_params=True # Convert snake_case params to camelCase for Python functions
    )

    # 2) Get the underlying Flask app instance from Connexion
    app = conn_app.app
    # Load configuration (e.g., from config.Config)
    app.config.from_object(config_object)

    # 3) Initialize shared services like database and authentication
    with app.app_context():
        init_db(app)
        init_auth(app)

    # 4) Register custom Flask Blueprints for routes not in swagger.yaml
    app.register_blueprint(ai_bp,     url_prefix='/api/ai')
    app.register_blueprint(agents_bp, url_prefix='/api/agents')

    # 5) Define standard Flask routes and error handlers
    @app.route('/health')
    def health():
        return jsonify({'status':'ok','service':'MNTRK API'})

    @app.errorhandler(404)
    def not_found(err):
        # Log the 404 error if desired
        # current_app.logger.warning(f"Resource not found: {request.path}")
        return jsonify({'error':'not_found','message':'The requested resource was not found on the server.'}), 404

    @app.errorhandler(Exception)
    def handle_exception(err):
        # Log the full exception for debugging purposes
        current_app.logger.exception(f"An unhandled exception occurred: {err}")
        # Return a generic error message to the client
        # Avoid exposing detailed error messages in production for security reasons
        if app.config.get("DEBUG"):
            message = str(err)
        else:
            message = 'An internal server error occurred.'
        return jsonify({'error':'internal_server_error','message': message}), 500

    return app

if __name__ == '__main__':
    # For development, run the app directly.
    # For production, use a WSGI server like Gunicorn: gunicorn "app:create_app()"
    app = create_app()
    app.run(host='0.0.0.0', port=5000) # Debug mode will be controlled by FLASK_DEBUG env var
