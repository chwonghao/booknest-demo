import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { toast } from 'react-toastify';
import { getAllUserApi, updateUserApi } from '../../api/userApi';
import { sendEmailApi } from '../../api/notificationApi';
import { useTranslation } from 'react-i18next';


// Helper to get initials from name for Avatar
const getInitials = (name = '') => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('');
  return initials.toUpperCase();
};

// Reusable User Table Component
const UserTable = ({ users, title, onRowClick, t }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" gutterBottom component="h2">{title}</Typography>
    <TableContainer>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '10%' }}>{t('profile.avatar')}</TableCell>
            <TableCell>{t('register.fullName')}</TableCell>
            <TableCell>{t('register.email')}</TableCell>
            <TableCell align="center">{t('profile.settings')}</TableCell>
            <TableCell>{t('profile.role')}</TableCell>
            <TableCell>{t('productPage.published')}</TableCell>
            <TableCell>{t('admin.dashboardPage.recentLogins')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow hover key={user.id} onClick={() => onRowClick(user)} sx={{ cursor: 'pointer' }}>
              <TableCell><Avatar src={user.avatarUrl}>{getInitials(user.fullName)}</Avatar></TableCell>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell align="center"><Chip label={user.status} color={user.status === 'ACTIVE' ? 'success' : 'default'} size="small" /></TableCell>
              <TableCell>
                <Chip label={user.role} color={user.role === 'ADMIN' ? 'secondary' : 'default'} size="small" />
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {users.length === 0 && <Typography sx={{ mt: 2, textAlign: 'center' }}>{t('admin.userManagementPage.noUsersInCategory')}</Typography>}
  </Box>
);

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { t } = useTranslation();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUserApi();
      setUsers(data || []);
    } catch (err) {
      setError(t('admin.userManagementPage.fetchError'));
      setUsers([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const { staff, customers } = useMemo(() => {
    const staffList = users.filter(user => user.role === 'ADMIN');
    const customerList = users.filter(user => user.role === 'USER');
    return { staff: staffList, customers: customerList };
  }, [users]);

  const handleRowClick = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setIsEmailModalOpen(false);
    setEmailSubject(''); setEmailBody('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      // Chỉ gửi những trường cần thiết để cập nhật
      const { id, role, status } = editingUser;
      await updateUserApi(id, { role, status });
      toast.success(t('admin.userManagementPage.updateSuccess'));
      handleCloseModal();
      fetchUsers(); // Tải lại danh sách người dùng
    } catch (apiError) {
      console.error('Failed to update user:', apiError);
      toast.error(t('admin.userManagementPage.updateError'));
    }
  };

  const handleOpenEmailModal = () => {
    setIsModalOpen(false); // Đóng modal edit
    setIsEmailModalOpen(true); // Mở modal gửi email
  };

  const handleSendEmail = async () => {
    if (!editingUser || !emailSubject || !emailBody) {
      toast.warn(t('admin.userManagementPage.emailFormInvalid'));
      return;
    }
    setIsSending(true);
    try {
      const payload = {
        userId: editingUser.id,
        subject: emailSubject,
        message: emailBody,
        type: 'EMAIL', // Thêm loại thông báo là EMAIL
        status: 'PENDING' // Thêm trạng thái ban đầu
      };
      await sendEmailApi(payload);
      toast.success(`${t('admin.userManagementPage.emailSentSuccess')} ${editingUser.fullName}`);
      handleCloseModal(); // Đóng tất cả modal và reset state
    } catch (apiError) {
      console.error('Failed to send email:', apiError);
      toast.error(t('admin.userManagementPage.emailSentError'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h4" gutterBottom>{t('admin.userManagementPage.title')}</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <UserTable users={staff} title={t('admin.userManagementPage.staff')} onRowClick={handleRowClick} t={t} />
          <UserTable users={customers} title={t('admin.userManagementPage.customers')} onRowClick={handleRowClick} t={t} />
        </>
      )}

      {/* Edit User Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth disableScrollLock={true}>
        <DialogTitle>{t('admin.userManagementPage.editUser')}</DialogTitle>
        {editingUser && (
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField fullWidth label={t('register.fullName')} name="fullName" value={editingUser.fullName} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label={t('register.email')} name="email" value={editingUser.email} disabled />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('profile.settings')}</InputLabel>
                  <Select name="status" value={editingUser.status} label={t('profile.settings')} onChange={handleInputChange} MenuProps={{ disableScrollLock: true }}>
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                    <MenuItem value="BANNED">BANNED</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('profile.role')}</InputLabel>
                  <Select name="role" value={editingUser.role} label={t('profile.role')} onChange={handleInputChange} MenuProps={{ disableScrollLock: true }}>
                    <MenuItem value="USER">USER</MenuItem>
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('action.cancel')}</Button>
          <Button onClick={handleOpenEmailModal} color="primary">{t('admin.userManagementPage.sendEmail')}</Button>
          <Button onClick={handleSaveUser} variant="contained">{t('profile.saveChanges')}</Button>
        </DialogActions>
      </Dialog>

      {/* Send Email Modal */}
      <Dialog open={isEmailModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>{t('admin.userManagementPage.sendEmailTo')} {editingUser?.fullName}</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('register.email')}: {editingUser?.email}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="subject"
              label={t('admin.userManagementPage.emailSubject')}
              type="text"
              fullWidth
              variant="outlined"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <TextField
              margin="dense" id="body" label={t('admin.userManagementPage.emailContent')} type="text" fullWidth multiline rows={8} variant="outlined" value={emailBody} onChange={(e) => setEmailBody(e.target.value)}
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('action.cancel')}</Button>
          <Button onClick={handleSendEmail} variant="contained" disabled={isSending}>{isSending ? t('admin.userManagementPage.sending') : t('admin.userManagementPage.send')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserManagementPage;