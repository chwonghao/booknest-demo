import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
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

    const navLinkStyle = {
        textDecoration: 'none', // Loại bỏ gạch chân của link
        color: 'inherit',       // Kế thừa màu chữ
        display: 'block',       // Đảm bảo NavLink chiếm toàn bộ chiều rộng
    };

    const activeListItemStyle = {
        backgroundColor: 'primary.light', // Màu nền khi được chọn
        color: 'primary.contrastText',    // Màu chữ và icon khi được chọn
        '& .MuiListItemIcon-root': {
            color: 'primary.contrastText', // Đảm bảo icon cũng đổi màu
        },
        '&:hover': {
            backgroundColor: 'primary.main', // Hiệu ứng hover đậm hơn một chút
        },
        // Thêm một đường viền bên trái để nhấn mạnh
        borderLeft: 4,
        borderColor: 'primary.dark',
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                pt:-8,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { 
                    width: drawerWidth, 
                    boxSizing: 'border-box',
                    bgcolor: 'background.default', // Màu nền nhẹ nhàng hơn
                },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List component="nav">
                    {menuItems.map((item) => (
                        <NavLink to={item.path} key={item.text} style={navLinkStyle} end>
                            {({ isActive }) => (
                                <ListItemButton sx={isActive ? activeListItemStyle : {}}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            )}
                        </NavLink>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default AdminSidebar;
