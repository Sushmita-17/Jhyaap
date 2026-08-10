import { STORE_INFO } from '@/lib/storeInfo';

const sizeMap = {
  sm: { box: 'h-8 w-8', src: '/logo.png', px: 32 },
  md: { box: 'h-[48px] w-[48px]', src: '/logo.png', px: 48 },
  lg: { box: 'h-[72px] w-[72px]', src: '/logo.png', px: 72 },
  xl: { box: 'h-[96px] w-[96px]', src: '/logo.png', px: 96 },
  custom: { box: '', src: '/logo.png', px: 512 },
};

export default function BrandLogo({ size = 'md', className = '' }) {
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

