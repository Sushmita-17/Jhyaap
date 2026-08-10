import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export default function PageBackButton({
  to = 'home',
  label = 'Back',
  className = '',
}) {
  const { setPage } = useAppStore();

  return (
    <button
      type="button"
      onClick={() => setPage(to)}
      className={`inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#888888] transition-colors hover:text-[#C9A84C] ${className}`}
    >
      <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
      {label}
    </button>
  );
}

