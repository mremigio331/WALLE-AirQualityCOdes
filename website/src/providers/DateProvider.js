import React, { createContext, useContext, useState } from 'react';
import dayjs from 'dayjs';

// Create a Context for the date state
const DateContext = createContext();

// Create a provider component
export const DateProvider = ({ children }) => {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
    const [endDate, setEndDate] = useState(dayjs());

    return (
        <DateContext.Provider value={{ startDate, setStartDate, endDate, setEndDate }}>{children}</DateContext.Provider>
    );
};

// Custom hook to use the DateContext
export const useDate = () => useContext(DateContext);
