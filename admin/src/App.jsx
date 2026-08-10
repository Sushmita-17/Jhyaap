import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AdminLogin from './components/admin/AdminLogin';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminProfessionalsPage from './pages/admin/AdminProfessionalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminTrendingPage from './pages/admin/AdminTrendingPage';
import AdminFlashSalePage from './pages/admin/AdminFlashSalePage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import AdminRidersPage from './pages/admin/AdminRidersPage';

import { ADMIN_LOGIN_PATH, ADMIN_BASE_PATH } from './lib/adminRoutes';

import { useThemeStore } from './store/themeStore';
import { useCatalogStore } from './store/catalogStore';

function App() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  useEffect(() => {
    useCatalogStore.getState().fetchProducts();
  }, []);


  return (
    <AuthProvider>
      <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-night-950'}`}>
        <Routes>
          <Route path="/" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
          
          <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />
          <Route path={ADMIN_BASE_PATH} element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="trending" element={<AdminTrendingPage />} />
              <Route path="flash-sale" element={<AdminFlashSalePage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="delivery" element={<AdminDeliveryPage />} />
              <Route path="riders" element={<AdminRidersPage />} />
              <Route path="revenue" element={<AdminRevenuePage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="professionals" element={<AdminProfessionalsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="reports" element={<AdminRevenuePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;


