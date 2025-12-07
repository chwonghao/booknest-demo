import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';

const AdminLayout = () => {
  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Header />
      <AdminSidebar drawerWidth={drawerWidth}/>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar /> {/* Spacer to push content below the fixed AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;