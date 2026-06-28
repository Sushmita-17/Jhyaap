import { STORE_INFO } from '@/lib/storeInfo';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
}

const sizeMap: Record<string, { box: string; src: string; px: number }> = {
  sm: { box: 'h-8 w-8', src: '/logo-256.png', px: 32 },
  md: { box: 'h-[48px] w-[48px]', src: '/logo-256.png', px: 48 },
  lg: { box: 'h-[72px] w-[72px]', src: '/logo-512.png', px: 72 },
  xl: { box: 'h-[96px] w-[96px]', src: '/logo-512.png', px: 96 },
  custom: { box: '', src: '/logo-512.png', px: 512 },
};

export default function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const config = sizeMap[size] || sizeMap.md;
  const { box, src, px } = config;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-[#F5A623]/40 p-0.5 bg-[#0A0A0A] ${box} ${className}`}
    >
      <img
        src={src}
        alt={STORE_INFO.name}
        width={px}
        height={px}
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}
