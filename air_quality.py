#!/usr/bin/env python3

import serial
import time
import requests
import json

def read_pm_sensor(port):
    ser = serial.Serial(port, baudrate=9600, timeout=2)
    try:
        data = ser.read(10)
        if data[0] == 0xAA and data[1] == 0xC0:
            pm25 = (data[2] + data[3] * 256) / 10.0
            pm10 = (data[4] + data[5] * 256) / 10.0
            return pm25, pm10
    finally:
        ser.close()
    return None, None

def send_data(device_id, pm25, pm10):
    url = 'http://air.local:5000/data'
    headers = {'Content-Type': 'application/json'}
    payload = {
        'DeviceID': device_id,
        'Timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'PM25': pm25,
        'PM10': pm10
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.status_code

if __name__ == "__main__":
    device_id = 'office'
    port = '/dev/ttyUSB0'
    while True:
        try:
            pm25, pm10 = read_pm_sensor(port)
            print(f'pm25: {pm25}, pm10: {pm10}')
            if pm25 is not None and pm10 is not None:
                status_code = send_data(device_id, pm25, pm10)
                print(f"Data sent with status code: {status_code}")
        except requests.exceptions.ConnectionError:
            print("Failed to connect to the server. The server might be down.")
        except Exception as e:
            print(f"An error occurred: {e}")
        time.sleep(300)
