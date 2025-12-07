import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, Alert, Grid, InputAdornment, IconButton, Divider, Link } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  useEffect(() => {
    // Kiểm tra xem có thông báo được truyền qua state không
    if (location.state?.message) {
      toast.info(location.state.message);
      // Xóa state để thông báo không hiển thị lại khi người dùng điều hướng trong trang
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = t('login.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('login.validation.emailInvalid');
    }
    if (!password) {
      newErrors.password = t('login.validation.passwordRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true }); // Chuyển về trang trước đó hoặc trang chủ
    } else {
      setErrors({ api: result.message });
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    // Điền thông tin vào form để người dùng thấy
    setEmail(quickEmail);
    setPassword(quickPassword);

    const result = await login(quickEmail, quickPassword);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors({ api: result.message });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)', // 64px là chiều cao của header
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(https://source.unsplash.com/random/1920x1080?library,books)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px) brightness(0.7)',
          zIndex: -1,
        },
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
          {t('login.title').toUpperCase()}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {errors.api && <Alert severity="error" sx={{ mb: 2 }}>{errors.api}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('login.email')}
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('login.password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          > 
            {t('login.signIn')}
          </Button>

          {/* Quick Login for Dev */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" align="center">
                {t('login.quickLoginDevOnly')}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickLogin('user@example.com', 'password123')}
              >
                {t('login.loginAsUser')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleQuickLogin('admin@example.com', 'password123')}
              >
                {t('login.loginAsAdmin')}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">{t('login.or')}</Typography>
          </Divider>
          
          <Grid container sx={{ mt: 2 }}>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                {t('login.forgotPassword')}
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {t('login.noAccount')}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
