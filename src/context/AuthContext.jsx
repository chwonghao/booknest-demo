import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import i18n from "../i18n"; // Đường dẫn này bây giờ đã đúng vì i18n.js nằm ở src/
import { loginApi, registerApi, profileApi, refreshTokenApi } from "../api/authApi";
import { jwtDecode } from "jwt-decode";
import { useNotification } from "./NotificationContext";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(() => {
    return localStorage.getItem('adminView') === 'true';
  });

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminView');
    setUser(null);
    setIsAdminView(false);
    delete axios.defaults.headers.common['Authorization'];
    if (window.location.pathname !== '/login') navigate('/login', { replace: true });
  }, [navigate]);

  // Effect: Xử lý khôi phục phiên và thiết lập interceptor
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            throw new Error("Token expired");
          }
          // Nếu user chưa có trong state, fetch từ API
          if (!user) await profileApi(decodedToken.sub).then(userData => setUser(userData));
        } catch (error) {
          console.error("Session restore error:", error);
          notify('warn', 'auth.sessionExpired');
          return logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    restoreSession();

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async (error) => {
        const originalRequest = error.config;
        // Kiểm tra nếu lỗi là 401 và không phải là yêu cầu refresh token đã thất bại
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const localRefreshToken = localStorage.getItem('refreshToken');
          if (!localRefreshToken) {
            logout();
            return Promise.reject(error);
          }

          try {
            const { accessToken: newAccessToken } = await refreshTokenApi(localRefreshToken);
            
            // Cập nhật token mới
            setToken(newAccessToken);
            localStorage.setItem('authToken', newAccessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            
            // Thực hiện lại yêu cầu ban đầu đã thất bại
            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            notify('warn', 'auth.sessionExpired');
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Dọn dẹp interceptor khi component unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, user, logout, notify]); // Re-run if token changes (login/logout)

  const handleUserStatusCheck = (userData) => {
    if (userData.status === 'ACTIVE') {
      return { success: true };
    }

    let messageKey;
    switch (userData.status) {
      case 'BANNED':
        messageKey = 'auth.accountBanned';
        break;
      case 'INACTIVE':
      default:
        messageKey = 'auth.accountInactive';
        break;
    }
    return { success: false, message: i18n.t(messageKey) };
  };

  const processSuccessfulLogin = (loginData, userData) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${loginData.accessToken}`;
    localStorage.setItem('authToken', loginData.accessToken);
    localStorage.setItem('refreshToken', loginData.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(loginData.accessToken);
    setUser(userData);

    if (userData.role === 'ADMIN') {
      setIsAdminView(true);
      localStorage.setItem('adminView', 'true');
    }
  };

  const login = async (email, password) => {
    try {
      const data = await loginApi({ email, password });
      const newToken = data.accessToken;
      const decodedToken = jwtDecode(newToken);
      const userEmail = decodedToken.sub;
      const userData = await profileApi(userEmail, newToken);

      const statusCheck = handleUserStatusCheck(userData);
      if (!statusCheck.success) return statusCheck;

      processSuccessfulLogin(data, userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || i18n.t('auth.loginFailed');
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      await registerApi(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.message || i18n.t('auth.registerFailed');
      return { success: false, message };
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const toggleAdminView = () => {
    if (user?.role === 'ADMIN') {
      const newAdminView = !isAdminView;
      setIsAdminView(newAdminView);
      localStorage.setItem('adminView', newAdminView);
    }
  };

  return (
    <AuthContext.Provider value={{ user, updateUser, login, logout, register, isAuthenticated: !!token, isAdminView, toggleAdminView, loading: loading }}>
      {children}
    </AuthContext.Provider>
  );
}
