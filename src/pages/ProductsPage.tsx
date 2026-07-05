import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';
import ProductCard from '@/components/ProductCard';
import PageBackButton from '@/components/PageBackButton';

export default function ProductsPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.getCategories());
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    onlyDeals,
    setOnlyDeals,
  } = useAppStore();
  const [sortBy, setSortBy] = useState('featured');
  // Navbar routes curated mode.
  // Deals should show the same Ã¢â‚¬Å“TonightÃ¢â‚¬â„¢s price dropsÃ¢â‚¬Â list as Home (not just any deal subset).
  const [curatedMode, setCuratedMode] = useState<null | 'trending' | 'new_arrivals'>(() => {
    try {
      const v = localStorage.getItem('nightowl_curated_mode');
      if (v === 'trending' || v === 'new_arrivals') return v;
      return null;
    } catch {
      return null;
    }
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand));
    return Array.from(brands).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (curatedMode === 'trending') {
      filtered = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
    }

    if (curatedMode === 'new_arrivals') {
      filtered = [...products].slice(-4).reverse();
    }

    if (onlyDeals) {
      const viewModeDeals = (() => {
        try {
          return localStorage.getItem('nightowl_deals_view_mode');
        } catch {
          return null;
        }
      })();

      // Default behavior (preview): match HomePage Ã¢â‚¬Å“Tonight's price dropsÃ¢â‚¬Â (8 items).
      // If user clicked Ã¢â‚¬Å“View all dealsÃ¢â‚¬Â, show full deals list.
      filtered = filtered.filter((p) => p.originalPrice && p.originalPrice > p.price);
      if (viewModeDeals !== 'full') {
        filtered = filtered.slice(0, 8);
      }
    }


    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        [p.name, p.brand, p.category, p.subcategory, p.description, ...p.tags]
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered = [...filtered].sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [products, selectedCategory, selectedBrands, priceRange, searchQuery, sortBy, onlyDeals]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (onlyDeals ? 1 : 0) +
    selectedBrands.length +
    (priceRange[0] > 0 || priceRange[1] < 30000 ? 1 : 0) +
    (curatedMode ? 1 : 0);

  return (
    <div className={`mx-auto max-w-7xl px-3 md:px-4 py-4 md:py-6 pb-10 md:pb-12 ${
      isLight ? 'text-gray-900 bg-gray-50' : 'text-night-100 bg-[#0A0A0A]'
    }`}>
      <PageBackButton to="home" label="Back to Jhyaap Station" className="mb-3" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div>
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Store catalog</p>
          <h1 className={`mt-0.5 md:mt-1 text-lg md:text-2xl font-bold sm:text-3xl ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {curatedMode === 'trending'
              ? 'Trending Products'
              : curatedMode === 'new_arrivals'
              ? 'New Arrivals'
              : onlyDeals
              ? 'Deals & price drops'
              : selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name || 'Products'
              : searchQuery
              ? `"${searchQuery}"`
              : 'All bottles'}
          </h1>
          <p className={`mt-0.5 md:mt-1 text-xs md:text-sm ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-1.5 md:py-2 text-xs md:text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviewed</option>
          </select>

          {/* View toggle */}
          <div className={`flex rounded-lg border p-0.5 md:p-1 ${
            isLight 
              ? 'bg-gray-100 border-gray-200' 
              : 'bg-[#0D0908] border-white/10'
          }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 md:p-2 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-[#C9A84C] text-black' : isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#888888] hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3 h-3 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 md:p-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-[#C9A84C] text-black' : isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#888888] hover:text-white'
              }`}
            >
              <List className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border ${
              showFilters || activeFiltersCount > 0
                ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/40'
                : isLight 
                  ? 'bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900' 
                  : 'bg-[#0D0908] text-[#DDDDDD] border-white/10 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 md:w-4 md:h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-[#C9A84C] text-[10px] md:text-xs font-bold text-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={`mb-3 md:mb-4 rounded-lg border p-2 md:p-3 ${
        isLight 
          ? 'bg-gray-100 border-gray-200' 
          : 'bg-[#0D0908]/70 border-white/10'
      }`}>
        <div className="relative">
          <Search className={`absolute left-3 md:left-4 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-[#888888]'}`} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Brand, bottle, categoryÃ¢â‚¬Â¦"
            className="input-field w-full pl-10 md:pl-12 text-xs md:text-sm"
          />
        </div>
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
          {curatedMode && (
            <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] md:text-xs rounded-full border border-[#C9A84C]/30">
              {curatedMode === 'trending' ? 'Trending' : 'New Arrivals'}
              <button
                onClick={() => {
                  setCuratedMode(null);
                  try {
                    localStorage.removeItem('nightowl_curated_mode');
                  } catch {
                    // ignore
                  }
                }}
                className="hover:text-white"
              >
                <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </button>
            </span>
          )}
          {!curatedMode && onlyDeals && (
            <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] md:text-xs rounded-full border border-[#C9A84C]/30">
              Deals Only
              <button onClick={() => setOnlyDeals(false)} className="hover:text-white">
                <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] md:text-xs rounded-full border border-[#C9A84C]/30">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery('')} className="hover:text-white">
                <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] md:text-xs rounded-full border border-[#C9A84C]/30">
              {categories.find((c) => c.id === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory(null)} className="hover:text-white">
                <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </button>
            </span>
          )}
          {selectedBrands.map((brand) => (
            <span
              key={brand}
              className={`inline-flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full border ${
                isLight 
                  ? 'bg-gray-200 text-gray-700 border-gray-300' 
                  : 'bg-[#1A1A1A] text-[#DDDDDD] border-white/10'
              }`}
            >
              {brand}
              <button onClick={() => toggleBrand(brand)} className="hover:text-gray-900">
                <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setSelectedBrands([]);
              setPriceRange([0, 30000]);
              setOnlyDeals(false);
            }}
            className="text-[10px] md:text-xs text-[#C9A84C] hover:text-white transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-4 md:gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className={`hidden w-64 flex-shrink-0 self-start space-y-6 rounded-lg border p-4 lg:block ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-night-900/70 border-white/10'
          }`}>
            {/* Category filter */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Categories</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    !selectedCategory
                      ? 'bg-neon-amber/10 text-neon-amber border border-neon-amber/30'
                      : isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-night-300 hover:bg-night-800 hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-neon-amber/10 text-neon-amber border border-neon-amber/30'
                        : isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-night-300 hover:bg-night-800 hover:text-white'
                    }`}
                  >
                    {cat.name}
                    <span className={`float-right text-xs ${isLight ? 'text-gray-400' : 'text-night-500'}`}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Brands</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {allBrands.map((brand) => (
                  <label
                    key={brand}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      isLight ? 'hover:bg-gray-100' : 'hover:bg-night-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className={`h-4 w-4 rounded ${isLight ? 'border-gray-300 bg-gray-50' : 'border-night-600 bg-night-800'} text-neon-amber focus:ring-neon-amber/30`}
                    />
                    <span className={`text-sm ${isLight ? 'text-gray-700' : 'text-night-300'}`}>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Price Range</h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="30000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-neon-amber"
                />
                <div className={`flex justify-between text-xs mt-2 ${isLight ? 'text-gray-500' : 'text-night-400'}`}>
                  <span>Rs 0</span>
                  <span>Rs {priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <p className={`text-sm md:text-lg ${isLight ? 'text-gray-700' : 'text-[#DDDDDD]'}`}>No products found</p>
              <p className={`text-xs md:text-sm mt-2 ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              {/* Desktop: horizontal scroll with arrows */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => {
                    const el = document.getElementById('products-scroll');
                    if (el) el.scrollBy({ left: -240, behavior: 'smooth' });
                  }}
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 ${
                    isLight 
                      ? 'bg-white border-gray-300' 
                      : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                  }`}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('products-scroll');
                    if (el) el.scrollBy({ left: 240, behavior: 'smooth' });
                  }}
                  className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border rounded-full flex items-center justify-center text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black transition-all shadow-lg shadow-[#C9A84C]/10 ${
                    isLight 
                      ? 'bg-white border-gray-300' 
                      : 'bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#C9A84C]/30'
                  }`}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={22} />
                </button>
                <div
                  id="products-scroll"
                  className="flex gap-[16px] overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 scroll-smooth"
                  style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                >
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex-[0_0_220px] min-w-[220px] snap-start box-border">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile: 2-column grid */}
              <div className="md:hidden">
                <div className="grid grid-cols-2 gap-[10px]">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="min-w-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
