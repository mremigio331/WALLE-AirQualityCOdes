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

# Ensure the log directory exists
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Configure logging
handler = TimedRotatingFileHandler(LOG_FILE_API, when="midnight", backupCount=7)
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
handler.suffix = "%Y-%m-%d"  # Appends the date to the log file name
logging.getLogger().setLevel(logging.INFO)
logging.getLogger().addHandler(handler)

# Create Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Add Swagger
swagger = Swagger(app)

# Setup DynamoDB (Local)
try:
    logging.info("Initializing DynamoDB Local.")
    dynamodb, table = setup_dynamodb(use_local=True)
except Exception as e:
    logging.error(f"Failed to set up DynamoDB: {e}")
    table = None

# Register all endpoints
register_endpoints(app, table)

if __name__ == "__main__":
    logging.info("Starting Flask application.")
    app.run(host="0.0.0.0", port=5000)
