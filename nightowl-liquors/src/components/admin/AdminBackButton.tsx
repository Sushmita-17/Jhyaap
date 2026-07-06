import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ADMIN_BASE_PATH } from '@/lib/adminRoutes';
import { useThemeStore } from '@/store/themeStore';

interface AdminBackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export default function AdminBackButton({
  to = ADMIN_BASE_PATH,
  label = 'Back to dashboard',
  className = '',
}: AdminBackButtonProps) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  return (
    <Link
      to={to}
      className={`mb-4 inline-flex items-center gap-2 text-sm transition-colors ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888] hover:text-[#C9A84C]'} ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
