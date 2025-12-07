import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// Giả sử bạn có một hàm API để gọi đến backend
// import { forgotPasswordApi } from '../api/authApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      // --- PHẦN NÀY CẦN BACKEND HỖ TRỢ ---
      // await forgotPasswordApi({ email }); 
      
      // Giả lập thành công để demo
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      setSuccessMessage(t('forgotPassword.successMessage'));
      toast.success(t('forgotPassword.requestSent'));
    } catch (error) {
      console.error("Forgot password error:", error);
      // Hiển thị thông báo thành công chung để tránh lộ thông tin email nào tồn tại/không tồn tại
      setSuccessMessage(t('forgotPassword.successMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          {t('forgotPassword.title')}
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
          {t('forgotPassword.subtitle')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
          <TextField
            margin="normal" required fullWidth id="email" label={t('login.email')} name="email" autoComplete="email" autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || !!successMessage}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading || !email || !!successMessage}>
            {loading ? t('forgotPassword.sending') : t('forgotPassword.sendLink')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;