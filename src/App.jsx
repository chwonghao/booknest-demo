import React, { Suspense, useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import { CssBaseline, GlobalStyles, Box, LinearProgress } from '@mui/material';

import { CartProvider } from "./context/CartContext";
import { AuthContext } from "./context/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AnimatedPage from "./components/common/AnimatedPage"; // Wrapper cho hiệu ứng trang

// Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const ProductsListPage = React.lazy(() => import('./pages/ProductsListPage.jsx'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage.jsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.jsx'));

// Admin Pages
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const ProductManagementPage = React.lazy(() => import('./pages/admin/ProductManagementPage'));
const OrderManagementPage = React.lazy(() => import('./pages/admin/OrderManagementPage'));
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
 
const AdminRoutesWrapper = () => {
  const { isAdminView } = useContext(AuthContext);
  return isAdminView ? <AdminLayout /> : <Navigate to="/" replace />;
};

const IndexPage = () => {
  const { isAdminView } = useContext(AuthContext);
  return isAdminView ? <Navigate to="/admin/dashboard" replace /> : <HomePage />;
};

const AppRoutes = () => {
  const { loading } = useContext(AuthContext);
  const location = useLocation();

  return (
    <>
      {loading && <LinearProgress sx={{ position: 'fixed', top: { xs: 60, sm: 64 }, width: '100vw', zIndex: (theme) => theme.zIndex.drawer + 2 }} />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route index element={<Suspense fallback={null}><AnimatedPage><IndexPage /></AnimatedPage></Suspense>} />
            <Route path="/products/:id" element={<Suspense fallback={null}><AnimatedPage><ProductPage /></AnimatedPage></Suspense>} />
            <Route path="/products" element={<Suspense fallback={null}><AnimatedPage><ProductsListPage /></AnimatedPage></Suspense>} />
            <Route path="/login" element={<Suspense fallback={null}><AnimatedPage><LoginPage /></AnimatedPage></Suspense>} />
            <Route path="/register" element={<Suspense fallback={null}><AnimatedPage><RegisterPage /></AnimatedPage></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={null}><AnimatedPage><ForgotPasswordPage /></AnimatedPage></Suspense>} />
            <Route path="/cart" element={<Suspense fallback={null}><AnimatedPage><CartPage /></AnimatedPage></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={null}><AnimatedPage><ProtectedRoute><ProfilePage /></ProtectedRoute></AnimatedPage></Suspense>} />
            <Route path="/checkout" element={<Suspense fallback={null}><AnimatedPage><ProtectedRoute><CheckoutPage /></ProtectedRoute></AnimatedPage></Suspense>} />
            <Route path="*" element={<Suspense fallback={null}><AnimatedPage><NotFoundPage /></AnimatedPage></Suspense>} />
          </Route>

          {/* Admin Layout Routes */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminRoutesWrapper /></ProtectedRoute>}>
            <Route path="dashboard" element={<Suspense fallback={null}><AnimatedPage><DashboardPage /></AnimatedPage></Suspense>} />
            <Route path="products" element={<Suspense fallback={null}><AnimatedPage><ProductManagementPage /></AnimatedPage></Suspense>} />
            <Route path="orders" element={<Suspense fallback={null}><AnimatedPage><OrderManagementPage /></AnimatedPage></Suspense>} />
            <Route path="users" element={<Suspense fallback={null}><AnimatedPage><UserManagementPage /></AnimatedPage></Suspense>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <>
      <CssBaseline />
       {/* Fix lỗi layout shift (giật trang) khi mở menu/dialog */}
      <GlobalStyles styles={{ 
        body: { overflowY: 'scroll' },
        // Fix lỗi label của TextField không di chuyển khi trình duyệt tự động điền
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
          transition: 'background-color 5000s ease-in-out 0s',
          WebkitTextFillColor: 'inherit !important',
        },
        // Buộc label phải "shrink" khi input được tự động điền
        // Áp dụng cho cả Outlined và Filled/Standard variants
        '.MuiTextField-root .MuiInputLabel-root.Mui-focused, .MuiTextField-root .MuiInputLabel-root[data-shrink="true"], .MuiTextField-root:has(input:-webkit-autofill) .MuiInputLabel-root': {
          transform: 'translate(14px, -9px) scale(0.75) !important',
        },
        // Đảm bảo màu sắc của label cũng đúng khi shrink do autofill
        '.MuiTextField-root:has(input:-webkit-autofill) .MuiInputLabel-root': {
          color: (theme) => theme.palette.primary.main,
        }
      }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </Box>
    </>
  );
}