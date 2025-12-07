import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import { useTranslation } from 'react-i18next';

const AdminSidebar = ({ drawerWidth }) => {
    const { t } = useTranslation();

    const menuItems = [
        { text: t('admin.sidebar.dashboard'), icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: t('admin.sidebar.products'), icon: <InventoryIcon />, path: '/admin/products' },
        { text: t('admin.sidebar.orders'), icon: <ShoppingCartIcon />, path: '/admin/orders' },
        { text: t('admin.sidebar.users'), icon: <PeopleIcon />, path: '/admin/users' },
    ];

    const navLinkStyle = ({ isActive }) => ({
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
    });

    return (
        <Drawer
            variant="permanent"
             sx={{
                 width: drawerWidth,
                 flexShrink: 0,
                 [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', top: '64px', height: 'calc(100% - 64px)' },
             }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => (
                        <NavLink to={item.path} key={item.text} style={navLinkStyle}>
                            <ListItemButton><ListItemIcon>{item.icon}</ListItemIcon><ListItemText primary={item.text} /></ListItemButton>
                        </NavLink>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default AdminSidebar;