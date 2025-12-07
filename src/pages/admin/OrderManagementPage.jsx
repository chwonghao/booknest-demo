import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi';
import { fetchProduct } from '../../api/productApi';
import { useTranslation } from 'react-i18next';

export default function OrderManagementPage() {
  const ALL_STATUSES = ["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED", "RETURNED", "REFUNDED"];

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { t } = useTranslation();

  // Column configuration for sorting
  const headCells = [
    { id: 'id', numeric: false, disablePadding: false, label: t('profile.myOrders') + ' ID' },
    { id: 'userName', numeric: false, disablePadding: false, label: t('profile.fullName') },
    { id: 'createdAt', numeric: false, disablePadding: false, label: t('productPage.published') },
    { id: 'totalAmount', numeric: true, disablePadding: false, label: t('cart.summary.total') },
    { id: 'status', numeric: false, disablePadding: false, label: t('profile.settings'), sortable: false },
  ];
  
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllOrdersApi();
      setOrders(data || []);
    } catch (err) {
      setError(t('admin.orderManagementPage.fetchError'));
      setOrders([]); // Reset orders to an empty array on error
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const handleSortRequest = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({ key: property, direction: isAsc ? 'desc' : 'asc' });
  };

  const handleRowClick = async (order) => {
    // Hiển thị dialog với dữ liệu cơ bản trước
    setSelectedOrder({ ...order, orderItems: [] }); // Hiển thị orderItems rỗng tạm thời
    setNewStatus(order.status);
    setIsDetailOpen(true);

    try {
      // Lấy thông tin chi tiết cho từng sản phẩm trong đơn hàng
      const detailedItems = await Promise.all(
        order.orderItems.map(async (item) => {
          const productDetails = await fetchProduct(item.productId);
          return { ...item, ...productDetails }; // Kết hợp thông tin số lượng và chi tiết sản phẩm
        })
      );
      // Cập nhật lại state với đầy đủ thông tin sản phẩm
      setSelectedOrder({ ...order, orderItems: detailedItems });
    } catch (err) {
      console.error("Failed to fetch product details for order:", err);
      setNotification({ open: true, message: t('admin.orderManagementPage.loadProductDetailsError'), severity: 'error' });
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;

    setIsUpdating(true);
    try {
      const updatedOrder = await updateOrderStatusApi(selectedOrder.id, newStatus);
      // Cập nhật lại danh sách đơn hàng trong state
      setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setNotification({ open: true, message: t('admin.orderManagementPage.updateSuccess'), severity: 'success' });
      handleCloseDetail();
    } catch (err) {
      console.error("Failed to update status:", err);
      setNotification({ open: true, message: t('admin.orderManagementPage.updateError'), severity: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const filteredAndSortedOrders = useMemo(() => {
    let sortableItems = [...orders];

    // Filtering
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      sortableItems = sortableItems.filter(order =>
        order.userName.toLowerCase().includes(searchTerm) ||
        order.id.toString().includes(searchTerm)
      );
    }
    if (filters.status) {
      sortableItems = sortableItems.filter(order => order.status === filters.status);
    }

    // Sorting
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [orders, filters, sortConfig]);

  const getStatusChip = (status) => {
    const statusMap = {
      PENDING: { label: 'Pending', color: 'warning' },
      CONFIRMED: { label: 'Confirmed', color: 'secondary' },
      CANCELLED: { label: 'Cancelled', color: 'error' },
      SHIPPED: { label: 'Shipped', color: 'primary' },
      DELIVERED: { label: 'Delivered', color: 'success' },
      COMPLETED: { label: 'Completed', color: 'success' },
      PAID: { label: 'Paid', color: 'info' },
      RETURNED: { label: 'Returned', color: 'default' },
      REFUNDED: { label: 'Refunded', color: 'default' },
    };
    const { label, color } = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  return (
    <Paper sx={{ p: 3, m: 2}}>
      <Typography variant="h4" gutterBottom>{t('admin.orderManagementPage.title')}</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label={t('admin.orderManagementPage.searchPlaceholder')}
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t('profile.settings')}</InputLabel>
          <Select
            value={filters.status}
            label={t('profile.settings')}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value=""><em>{t('admin.orderManagementPage.allStatuses')}</em></MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="SHIPPED">Shipped</MenuItem>
            <MenuItem value="DELIVERED">Delivered</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
            <MenuItem value="RETURNED">Returned</MenuItem>
            <MenuItem value="REFUNDED">Refunded</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : headCell.id === 'status' ? 'center' : 'left'}
                      sortDirection={sortConfig.key === headCell.id ? sortConfig.direction : false}
                    >
                      {headCell.sortable === false ? headCell.label : (
                        <TableSortLabel
                          active={sortConfig.key === headCell.id}
                          direction={sortConfig.key === headCell.id ? sortConfig.direction : 'asc'}
                          onClick={() => handleSortRequest(headCell.id)}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow hover key={order.id} onClick={() => handleRowClick(order)} sx={{ cursor: 'pointer' }}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.userName}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell align="center" >{getStatusChip(order.status)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAndSortedOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            SelectProps={{
              MenuProps: {
                disableScrollLock: true,
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
              },
            }}
          />
        </>
      )}

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth disableScrollLock={true}>
        <DialogTitle>{t('admin.orderManagementPage.orderDetails')}</DialogTitle>
        {selectedOrder && (
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Typography><strong>{t('profile.myOrders')} ID:</strong> #{selectedOrder.id}</Typography>
              <Typography><strong>{t('profile.fullName')}:</strong> {selectedOrder.userName || `User ID: ${selectedOrder.userId}`}</Typography>
              <Typography><strong>{t('productPage.published')}:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
              <Typography><strong>{t('cart.summary.total')}:</strong> ${selectedOrder.totalAmount.toFixed(2)}</Typography>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('admin.orderManagementPage.updateStatus')}</InputLabel>
              <Select
                value={newStatus}
                label={t('admin.orderManagementPage.updateStatus')}
                onChange={(e) => setNewStatus(e.target.value)}
                MenuProps={{ disableScrollLock: true }}
              >
                {ALL_STATUSES.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={2}>
              <Typography variant="h6">{t('cart.title')}</Typography>
              <List dense>
                {selectedOrder.orderItems.map(item => (
                  <ListItem key={item.productId} divider>
                    <ListItemText
                      primary={item.name + ' x ' + item.quantity || `Product ID: ${item.productId}`}
                    />
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>

            {selectedOrder.shippingAddress && (
              <Box mt={2}>
                <Typography variant="h6">{t('checkout.shippingInfo')}</Typography>
                <Typography>{selectedOrder.shippingAddress}</Typography>
              </Box>
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseDetail}>{t('action.cancel')}</Button>
          <Button 
            onClick={handleStatusUpdate} 
            color="primary" 
            variant="contained"
            disabled={isUpdating || newStatus === selectedOrder?.status}
          >
            {isUpdating ? <CircularProgress size={24} /> : t('action.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>

      {notification.open && (
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      )}
    </Paper>
  );
};
