import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert, Grid, Link } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const { t } = useTranslation();
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const { fullName, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = t('register.validation.fullNameRequired');
    if (!email.trim()) {
      newErrors.email = t('register.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('register.validation.emailInvalid');
    }
    if (!password) {
      newErrors.password = t('register.validation.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('register.validation.passwordMinLength');
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('register.passwordMismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    // Backend chỉ cần fullName, email, password
    const result = await register({ fullName, email, password });

    if (result.success) {
      setSuccess(t('register.success'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setErrors({ api: result.message }); // Hiển thị lỗi từ API
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(https://source.unsplash.com/random/1920x1080?books,study)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px) brightness(0.7)',
          zIndex: -1,
        },
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
          {t('register.title').toUpperCase()}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {errors.api && <Alert severity="error" sx={{ mb: 2 }}>{errors.api}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            id="fullName" 
            label={t('register.fullName')} 
            name="fullName" 
            autoComplete="name" 
            autoFocus 
            value={fullName} 
            onChange={handleChange} 
            error={!!errors.fullName}
            helperText={errors.fullName}
          />
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            id="email" 
            label={t('register.email')} 
            name="email" 
            autoComplete="email" 
            value={email} 
            onChange={handleChange} 
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField margin="normal" required fullWidth name="password" label={t('register.password')} type="password" id="password" value={password} onChange={handleChange} error={!!errors.password} helperText={errors.password} />
          <TextField 
            margin="normal" required fullWidth name="confirmPassword" label={t('register.confirmPassword')} type="password" id="confirmPassword" value={confirmPassword} onChange={handleChange} 
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!!success} // Vô hiệu hóa nút sau khi đăng ký thành công
          >
            {t('register.signUp')}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                {t('register.haveAccount')}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
