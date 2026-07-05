import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Page } from '@/types';

interface PageBackButtonProps {
  to?: Page;
  label?: string;
  className?: string;
}

export default function PageBackButton({
  to = 'home',
  label = 'Back',
  className = '',
}: PageBackButtonProps) {
  const { setPage } = useAppStore();

  return (
    <button
      type="button"
      onClick={() => setPage(to)}
      className={`inline-flex items-center gap-2 text-sm text-night-400 transition-colors hover:text-neon-amber ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
