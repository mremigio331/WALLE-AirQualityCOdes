import React, { createContext, useContext, useState } from 'react';

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    return <DeviceContext.Provider value={{ isMobile, setIsMobile }}>{children}</DeviceContext.Provider>;
};

export const useDevice = () => useContext(DeviceContext);
