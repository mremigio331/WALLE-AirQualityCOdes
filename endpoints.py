from flask import jsonify, request
import logging
from utils import (
    normalize_item,
    convert_floats_to_decimals,
    unique_device_ids,
    get_latest_info,
    batch_delete_items,
    scan_all_items,
)
from boto3.dynamodb.conditions import Key


def register_endpoints(app, table):
    """Register all endpoints with the Flask app."""

    @app.route("/", methods=["GET"])
    def home():
        """Home Endpoint
        ---
        responses:
            200:
                description: Welcome message
        """
        logging.info("Called home endpoint.")
        return jsonify({"message": "Welcome to the Air Quality API"}), 200

    @app.route("/devices", methods=["GET"])
    def get_devices():
        """Get a list of all unique devices
        ---
        responses:
            200:
                description: List of unique device IDs
            500:
                description: Server error
        """
        logging.info("Called get_devices endpoint.")
        if not table:
            logging.error("DynamoDB connection is unavailable.")
            return jsonify({"error": "DynamoDB is unavailable"}), 500

        try:
            device_ids = unique_device_ids(table)
            logging.info(f"Retrieved unique device IDs: {device_ids}")
            return jsonify({"devices": device_ids}), 200
        except Exception as e:
            logging.error(f"Error retrieving devices: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/devices/<device_id>/last", methods=["GET"])
    def get_last_device_entry(device_id):
        """Get the last entry for a specific device
        ---
        parameters:
            - name: device_id
              in: path
              type: string
              required: True
              description: The device ID to fetch the last entry for
        responses:
            200:
                description: Last entry for the given device
            404:
                description: Device not found
            500:
                description: Server error
        """
        logging.info(f"Called get_last_device_entry endpoint with device_id={device_id}.")
        if not table:
            logging.error("DynamoDB connection is unavailable.")
            return jsonify({"error": "DynamoDB is unavailable"}), 500

        try:
            last_item = get_latest_info(table, device_id)
            if last_item:
                normalized_item = normalize_item(last_item)
                logging.info(f"Retrieved last entry for device {device_id}: {normalized_item}")
                return jsonify({"data": normalized_item}), 200
            else:
                logging.info(f"No data found for device {device_id}.")
                return jsonify({"message": f"No data found for device {device_id}"}), 404
        except Exception as e:
            logging.error(f"Error retrieving last entry for {device_id}: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/devices/<device_id>", methods=["DELETE"])
    def delete_device(device_id):
        """Delete all data for a specific device
        ---
        parameters:
            - name: device_id
              in: path
              type: string
              required: True
              description: The device ID to delete
        responses:
            200:
                description: Device and its data deleted
            404:
                description: Device not found
            500:
                description: Server error
        """
        logging.info(f"Called delete_device endpoint with device_id={device_id}.")
        if not table:
            logging.error("DynamoDB connection is unavailable.")
            return jsonify({"error": "DynamoDB is unavailable"}), 500

        try:
            response = table.query(
                KeyConditionExpression=Key("DeviceID").eq(device_id),
                ProjectionExpression="DeviceID, #ts",
                ExpressionAttributeNames={"#ts": "Timestamp"}
            )
            items = response.get("Items", [])
            if not items:
                logging.info(f"Device {device_id} not found.")
                return jsonify({"message": f"No data found for device {device_id}"}), 404

            batch_delete_items(table, items)
            logging.info(f"Deleted all data for device {device_id}.")
            return jsonify({"message": f"Deleted all data for device {device_id}"}), 200
        except Exception as e:
            logging.error(f"Error deleting device {device_id}: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/clear", methods=["DELETE"])
    def clear_database():
        """Clear the entire database
        ---
        responses:
            200:
                description: Database cleared successfully
            500:
                description: Server error
        """
        logging.info("Called clear_database endpoint.")
        if not table:
            logging.error("DynamoDB connection is unavailable.")
            return jsonify({"error": "DynamoDB is unavailable"}), 500

        try:
            items = scan_all_items(table)
            if items:
                batch_delete_items(table, items)
                logging.info(f"Cleared {len(items)} items from the database.")
                return jsonify({"message": f"Cleared {len(items)} items from the database"}), 200
            else:
                logging.info("No items found to clear.")
                return jsonify({"message": "No items found to clear"}), 200
        except Exception as e:
            logging.error(f"Error clearing database: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/devices/<device_id>/data", methods=["GET"])
    def get_device_data(device_id):
        """Get all data for a specific device
        ---
        parameters:
            - name: device_id
              in: path
              type: string
              required: True
              description: The device ID to fetch data for
        responses:
            200:
                description: All data for the given device
            404:
                description: Device not found
            500:
                description: Server error
        """
        logging.info(f"Called get_device_data endpoint with device_id={device_id}.")
        if not table:
            logging.error("DynamoDB connection is unavailable.")
            return jsonify({"error": "DynamoDB is unavailable"}), 500

        try:
            response = table.query(KeyConditionExpression=Key("DeviceID").eq(device_id))
            items = response.get("Items", [])
            if not items:
                logging.info(f"No data found for device {device_id}.")
                return jsonify({"message": f"No data found for device {device_id}"}), 404

            data = [normalize_item(item) for item in items]
            logging.info(f"Retrieved data for device {device_id}: {data}")
            return jsonify({"data": data}), 200
        except Exception as e:
            logging.error(f"Error retrieving data for {device_id}: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/data", methods=["POST"])
    def add_data():
        """Add new data
        ---
        parameters:
            - name: body
              in: body
              required: True
              description: JSON payload containing device data
              schema:
                type: object
                properties:
                    DeviceID:
                        type: string
                        description: Unique identifier for the device
                    Timestamp:
                        type: string
                        description: ISO 8601 timestamp of the data
                    PM25:
                        type: number
                        description: PM2.5 concentration
                    PM10:
                        type: number
                        description: PM10 concentration
        responses:
            200:
                description: Data successfully added
            400:
                description: Invalid input or default device ID used
            500:
                description: Server error
        """
        logging.info("Called add_data endpoint.")

        if not table:
            logging.error("DynamoDB connection is unavailable.")
            return jsonify({"error": "DynamoDB is unavailable"}), 500

        data = request.json

        # Check if the DeviceID is the default
        if data.get("DeviceID") == "default_device":
            logging.warning("DeviceID is 'default_device'. Data not added to the database.")
            return jsonify({
                "error": "Invalid DeviceID",
                "message": "The DeviceID is set to the default value 'default_device'. "
                           "Please configure your device with a unique ID."
            }), 400

        try:
            # Ensure all required fields are present
            required_fields = ["DeviceID", "Timestamp", "PM25", "PM10"]
            if not all(field in data for field in required_fields):
                logging.error("Missing required fields in request data.")
                return jsonify({
                    "error": "Missing required fields",
                    "message": f"Required fields: {', '.join(required_fields)}"
                }), 400

            # Convert floats to decimals
            data = convert_floats_to_decimals(data)

            # Insert data into DynamoDB
            table.put_item(Item=data)
            logging.info(f"Data added successfully: {data}")
            return jsonify({"message": "Data added successfully"}), 200
        except Exception as e:
            logging.error(f"Error adding data: {e}")
            return jsonify({"error": "Internal server error", "details": str(e)}), 500
