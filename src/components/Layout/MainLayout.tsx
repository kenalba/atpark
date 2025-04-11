import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navigation/Navbar';
import { Box } from '@mui/material';

const MainLayout: React.FC = () => {
  return (
    <Box className="app-container">
      <Navbar />
      <Box className="content">
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
