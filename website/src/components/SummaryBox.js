import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const SummaryBox = ({ title, value }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="div">
                    {title}
                </Typography>
                <Typography variant="h6" component="div">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default SummaryBox;
