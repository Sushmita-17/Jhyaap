export default function ProductDetailSkeleton() {
  return (
    <div className="bg-[#0D0908] min-h-screen pb-20">
      {/* Navigation */}
      <div className="max-w-[1000px] mx-auto px-2 py-4">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Product Card */}
      <div className="max-w-[1000px] mx-auto px-2">
        <div className="bg-[#16110F] border border-white/5 rounded-[12px] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Section */}
            <div className="p-2 bg-[#F5F0E8]/[0.02]">
              <div className="relative aspect-[3/4] bg-[#F5F0E8] rounded-[12px] animate-pulse" />
            </div>

            {/* Content Section */}
            <div className="p-3 flex flex-col">
              <div className="flex gap-2 mb-2">
                <div className="h-4 w-16 bg-white/10 rounded-full animate-pulse" />
                <div className="h-4 w-12 bg-white/10 rounded-full animate-pulse" />
              </div>
              <div className="h-6 w-3/4 bg-white/10 rounded mb-2 animate-pulse" />
              <div className="h-4 w-full bg-white/10 rounded mb-3 animate-pulse" />
              <div className="h-4 w-2/3 bg-white/10 rounded mb-4 animate-pulse" />

              {/* Specs */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-black/20 rounded-[8px] p-1.5 animate-pulse" />
                ))}
              </div>

              {/* Price */}
              <div className="mt-auto pt-3 border-t border-white/5">
                <div className="h-8 w-32 bg-white/10 rounded mb-3 animate-pulse" />
                <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
