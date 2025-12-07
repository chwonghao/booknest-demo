import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, List, ListItem, ListItemText, Divider, Avatar, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import { getAllOrdersApi } from '../../api/orderApi';
import { getAllUserApi } from '../../api/userApi';
import { fetchAllProducts } from '../../api/productApi';
import { useTranslation } from 'react-i18next';

const StatCard = ({ icon, title, value, color, loading }) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
    <Avatar sx={{ bgcolor: color, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography color="text.secondary">{title}</Typography>
      <Typography variant="h5" component="p" fontWeight="bold">
        {loading ? <CircularProgress size={20} /> : value}
      </Typography>
    </Box>
  </Paper>
);

const STATUS_COLORS = {
  PENDING: '#FFC107', // warning
  CONFIRMED: '#9C27B0', // secondary
  PAID: '#03A9F4', // info
  SHIPPED: '#2196F3', // primary
  DELIVERED: '#8BC34A', // success-like
  COMPLETED: '#4CAF50', // success
  CANCELLED: '#F44336', // error
  RETURNED: '#607D8B', // blue grey
  REFUNDED: '#795548', // brown
  DEFAULT: '#9E9E9E', // default grey
};


const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const mockRecentOrders = await getAllOrdersApi();
        const allUsers = await getAllUserApi();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newCustomersCount = allUsers.filter(user => {
          const userCreationDate = new Date(user.createdAt);
          return user.role === 'USER' && userCreationDate > thirtyDaysAgo;
        }).length;

        const allProducts = await fetchAllProducts();
        // Tính tổng số lượng sản phẩm trong kho
        const totalStock = allProducts.reduce((sum, product) => sum + (product.stockQuantity || 0), 0);

        const lowStockProducts = allProducts
          .filter(p => p.stockQuantity < 10)
          .sort((a, b) => a.stockQuantity - b.stockQuantity);

        // Tính toán dữ liệu cho biểu đồ tròn trạng thái đơn hàng
        const statusCounts = mockRecentOrders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});
        const orderStatusData = Object.keys(statusCounts).map(status => ({
          name: status,
          value: statusCounts[status],
        }));

        // Tính tổng doanh thu thực tế từ các đơn hàng đã hoàn thành
        const totalRevenue = mockRecentOrders
          .filter(order => order.status === 'COMPLETED')
          .reduce((sum, order) => sum + order.totalAmount, 0);

        const mockSummaryData = {
          totalRevenue: totalRevenue,
          totalOrders: mockRecentOrders.length,
          newCustomers: newCustomersCount,
          productsInStock: totalStock,
        };
        const mockSalesData = [
          { name: 'T2', sales: 4000 }, { name: 'T3', sales: 3000 },
          { name: 'T4', sales: 2000 }, { name: 'T5', sales: 2780 },
          { name: 'T6', sales: 1890 }, { name: 'T7', sales: 2390 },
          { name: 'CN', sales: 3490 },
        ];
        
        // Giả lập độ trễ của mạng
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Since getAllOrdersApi now returns an array directly, we use it as is.
        // We might want to limit the number of recent orders shown on the dashboard.
        const recentOrders = mockRecentOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const recentLogins = allUsers
          .filter(user => user.lastLogin) // Chỉ lấy user đã từng đăng nhập
          .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin)) // Sắp xếp mới nhất trước
          .slice(0, 5); // Lấy 5 user gần nhất

        setData({ summaryData: mockSummaryData, salesData: mockSalesData, recentOrders: recentOrders, lowStockProducts: lowStockProducts, orderStatusData: orderStatusData, recentLogins: recentLogins });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(t('admin.dashboardPage.fetchError'));
        setData(null); // Clear old data on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom component="h1" fontWeight="bold">
        {t('admin.dashboardPage.title')}
      </Typography>
      <Grid container spacing={3} pb={10}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<MonetizationOnIcon />} 
            title={t('admin.dashboardPage.totalRevenue')}
            value={data?.summaryData?.totalRevenue ? `$${data.summaryData.totalRevenue.toLocaleString()}` : 'N/A'}
            color="success.main"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<ShoppingCartIcon />} 
            title={t('admin.dashboardPage.totalOrders')}
            value={data?.summaryData?.totalOrders ?? 'N/A'}
            color="info.main"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<PeopleIcon />} 
            title={t('admin.dashboardPage.newCustomers')}
            value={data?.summaryData?.newCustomers ?? 'N/A'}
            color="warning.main"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<InventoryIcon />} 
            title={t('admin.dashboardPage.productsInStock')}
            value={data?.summaryData?.productsInStock ?? 'N/A'}
            color="error.main"
            loading={loading}
          />
        </Grid>

        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>{t('admin.dashboardPage.weeklyRevenue')}</Typography>
            {loading ? (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data?.salesData || []} margin={{ top: 5, right: 20, left: -10, bottom: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name={t('admin.dashboardPage.sales')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Order Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>{t('admin.dashboardPage.orderStatusRatio')}</Typography>
            {loading ? <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box> : (
              <Box sx={{ width: '100%', flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.orderStatusData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {data?.orderStatusData?.map((entry, index) => <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS.DEFAULT} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Low Stock Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom component="div" sx={{ mb: 0 }}>
                {t('admin.dashboardPage.lowStockProducts')}
              </Typography>
            </Box>
            {loading ? <CircularProgress /> : (
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                  data.lowStockProducts.map(product => (
                    <ListItem key={product.id} divider>
                      <ListItemText
                        primary={product.name}
                        secondaryTypographyProps={{ color: 'error.main', fontWeight: 'bold' }}
                        secondary={t('admin.dashboardPage.onlyLeft', { count: product.stockQuantity })}
                      />
                    </ListItem>
                  ))
                ) : <Typography sx={{ p: 2, color: 'text.secondary' }}>{t('admin.dashboardPage.noLowStockProducts')}</Typography>}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Logins */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LoginIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom component="div" sx={{ mb: 0 }}>
                {t('admin.dashboardPage.recentLogins')}
              </Typography>
            </Box>
            {loading ? <CircularProgress /> : (
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {data?.recentLogins && data.recentLogins.length > 0 ? (
                  data.recentLogins.map(user => (
                    <ListItem key={user.id} divider>
                      <Avatar sx={{ mr: 2 }} src={user.avatarUrl} />
                      <ListItemText
                        primary={user.fullName}
                        secondary={`${t('admin.dashboardPage.loggedInAt')}${new Date(user.lastLogin).toLocaleString()}`}
                      />
                    </ListItem>
                  ))
                ) : <Typography sx={{ p: 2, color: 'text.secondary' }}>{t('admin.dashboardPage.noRecentLogins')}</Typography>}
              </List>
            )}
          </Paper>
        </Grid>
        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: '100%'}}>
            <Typography variant="h6" gutterBottom>{t('admin.dashboardPage.recentOrders')}</Typography>
            {loading ? <CircularProgress /> : (
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map((order, index) => (
                  <React.Fragment key={order.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`${t('admin.dashboardPage.order')} #${order.id} - ${order.userName}`}
                        secondary={`$${order.totalAmount.toFixed(2)} - ${new Date(order.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                    {index < data.recentOrders.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>{t('admin.dashboardPage.noRecentOrders')}</Typography>
              )}
            </List>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardPage;