import React, { useEffect, useState } from 'react';
import { getAllDevices } from '../api/airQualityApi';

const Devices = () => {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        getAllDevices()
            .then((data) => setDevices(data))
            .catch((error) => console.error('Error fetching devices:', error));
    }, []);

    return (
        <div>
            <h1>Devices</h1>
            <ul>
                {devices.map((device) => (
                    <li key={device.id}>{device.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default Devices;
