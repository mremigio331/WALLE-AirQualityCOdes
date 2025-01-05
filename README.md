# **WALL-E: Wireless Air Level Logger - Evaluator**

WALL-E is a project designed to monitor air quality metrics using a Raspberry Pi and a local DynamoDB instance for data storage. The application includes a Flask-based API for interacting with the air quality data and is intended to run exclusively on a single Raspberry Pi device.

---

## **Features**

- **Flask API**: Provides endpoints to manage and query air quality data.
- **DynamoDB Local**: Stores air quality metrics locally for easy access and persistence.
- **Air Quality Data Collection**: Metrics are collected using the `air_quality.py` script.
- **Swagger Integration**: Auto-generated API documentation.
- **CORS Support**: Allows cross-origin resource sharing for the API.

---

## **System Requirements**

- **Hardware**:
  - Raspberry Pi device .
  - Air quality sensor 
  
- **Software**:
  - Python 3.7 or higher
  - Java (for DynamoDB Local)
