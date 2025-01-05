import axios from 'axios';

const BASE_URL = 'http://air.local:5000';

export const getAllDevices = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/devices`);
        console.log('getAllDevices response:', response.data);
        return response.data.devices;
    } catch (error) {
        console.error('Error fetching all devices:', error);
        throw error;
    }
};

export const getDataByDeviceAndTimeframe = async (deviceId, startTime, endTime) => {
    console.log('Fetching data for device:', deviceId, 'Start:', startTime, 'End:', endTime);
    try {
        const response = await axios.get(`${BASE_URL}/devices/${deviceId}/data`, {
            headers: {
                start_date: startTime,
                end_date: endTime,
            },
        });
        console.log('getDataByDeviceAndTimeframe response:', response.data);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching data for device ${deviceId} from ${startTime} to ${endTime}:`, error);
        throw error;
    }
};

export const getAllDataByTimeframe = async (startTime, endTime, devices) => {
    try {
        if (devices.length === 0) {
            const allDevicesResponse = await getAllDevices();
            devices = allDevicesResponse;
        }
        const promises = devices.map((device) => getDataByDeviceAndTimeframe(device, startTime, endTime));
        const results = await Promise.all(promises);
        console.log('getAllDataByTimeframe results:', results);
        return results.flatMap((result) => result);
    } catch (error) {
        console.error('Error fetching all data by timeframe:', error);
        throw error;
    }
};
