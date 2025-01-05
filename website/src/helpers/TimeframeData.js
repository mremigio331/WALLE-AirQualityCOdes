import React, { useEffect, useState } from 'react';
import { getDataByTimeframe } from '../api/airQualityApi';

const TimeframeData = ({ startTime, endTime }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        getDataByTimeframe(startTime, endTime)
            .then((data) => setData(data))
            .catch((error) => console.error('Error fetching data by timeframe:', error));
    }, [startTime, endTime]);

    return (
        <div>
            <h1>
                Data from {startTime} to {endTime}
            </h1>
            <ul>
                {data.map((entry) => (
                    <li key={entry.timestamp}>{entry.value}</li>
                ))}
            </ul>
        </div>
    );
};

export default TimeframeData;
