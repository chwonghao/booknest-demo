import React, { createContext, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import './NotificationContext.css'; // Import file CSS tùy chỉnh

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
    const { t } = useTranslation();
    
    const notificationIcons = {
        success: <CheckCircleIcon />,
        error: <ErrorIcon />,
        warn: <WarningIcon />,
        info: <InfoIcon />,
    };
    
    const notify = (type, messageKey, options = {}) => {
        const message = t(messageKey);
        toast[type](message, {
            // Thêm icon tương ứng với loại thông báo
            icon: notificationIcons[type] || notificationIcons.info,
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            ...options,
        });
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <ToastContainer />
        </NotificationContext.Provider>
    );
};