// Type imports removed - these are JSDoc type definitions only, not actual exports
import ProductCard from './ProductCard';

export default function MobileTwoProductView({ 
  products, 
  title = 'Featured Pair',
  subtitle = 'Perfect combination for you'
}) {
  return (
    <div className="w-full bg-[#16110F] border border-white/5 rounded-[16px] p-4 shadow-lg">
      {/* Header */}
      <div className="mb-4">
        <span className="text-[#C9A84C] text-[8px] font-bold uppercase tracking-[2px] block">
          {subtitle}
        </span>
        <h2 className="text-[14px] font-bold text-white mt-1">
          {title}
        </h2>
      </div>

      {/* Two Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <div key={product.id} className="min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

