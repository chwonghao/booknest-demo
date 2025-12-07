import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const GlobalSpinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default GlobalSpinner;