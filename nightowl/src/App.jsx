import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import { useAppStore } from './store/appStore';
import AiChatbot from './components/AiChatbot';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import BottomNav from './components/BottomNav';
import { useGlobalRiderTracking } from './hooks/useGlobalRiderTracking';
import { useThemeStore } from './store/themeStore';

function GlobalRiderTrackingBridge() {
  useGlobalRiderTracking();
  return null;
}

function StoreNavigationBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPage, selectedProductId } = useAppStore();

  useEffect(() => {
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

function StoreShell({ children }) {
  return (
    <>
      <Navbar />
      <AiChatbot />
      <PWAInstallPrompt />
      <BottomNav />
      <main className="flex-1 w-full pb-[80px] md:pb-0">{children}</main>
    </>
  );
}

import { useCatalogStore } from './store/catalogStore';

function App() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const fetchProducts = useCatalogStore((s) => s.fetchProducts);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <AuthProvider>
      <div className={`min-h-screen ${isLight ? 'bg-gray-50' : 'bg-night-950'}`}>
        <GlobalRiderTrackingBridge />
        <AgeConsentGate />
        <StoreNavigationBridge />


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
      </div>
    </AuthProvider>
  );
}

export default App;


