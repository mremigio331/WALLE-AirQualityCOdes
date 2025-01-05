import React, { useMemo } from 'react';
import { Container, Grid, Box, CircularProgress, Typography } from '@mui/material';
import NavBar from '../components/NavBar';
import SummaryBox from '../components/SummaryBox';
import Graph from '../components/Graph';
import TimeSelector from '../components/TimeSelector';
import { useDate } from '../providers/DateProvider';
import { useQuery } from '@tanstack/react-query';
import { getAllDataByTimeframe, getAllDevices } from '../api/api_calls';
import { calculateAverage, prepareGraphData } from '../helpers/dataHelpers';

const Home = () => {
    const { startDate, endDate } = useDate();

    const {
        data: allDevices = [],
        isFetching: isFetchingDevices,
        isError: isErrorDevices,
    } = useQuery({
        queryKey: ['allDevices'],
        queryFn: getAllDevices,
    });

    const allDataQueryKey = useMemo(
        () => ['allData', startDate, endDate, allDevices],
        [startDate, endDate, allDevices],
    );

    const {
        data: allData = [],
        isFetching: isFetchingAll,
        isError: isErrorAll,
    } = useQuery({
        queryKey: allDataQueryKey,
        queryFn: () => getAllDataByTimeframe(startDate.toISOString(), endDate.toISOString(), allDevices),
        enabled: !!startDate && !!endDate && allDevices.length > 0,
        refetchInterval: 4 * 60 * 1000,
    });

    const averagePM10 = calculateAverage(allData, 'PM10');
    const averagePM25 = calculateAverage(allData, 'PM25');
    const allGraphData = prepareGraphData(allData);

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
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <SummaryBox title="Avg PM10" value={`${averagePM10.toFixed(2)} µg/m³`} />
                            </Grid>
                            <Grid item xs={6}>
                                <SummaryBox title="Avg PM2.5" value={`${averagePM25.toFixed(2)} µg/m³`} />
                            </Grid>
                        </Grid>
                        <Typography variant="h6" mt={4}>
                            Average PM10 and PM2.5 for All Devices
                        </Typography>
                        <Graph data={allGraphData} />
                    </>
                )}
            </Container>
        </>
    );
};

export default Home;
