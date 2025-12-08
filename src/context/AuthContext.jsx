import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "../i18n";
import { loginApi, registerApi, profileApi } from "../api/authApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(() => {
    return localStorage.getItem('adminView') === 'true';
  });

  const logout = useCallback(() => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user');
    localStorage.removeItem('adminView');
    setUser(null);
    setIsAdminView(false);
    if (window.location.pathname !== '/login') navigate('/login', { replace: true });
  }, [navigate]);

  // Effect: Khôi phục phiên đăng nhập khi tải lại trang
  useEffect(() => {
    const checkUserStatus = async () => {
      // Chỉ kiểm tra nếu có email trong localStorage
      if (localStorage.getItem('userEmail')) {
          try {
              const userProfile = await profileApi();
              if (userProfile) {
                  setUser(userProfile);
              } else {
                  logout(); // User không tồn tại trong DB giả, dọn dẹp
              }
          } catch (error) {
              console.error("Failed to restore session:", error);
              logout(); // Lỗi khi fetch profile, dọn dẹp
          }
        }
      setLoading(false);
    };
    checkUserStatus();
  }, [logout]); // Chỉ phụ thuộc vào logout để tránh chạy lại không cần thiết

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

  const login = async (email, password) => {
    try {
      // loginApi giờ trả về trực tiếp thông tin người dùng
      const userProfile = await loginApi({ email, password });

      const statusCheck = handleUserStatusCheck(userProfile);
      if (!statusCheck.success) return statusCheck;

      // Lưu thông tin vào state và localStorage
      setUser(userProfile);
      localStorage.setItem('userEmail', userProfile.email);
      localStorage.setItem('user', JSON.stringify(userProfile));

      if (userProfile.role === 'ADMIN') {
        setIsAdminView(true);
        localStorage.setItem('adminView', 'true');
      }
      return { success: true, user: userProfile };
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
    <AuthContext.Provider value={{ user, updateUser, login, logout, register, isAuthenticated: !!user, isAdminView, toggleAdminView, loading: loading }}>
      {children}
    </AuthContext.Provider>
  );
}
