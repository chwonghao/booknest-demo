import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" component="h1" fontWeight="bold" color="primary">
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        {t('notFound.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
        {t('notFound.subtitle')}
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        {t('notFound.goHome')}
      </Button>
    </Box>
  );
};

export default NotFoundPage;
