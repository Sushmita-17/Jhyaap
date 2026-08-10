import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, authActions } from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Earnings from './pages/Earnings'
import Wallet from './pages/Wallet'
import Performance from './pages/Performance'
import Notifications from './pages/Notifications'
import Support from './pages/Support'
import Settings from './pages/Settings'
import ReferEarn from './pages/ReferEarn'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import Profile from './pages/Profile'
import PublicNotifications from './pages/PublicNotifications'
import { ThemeProvider } from './store/themeStore.jsx'

function PrivateRoute({ children }) {
  const { rider, loading } = useAuthStore()
  if (loading) return <p className="p-6 text-gray-400 text-sm">Loading...</p>
  return rider ? children : <Navigate to="/login" />
}

/**
 * AppLayout wraps authenticated pages with the desktop sidebar (>=1024px)
 * and the mobile bottom navigation (<1024px). All pages share the same
 * features on both breakpoints — only the navigation arrangement differs.
 */
function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const initAuth = authActions.initAuth

  useEffect(() => {
    initAuth()
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route - live notifications without login */}
          <Route path="/" element={<PublicNotifications />} />
          <Route path="/notifications" element={<PublicNotifications />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout><Dashboard /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <AppLayout><Orders /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/order/:id"
            element={
              <PrivateRoute>
                <AppLayout><OrderDetail /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/earnings"
            element={
              <PrivateRoute>
                <AppLayout><Earnings /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <PrivateRoute>
                <AppLayout><Wallet /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <PrivateRoute>
                <AppLayout><Performance /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <AppLayout><Profile /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications-page"
            element={
              <PrivateRoute>
                <AppLayout><Notifications /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/support"
            element={
              <PrivateRoute>
                <AppLayout><Support /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <AppLayout><Settings /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/refer"
            element={
              <PrivateRoute>
                <AppLayout><ReferEarn /></AppLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
