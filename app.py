from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
import logging
from logging.handlers import TimedRotatingFileHandler
from dynamodb_setup import setup_dynamodb
from endpoints import register_endpoints
import os

# Setup logging directory and file
LOG_DIR = "/var/log/wall-e"
LOG_FILE_API = os.path.join(LOG_DIR, "wall-e_api.log")

# Configure logger
logger = logging.getLogger("wall-e_api")
logger.setLevel(logging.INFO)

# Ensure the log directory exists
try:
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)
        logger.info(f"Log directory created at {LOG_DIR}.")
except Exception as e:
    raise SystemExit(f"Critical error: Unable to create log directory: {e}")

# Configure file handler for logging
handler = TimedRotatingFileHandler(LOG_FILE_API, when="midnight", backupCount=7)
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
handler.suffix = "%Y-%m-%d"
logger.addHandler(handler)

# Create Flask app
app = Flask(__name__)

# Configure open CORS
CORS(app, resources={r"/*": {"origins": "*"}})
logger.info("CORS is open for all origins. This is intended for local use only.")

# Add Swagger
try:
    swagger = Swagger(app)
    logger.info("Swagger successfully initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Swagger: {e}")
    raise SystemExit("Critical error: Unable to initialize Swagger. Exiting.")

# Setup DynamoDB (Local)
try:
    logger.info("Initializing DynamoDB Local.")
    dynamodb, table = setup_dynamodb(use_local=True)
except Exception as e:
    logger.error(f"Failed to set up DynamoDB: {e}")
    raise SystemExit("Critical error: Unable to initialize DynamoDB. Exiting.")

# Register all endpoints
register_endpoints(app, table)

if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    logger.info(f"Starting Flask application with debug mode = {debug_mode}.")
    app.run(host="0.0.0.0", port=5000, debug=debug_mode)
