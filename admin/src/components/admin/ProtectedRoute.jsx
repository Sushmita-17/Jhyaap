import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_LOGIN_PATH } from '@/lib/adminRoutes';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A84C]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  return children ? children : <Outlet />;
}
