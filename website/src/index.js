import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import WALLE from './WALLE';
import { DateProvider } from './providers/DateProvider';
import { DeviceProvider } from './providers/DeviceProvider';

const queryClient = new QueryClient();

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateProvider>
                    <DeviceProvider>
                        <WALLE />
                    </DeviceProvider>
                </DateProvider>
            </LocalizationProvider>
        </QueryClientProvider>
    </React.StrictMode>,
);
