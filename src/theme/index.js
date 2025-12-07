import { createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 375,
      md: 768,
      lg: 1024,
      xl: 1366,
    },
  },
  palette, // Sử dụng bảng màu từ palette.js
  typography, // Sử dụng typography từ typography.js
  shape: {
    borderRadius: 8, // Thêm một chút bo tròn hiện đại cho các component
  },
  components: {
    // Ví dụ về việc ghi đè kiểu dáng của một component cụ thể
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          paddingTop: '10px',
          paddingBottom: '10px',
        }
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px',
            }
        }
    }
  },
});

export default theme;
