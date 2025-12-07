import React, { useContext, useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Avatar, Grid, List, ListItemButton, ListItemIcon, ListItemText, Divider, CircularProgress, Alert, TextField, Button, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyOrdersApi } from '../api/orderApi';
import { updateProfileApi } from '../api/authApi';
import BreadcrumbsComponent from '../components/BreadcrumbsComponent';

// --- Component cho mục "My Details" ---
const MyDetails = ({ user, onUpdate }) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      console.log('Updating profile with:', formData);
      const updatedUser = await updateProfileApi(user.id, formData);
      onUpdate(updatedUser); // Cập nhật lại context
      alert(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      const message = error.response?.data?.message || 'Failed to update profile.';
      alert(`${t('profile.updateError')}: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSave}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        {t('profile.myAccountDetails')}
      </Typography>
      <Divider sx={{ mb: 3 }}/>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField label={t('profile.emailAddress')} value={user.email} fullWidth disabled variant="filled" />
        </Grid>
        <Grid item xs={12}>
          <TextField name="fullName" label={t('profile.fullName')} value={formData.fullName} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField name="phoneNumber" label={t('profile.phoneNumber')} value={formData.phoneNumber} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField name="address" label={t('profile.address')} value={formData.address} onChange={handleChange} fullWidth multiline rows={3} />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" disabled={isSaving}>{isSaving ? t('profile.saving') : t('profile.saveChanges')}</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const MyOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrdersApi(user.id);
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  if (loading) return <CircularProgress />;
  if (orders.length === 0) return <Typography>{t('orders.noOrders')}</Typography>;

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label={status} color="warning" size="small" />;
      case 'COMPLETED':
        return <Chip label={status} color="success" size="small" />;
      case 'CANCELLED':
        return <Chip label={status} color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        {t('profile.myOrders')}
      </Typography>
      {orders.map((order) => (
        <Paper key={order.id} variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                Order #{order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(order.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3} sx={{ textAlign: { md: 'center' } }}>
              {getStatusChip(order.status)}
            </Grid>
            <Grid item xs={6} md={3} sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                ${order.totalAmount.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Items:</Typography>
          {order.orderItems.filter(item => item.quantity > 0).map((item, index) => (
            <Typography key={index} variant="body2" sx={{ pl: 2 }}>
              - Product ID: {item.productId}, Quantity: {item.quantity}
            </Typography>
          ))}
        </Paper>
      ))}
    </Stack>
  );
};

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser, logout, isAuthenticated, isAdminView, toggleAdminView, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleView = () => {
    toggleAdminView();
    navigate(isAdminView ? '/' : '/admin/dashboard');
  };

  if (!authLoading && !isAuthenticated) {
    return <Alert severity="warning" sx={{ m: 3 }}>Please <a href="/login">login</a> to view your profile.</Alert>;
  }

  if (authLoading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return <MyDetails user={user} onUpdate={updateUser} />;
      case 'orders':
        return <MyOrders />
      case 'settings':
        return <Typography>Settings page is under construction.</Typography>;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
      <BreadcrumbsComponent links={[{ label: t('breadcrumbs.profile') }]} />
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', mb: 2 }}>
                    <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
                        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} width="100%" /> : <Typography variant='h4'>{user.fullName.charAt(0)}</Typography>}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">{user.fullName}</Typography>
                    <Typography variant="body1" color="text.secondary">{user.email}</Typography>
                    {user.role === 'ADMIN' && (
                      <>
                        <Chip label={`${t('profile.role')}: ${user.role}`} color="info" size="small" sx={{ mt: 1 }} />
                        <Button variant="outlined" size="small" onClick={handleToggleView} sx={{ mt: 1 }}>
                          {isAdminView ? t('profile.switchToUserView') : t('profile.switchToAdminView')}
                        </Button>
                      </>
                    )}
                </Box>
                <Divider />
                <List component="nav">
                    <ListItemButton selected={activeTab === 'details'} onClick={() => setActiveTab('details')}>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText primary={t('profile.myDetails')} />
                    </ListItemButton>
                    <ListItemButton selected={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
                        <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                        <ListItemText primary={t('profile.myOrders')} />
                    </ListItemButton>
                    <ListItemButton selected={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <ListItemText primary={t('profile.settings')} />
                    </ListItemButton>
                    <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon><LogoutIcon sx={{ color: 'error.main' }} /></ListItemIcon>
                        <ListItemText primary={t('profile.logout')} />
                    </ListItemButton>
                </List>
            </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
                {renderContent()}
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
