import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const NavBar = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">Wireless Air Level Logger - Evaluator (WALL-E) Dashboard</Typography>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
