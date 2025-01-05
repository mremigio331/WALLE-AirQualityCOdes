import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';

const Graph = ({ data = [] }) => {
    const maxPM10 = Math.max(...data.map((entry) => entry.pm10), 0);
    const maxPM25 = Math.max(...data.map((entry) => entry.pm25), 0);
    const maxYValue = Math.ceil(Math.max(maxPM10, maxPM25) * 1.1);

    const scaledData = data.map((entry) => ({
        ...entry,
        pm10: entry.pm10,
        pm25: entry.pm25,
    }));

    return (
        <Box my={4}>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={scaledData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, maxYValue]} tickFormatter={(tick) => tick.toFixed(1)} allowDecimals={true} />
                    <Tooltip formatter={(value) => (value * 10).toFixed(1)} />
                    <Legend />
                    <Line type="monotone" dataKey="pm10" stroke="#8884d8" name="PM10" dot={true} />
                    <Line type="monotone" dataKey="pm25" stroke="#82ca9d" name="PM2.5" dot={true} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default Graph;
