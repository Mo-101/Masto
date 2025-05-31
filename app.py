from flask import Flask

# Create a Flask application instance
app = Flask(__name__)

# Import and register blueprints (example - replace with your actual blueprints)
# from api.example_api import example_bp
# app.register_blueprint(example_bp)

from api.sovereign_api import sovereign_bp
app.register_blueprint(sovereign_bp)

# Define a simple route for the home page
@app.route('/')
def home():
    return "Welcome to the Flask App!"

# Run the app if this file is executed directly
if __name__ == '__main__':
    app.run(debug=True)
