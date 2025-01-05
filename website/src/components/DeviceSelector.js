import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getAllDevices } from '../api/api_calls';

const DeviceSelector = ({ onSelectDevice }) => {
    const [selectedDevice, setSelectedDevice] = useState('');

    const {
        data: devices,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ['devices'],
        queryFn: getAllDevices,
    });

    const handleDeviceChange = (event) => {
        const device = event.target.value;
        setSelectedDevice(device);
        onSelectDevice(device);
    };

    return (
        <Box my={4} display="flex" justifyContent="center">
            {isFetching ? (
                <CircularProgress />
            ) : isError ? (
                <Typography variant="h6" color="error">
                    Error fetching devices.
                </Typography>
            ) : (
                <FormControl sx={{ width: 250 }}>
                    <InputLabel id="device-select-label">Select Device</InputLabel>
                    <Select
                        labelId="device-select-label"
                        id="device-select"
                        value={selectedDevice}
                        label="Select Device"
                        onChange={handleDeviceChange}
                    >
                        {devices?.devices.map((device) => (
                            <MenuItem key={device} value={device}>
                                {device}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        </Box>
    );
};

export default DeviceSelector;
