import React, { useEffect, useState } from 'react';
import { getDataByDevice } from '../api/airQualityApi';

const DeviceData = ({ deviceId }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        getDataByDevice(deviceId)
            .then((data) => setData(data))
            .catch((error) => console.error('Error fetching data by device:', error));
    }, [deviceId]);

    return (
        <div>
            <h1>Data for Device {deviceId}</h1>
            <ul>
                {data.map((entry) => (
                    <li key={entry.timestamp}>{entry.value}</li>
                ))}
            </ul>
        </div>
    );
};

export default DeviceData;
