import { useState, useEffect, useContext, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container, InputBase, IconButton, Grid, Paper, List, ListItemText, Avatar, ListItemButton, Badge, Menu, Button, Stack, Divider, CircularProgress, Chip, useTheme, useMediaQuery, Drawer, ListItem, useScrollTrigger } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { CartContext } from '../context/CartContext';
import { fetchProducts } from '../api/productApi';
import { getNotificationsApi } from '../api/notificationApi'
import { AuthContext } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

// A simple debounce utility
// const debounce = (func, delay) => {
//     let timeout;
//     return (...args) => {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func(...args), delay);
//     };
// };

// --- Mock API calls ---
const mockSuggestions = ['fantasy books', 'new releases', 'best sellers 2024', 'sci-fi classics'];

const fetchSearchSuggestions = async (query) => {
    console.log(`Fetching suggestions for: ${query}`);
    await new Promise(res => setTimeout(res, 200)); // Simulate network delay
    if (!query) return [];
    return mockSuggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()));
};
// --- End Mock API calls ---

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
  },
  width: '100%',
  [theme.breakpoints.up('md')]: {
      width: '60ch',
  }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

const SearchOverlay = ({ suggestions, results, onResultClick }) => {
    const { t } = useTranslation();

    return (
    <Paper sx={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: 0,
        right: 0,
        zIndex: 1200, // Ensure it's above other content
    }}>
        <Grid container>
            <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid #ddd'} }}>
                <Typography variant="subtitle2" sx={{ p: 2, bgcolor: 'grey.100' }}>{t('header.suggestions')}</Typography>
                <List>
                    {suggestions.map(text => <ListItemButton key={text}><ListItemText primary={text} /></ListItemButton>)}
                </List>
            </Grid>
            <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" sx={{ p: 2, bgcolor: 'grey.100' }}>{t('header.products')}</Typography>
                <List>
                    {results.map(prod => (
                        <ListItemButton key={prod.id} component={RouterLink} to={`/products/${prod.id}`} onClick={onResultClick}>
                            <Avatar 
                                src={prod.imageUrl} 
                                alt={prod.name} 
                                variant="square"
                                sx={{ 
                                    mr: 2, 
                                    width: 40, 
                                    height: 60, 
                                    borderRadius: 1,
                                    objectFit: 'cover'
                                }} />
                            <ListItemText primary={prod.name} secondary={prod.author} />
                            <Typography variant="body1">${prod.price}</Typography>
                        </ListItemButton>
                    ))}
                </List>
            </Grid>
        </Grid>
    </Paper>
    );
};

