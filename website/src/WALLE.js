import React from 'react';
import {
    Container,
    Grid,
    Box,
    CircularProgress,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import NavBar from './components/NavBar';
import SummaryBox from './components/SummaryBox';
import Graph from './components/Graph';
import TimeSelector from './components/TimeSelector';
import { useDate } from './providers/DateProvider';
import { useQuery } from '@tanstack/react-query';
import { getAllDataByTimeframe, getDataByDeviceAndTimeframe, getAllDevices } from './api/api_calls';
import { calculateAverage, prepareGraphData } from './helpers/dataHelpers';
import { useDevice } from './providers/DeviceProvider';

const WALLE = () => {
    const { startDate, endDate } = useDate();
    const { isMobile } = useDevice();

    const {
        data: allDevices = [],
        isFetching: isFetchingDevices,
        isError: isErrorDevices,
    } = useQuery({
        queryKey: ['allDevices'],
        queryFn: getAllDevices,
    });

    const [selectedDevice, setSelectedDevice] = React.useState('');

    React.useEffect(() => {
        if (allDevices.length > 0 && !selectedDevice) {
            setSelectedDevice(allDevices[0]);
        }
    }, [allDevices, selectedDevice]);

    const allDataQueryKey = React.useMemo(
        () => ['allData', startDate, endDate, allDevices],
        [startDate, endDate, allDevices],
    );
    const deviceDataQueryKey = React.useMemo(
        () => ['deviceData', selectedDevice, startDate, endDate],
        [selectedDevice, startDate, endDate],
    );

    const {
        data: allData = [],
        isFetching: isFetchingAll,
        isError: isErrorAll,
    } = useQuery({
        queryKey: allDataQueryKey,
        queryFn: () => getAllDataByTimeframe(startDate.format(), endDate.format(), allDevices),
        enabled: !!startDate && !!endDate && allDevices.length > 0,
        refetchInterval: 4 * 60 * 1000,
    });

    const {
        data: deviceData = [],
        isFetching: isFetchingDevice,
        isError: isErrorDevice,
    } = useQuery({
        queryKey: deviceDataQueryKey,
        queryFn: () => getDataByDeviceAndTimeframe(selectedDevice, startDate.format(), endDate.format()),
        enabled: !!selectedDevice && !!startDate && !!endDate,
        refetchInterval: 4 * 60 * 1000,
    });

    const averagePM10 = calculateAverage(allData, 'PM10');
    const averagePM25 = calculateAverage(allData, 'PM25');
    const allGraphData = prepareGraphData(allData);
    const deviceGraphData = prepareGraphData(deviceData);

    return (
        <>
            <NavBar />
            <Container sx={{ mt: 2 }}>
                <TimeSelector />
                {isFetchingAll ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : isErrorAll ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <Typography variant="h6" color="error">
                            Error fetching data.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={isMobile ? 1 : 2}>
                            <Grid item xs={isMobile ? 12 : 4}>
                                <SummaryBox title="Overall" value="Healthy" />
                            </Grid>
                            <Grid item xs={isMobile ? 12 : 4}>
                                <SummaryBox title="Avg PM10" value={`${averagePM10.toFixed(2)} µg/m³`} />
                            </Grid>
                            <Grid item xs={isMobile ? 12 : 4}>
                                <SummaryBox title="Avg PM2.5" value={`${averagePM25.toFixed(2)} µg/m³`} />
                            </Grid>
                        </Grid>
                        <Typography variant={isMobile ? 'h6' : 'h4'} mt={4}>
                            Average PM10 and PM2.5 for All Devices
                        </Typography>
                        <Graph data={allGraphData} />
                    </>
                )}

                <FormControl fullWidth sx={{ mt: 4 }}>
                    <InputLabel id="device-select-label">Select Device</InputLabel>
                    <Select
                        labelId="device-select-label"
                        value={selectedDevice}
                        label="Select Device"
                        onChange={(e) => setSelectedDevice(e.target.value)}
                    >
                        {allDevices &&
                            allDevices.map((device) => (
                                <MenuItem key={device} value={device}>
                                    {device}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                {isFetchingDevice ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : isErrorDevice ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <Typography variant="h6" color="error">
                            Error fetching data.
                        </Typography>
                    </Box>
                ) : (
                    selectedDevice && (
                        <>
                            <Typography variant={isMobile ? 'h6' : 'h4'} mt={4}>
                                PM10 and PM2.5 for {selectedDevice}
                            </Typography>
                            <Graph data={deviceGraphData} />
                        </>
                    )
                )}
            </Container>
        </>
    );
};

export default WALLE;
