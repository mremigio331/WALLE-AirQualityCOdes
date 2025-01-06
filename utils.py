from decimal import Decimal
from boto3.dynamodb.conditions import Key
import logging
import json

def get_air_quality_levels():
    with open('air_quality_levels.json', 'r') as json_file:
        return json.load(json_file)
    
def get_air_quality_info(value, pm_type_levels):
    for level in pm_type_levels:
        min_value, max_value = map(float, level["range"].split(" to "))
        if min_value <= value <= max_value:
            return level["message"], level["code"]
    return "Unknown", 0

def normalize_item(item):
    """Normalize DynamoDB item for JSON response."""
    return {k: str(v) if isinstance(v, (int, float, Decimal)) else v for k, v in item.items()}


def convert_floats_to_decimals(data):
    """Recursively convert float values to Decimal."""
    if isinstance(data, list):
        return [convert_floats_to_decimals(item) for item in data]
    elif isinstance(data, dict):
        return {k: convert_floats_to_decimals(v) for k, v in data.items()}
    elif isinstance(data, float):
        return Decimal(str(data))
    return data


def unique_device_ids(table):
    """Fetch all unique device IDs from the DynamoDB table."""
    try:
        unique_ids = set()
        response = table.scan(ProjectionExpression="DeviceID")
        for item in response["Items"]:
            unique_ids.add(item["DeviceID"])

        while "LastEvaluatedKey" in response:
            response = table.scan(
                ProjectionExpression="DeviceID",
                ExclusiveStartKey=response["LastEvaluatedKey"]
            )
            for item in response["Items"]:
                unique_ids.add(item["DeviceID"])

        logging.info(f"Unique device IDs: {unique_ids}")
        return list(unique_ids)
    except Exception as e:
        logging.error(f"Error fetching unique device IDs: {e}")
        raise


def get_latest_info(table, device_id):
    """Fetch the latest entry for a specific device."""
    try:
        response = table.query(
            KeyConditionExpression=Key("DeviceID").eq(device_id),
            ScanIndexForward=False,
            Limit=1
        )
        if "Items" in response and response["Items"]:
            item = response['Items'][0]
            pm25_value = item.get('PM25')
            pm10_value = item.get('PM10')

            if pm25_value is not None:
                message, code = get_air_quality_info(pm25_value, get_air_quality_levels()["PM2.5"])
                item['message'] = message
                item['code'] = int(code)
                logging.info(f"Message: {message}. Code: {code}")

            elif pm10_value is not None:
                message, code = get_air_quality_info(pm10_value, get_air_quality_levels()["PM10"])
                item['message'] = message
                item['code'] = int(code)
                logging.info(f"Message: {message}. Code: {code}")

            else:
                item['message'] = 'Unknown'
                item['code'] = 0
                logging.info('No message or code identified')

            return item
        else:
            logging.info(f"No entries found for device {device_id}.")
            return None
    except Exception as e:
        logging.error(f"Error fetching latest info for device {device_id}: {e}")
        raise


def batch_delete_items(table, items):
    """Batch delete items from a DynamoDB table."""
    with table.batch_writer() as batch:
        for item in items:
            batch.delete_item(Key={"DeviceID": item["DeviceID"], "Timestamp": item["Timestamp"]})


def scan_all_items(table, projection_expression=None):
    """Scan all items in the table, supporting large data sets."""
    items = []
    params = {"ProjectionExpression": projection_expression} if projection_expression else {}
    response = table.scan(**params)
    items.extend(response.get("Items", []))

    while "LastEvaluatedKey" in response:
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"], **params)
        items.extend(response.get("Items", []))

    return items