const Header = () => {
    const { t } = useTranslation();
    const { cartCount } = useContext(CartContext);
    const { user, isAdminView } = useContext(AuthContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const searchContainerRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState({ loading: false, data: [] });
    
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0, // Kích hoạt ngay khi bắt đầu cuộn
    });

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            setResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            const [suggs, allProducts] = await Promise.all([
                fetchSearchSuggestions(searchQuery),
                fetchProducts({}),
            ]);

            const filteredProducts = allProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 5);

            setSuggestions(suggs);
            setResults(filteredProducts);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setOverlayVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchContainerRef]);

    const handleResultClick = () => {
        setOverlayVisible(false);
        setSearchQuery('');
    }

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
            setOverlayVisible(false);
            setSearchQuery('');
        }
    }

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleNotificationMenuOpen = async (event) => {
        setNotificationAnchorEl(event.currentTarget);
        setNotifications({ loading: true, data: [] });
        try {
            const data = await getNotificationsApi();
            setNotifications({ loading: false, data: data });
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setNotifications({ loading: false, data: [] });
        }
    };

    const handleNotificationMenuClose = () => {
        setNotificationAnchorEl(null);
    };

    const drawerContent = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                BOOKNEST
            </Typography>
            <Divider />
            <List>
                <ListItem button component={RouterLink} to="/products">
                    <ListItemText primary={t('header.products')} />
                </ListItem>
                <ListItem button component={RouterLink} to="/cart">
                    <ListItemText primary={t('cart.title')} />
                </ListItem>
                {user ? (
                    <ListItem button component={RouterLink} to="/profile">
                        <ListItemText primary={user.fullName} />
                    </ListItem>
                ) : (
                    <>
                        <ListItem button component={RouterLink} to="/login">
                            <ListItemText primary={t('header.login')} />
                        </ListItem>
                        <ListItem button component={RouterLink} to="/register">
                            <ListItemText primary={t('register.title')} />
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar 
                position="fixed" 
                color={isAdminView ? "secondary" : "primary"} 
                elevation={trigger ? 4 : 0} // Thêm đổ bóng khi cuộn
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    // Sử dụng màu primary cho header chính, secondary cho admin
                    backgroundColor: isAdminView ? 'secondary.main' : 'primary.main',
                    // Chữ và icon sẽ có màu trắng trên nền màu
                    color: 'common.white',
                    // Hiệu ứng chuyển tiếp cho đổ bóng
                    transition: 'box-shadow 0.3s ease',
                }}>
                <Container maxWidth={isAdminView ? false : 'lg'}>
                <Toolbar disableGutters>
                    <Typography variant="h5" noWrap component={RouterLink} to={isAdminView ? "/admin/dashboard" : "/"} sx={{ mr: 3, display: { xs: 'block' }, fontWeight: 700, letterSpacing: '.2rem', color: 'inherit', textDecoration: 'none' }}>
                        BOOKNEST
                    </Typography>
                    {isAdminView && <Chip label="Admin" color="default" size="small" />}

                    {!isAdminView ? (
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: 2, position: 'relative' }} ref={searchContainerRef}>
                            <Search>
                                <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
                                <StyledInputBase
                                    placeholder={t('header.searchPlaceholder')}
                                    inputProps={{ 'aria-label': 'search' }}
                                    value={searchQuery}
                                    onFocus={() => setOverlayVisible(true)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchSubmit}
                                />
                            </Search>
                            {isOverlayVisible && searchQuery && <SearchOverlay suggestions={suggestions} results={results} onResultClick={handleResultClick} />}
                        </Box>
                    ) : (
                        <Box sx={{ flexGrow: 1 }} />
                    )}
                    
                    {isMobile ? (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={handleDrawerToggle}
                        >
                            <MenuIcon />
                        </IconButton>
                    ) : (
                        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                            <LanguageSwitcher />
                            {!isAdminView && (
                                <IconButton size="large" aria-label="show cart items" color="inherit" component={RouterLink} to="/cart">
                                    <Badge badgeContent={cartCount} color="error"><ShoppingCartOutlinedIcon /></Badge>
                                </IconButton>
                            )}
                            <IconButton size="large" aria-label="show notifications" color="inherit" onClick={handleNotificationMenuOpen}>
                                <Badge badgeContent={notifications.data.filter(n => !n.read).length} color="error">
                                    <NotificationsNoneOutlinedIcon />
                                </Badge>
                            </IconButton>
                            <Menu
                                anchorEl={notificationAnchorEl}
                                open={Boolean(notificationAnchorEl)}
                                onClose={handleNotificationMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                disableScrollLock={true}
                                PaperProps={{ sx: { mt: 1.5, width: 360, maxHeight: 400 } }}
                            >
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">Notifications</Typography>
                                    <Button size="small">Mark all as read</Button>
                                </Box>
                                <Divider />
                                {notifications.loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
                                ) : notifications.data.length === 0 ? (
                                    <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No new notifications</Typography>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {notifications.data.map(notif => (
                                            <ListItemButton key={notif.id} sx={{ bgcolor: notif.read ? 'transparent' : 'action.hover' }}>
                                                <ListItemText primary={notif.message} secondary={new Date(notif.createdAt).toLocaleString()} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                )}
                            </Menu>

                            {user ? (
                                <IconButton size="large" edge="end" aria-label="account of current user" color="inherit" component={RouterLink} to="/profile">
                                    <AccountCircleOutlinedIcon />
                                </IconButton>
                            ) : (
                                <>
                                    <IconButton size="large" edge="end" aria-label="account of current user" color="inherit" onClick={handleUserMenuOpen}>
                                        <AccountCircleOutlinedIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleUserMenuClose}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        disableScrollLock={true}
                                        PaperProps={{
                                            sx: {
                                                mt: 1.5,
                                                width: 250,
                                            },
                                        }}
                                    >
                                        <Box sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="subtitle1" gutterBottom>{t('header.welcome')}</Typography>
                                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                                                <Button
                                                    component={RouterLink} to="/register"
                                                    variant="contained" color="primary" fullWidth
                                                    onClick={handleUserMenuClose}
                                                >{t('header.createAccount')}</Button>
                                                <Button
                                                    component={RouterLink} to="/login"
                                                    variant="outlined" color="primary" fullWidth
                                                    onClick={handleUserMenuClose}
                                                >{t('header.login')}</Button>
                                            </Stack>
                                        </Box>
                                    </Menu>
                                </>
                            )}
                        </Box>
                        )}
                </Toolbar>
                </Container>
            </AppBar>
            <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
                {drawerContent}
            </Drawer>
            {/* This Toolbar is a spacer to push down the content below the fixed AppBar */}
            <Toolbar />
        </>
    );
};

export default Header;