import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const prepareGraphData = (data) => {
    return data.map((entry) => ({
        timestamp: dayjs(entry.Timestamp).tz(dayjs.tz.guess()).format('YYYY-MM-DD HH:mm:ss'),
        pm10: parseFloat(entry.PM10),
        pm25: parseFloat(entry.PM25),
    }));
};

export const calculateAverage = (data, key) => {
    if (!data.length) return 0;
    const total = data.reduce((sum, entry) => sum + parseFloat(entry[key]), 0);
    return total / data.length;
};
