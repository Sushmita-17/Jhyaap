export default function ProductCardSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/[0.08] rounded-[14px] overflow-hidden flex flex-col h-full w-full box-border select-none">
      {/* Image skeleton */}
      <div className="relative flex-shrink-0 h-[130px] sm:h-[110px] lg:h-[180px] flex items-center justify-center bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-t-[14px]">
        <div className="h-[85%] w-[85%] bg-white/5 rounded-lg animate-pulse" />
      </div>

      {/* Info skeleton */}
      <div className="flex flex-col flex-1 px-2.5 pt-2 pb-2.5 gap-1 sm:px-3 sm:pt-2.5 sm:pb-3 lg:px-4 lg:pt-3 lg:pb-4">
        <div className="h-2 w-12 bg-white/10 rounded animate-pulse" />
        <div className="h-2.5 w-full bg-white/10 rounded animate-pulse mt-1" />
        <div className="h-2.5 w-3/4 bg-white/10 rounded animate-pulse mt-1" />

        {/* Price skeleton */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Button skeleton */}
        <div className="mt-1 h-8 w-full bg-white/10 rounded-[8px] animate-pulse sm:mt-2 lg:mt-3 lg:h-10" />
      </div>
    </div>
  );
}

