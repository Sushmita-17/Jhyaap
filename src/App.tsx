import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AgeConsentGate from './components/AgeConsentGate';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import ReviewsPage from './pages/ReviewsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminGuard from './components/admin/AdminGuard';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminProfessionalsPage from './pages/admin/AdminProfessionalsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminTrendingPage from './pages/admin/AdminTrendingPage';
import AdminFlashSalePage from './pages/admin/AdminFlashSalePage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import { useAppStore } from './store/appStore';
import { isAdminPath, ADMIN_LOGIN_PATH, ADMIN_BASE_PATH } from './lib/adminRoutes';
import AiChatbot from './components/AiChatbot';
import BottomNav from './components/BottomNav';
import { useGlobalRiderTracking } from './hooks/useGlobalRiderTracking';

function GlobalRiderTrackingBridge() {
  useGlobalRiderTracking();
  return null;
}

function StoreNavigationBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPage, selectedProductId } = useAppStore();

  useEffect(() => {
    if (isAdminPath(location.pathname)) return;

    const routes = {
      home: '/',
      products: '/products',
      product: selectedProductId ? `/products/${selectedProductId}` : '/products',
      cart: '/cart',
      checkout: '/checkout',
      'order-tracking': '/order-tracking',
      profile: '/profile',
      login: '/login',
      search: '/products',
      categories: '/products',
      orders: '/profile',
      about: '/about',
      faqs: '/faqs',
      contact: '/contact',
      reviews: '/reviews',
    };

    const nextPath = routes[currentPage];
    if (location.pathname !== nextPath) {
      navigate(nextPath);
    }
  }, [currentPage, location.pathname, navigate, selectedProductId]);

  return null;
}

function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <AiChatbot />
      <BottomNav />
      <main className="flex-1 w-full pb-[80px] md:pb-0">{children}</main>
      <Footer />
    </>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = isAdminPath(location.pathname);

  return (
    <div className="min-h-screen bg-night-950">
      <GlobalRiderTrackingBridge />
      {!isAdminRoute && <AgeConsentGate />}
      <StoreNavigationBridge />

      <Routes>
        <Route path={ADMIN_LOGIN_PATH} element={<AdminLoginPage />} />
        <Route path={ADMIN_BASE_PATH} element={<AdminGuard />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="trending" element={<AdminTrendingPage />} />
          <Route path="flash-sale" element={<AdminFlashSalePage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="delivery" element={<AdminDeliveryPage />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="professionals" element={<AdminProfessionalsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route
          path="/*"
          element={
            <StoreShell>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-tracking" element={<OrderTrackingPage />} />
                <Route path="/profile" element={<CustomerDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faqs" element={<FaqPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
              </Routes>
            </StoreShell>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
