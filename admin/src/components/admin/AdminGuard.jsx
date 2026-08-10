import { Navigate, Outlet } from 'react-router-dom';
import { useAdminStore } from '@/store/adminStore';
import { ADMIN_LOGIN_PATH } from '@/lib/adminRoutes';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminGuard() {
  const isAdmin = useAdminStore((s) => s.isAdmin);

  if (!isAdmin) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

