from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
import logging
from dynamodb_setup import setup_dynamodb
from endpoints import register_endpoints

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Create Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Add Swagger
swagger = Swagger(app)

# Setup DynamoDB
try:
    dynamodb, table = setup_dynamodb()
except Exception as e:
    logging.error(f"Failed to set up DynamoDB: {e}")
    table = None

# Register all endpoints
register_endpoints(app, table)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
