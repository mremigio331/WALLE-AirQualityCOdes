import React from 'react';
import { Box, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useDate } from '../providers/DateProvider';

const TimeSelector = () => {
    const { startDate, setStartDate, endDate, setEndDate } = useDate();

    return (
        <Box my={4} display="flex" justifyContent="center" gap={2}>
            <DateTimePicker
                label="Start Time"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} sx={{ width: 250 }} />}
            />
            <DateTimePicker
                label="End Time"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} sx={{ width: 250 }} />}
            />
        </Box>
    );
};

export default TimeSelector;
