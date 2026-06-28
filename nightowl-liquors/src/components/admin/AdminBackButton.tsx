import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ADMIN_BASE_PATH } from '@/lib/adminRoutes';

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
  return (
    <Link
      to={to}
      className={`mb-4 inline-flex items-center gap-2 text-sm text-night-400 transition-colors hover:text-neon-amber ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
