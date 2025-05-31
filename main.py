import os
import logging
import asyncio
from flask import Flask, jsonify
from orchestration.hybrid_orchestrator import execute_training

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MNTRK-Sovereign")

# Initialize Flask app
app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "MNTRK Sovereign Grid"})

@app.route('/train', methods=['POST'])
async def train_model():
    try:
        metrics = await execute_training()
        return jsonify({"status": "success", "metrics": metrics})
    except Exception as e:
        logger.error(f"Training failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    debug = os.environ.get("DEBUG", "False").lower() == "true"
    
    logger.info("🛡️ MNTRK Sovereign Grid Initializing...")
    logger.info(f"🚀 Starting server on port {port}")
    
    app.run(host="0.0.0.0", port=port, debug=debug)
