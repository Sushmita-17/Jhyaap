import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { useAppStore } from '@/store/appStore';
import ProductCard from '@/components/ProductCard';
import PageBackButton from '@/components/PageBackButton';

export default function ProductsPage() {
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
  // Deals should show the same “Tonight’s price drops” list as Home (not just any deal subset).
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

      // Default behavior (preview): match HomePage “Tonight's price drops” (8 items).
      // If user clicked “View all deals”, show full deals list.
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
    <div className="mx-auto max-w-7xl px-4 py-6 pb-12 text-night-100">
      <PageBackButton to="home" label="Back to home" className="mb-4" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Store catalog</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
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
          <p className="mt-1 text-sm text-night-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="reviews">Most Reviewed</option>
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-white/10 bg-night-900 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-neon-amber text-night-950' : 'text-night-300 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-neon-amber text-night-950' : 'text-night-300 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              showFilters || activeFiltersCount > 0
                ? 'bg-neon-amber/10 text-neon-amber border-neon-amber/40'
                : 'bg-night-900 text-night-200 border-night-600/50 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-amber text-xs font-bold text-night-950">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-white/10 bg-night-900/70 p-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-night-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Brand, bottle, category…"
            className="input-field w-full pl-12"
          />
        </div>
      </div>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {curatedMode && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-amber/10 text-neon-amber text-xs rounded-full border border-neon-amber/30">
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
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {!curatedMode && onlyDeals && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-amber/10 text-neon-amber text-xs rounded-full border border-neon-amber/30">
              Deals Only
              <button onClick={() => setOnlyDeals(false)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-amber/10 text-neon-amber text-xs rounded-full border border-neon-amber/30">
              Search: {searchQuery}
              <button onClick={() => setSearchQuery('')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-amber/10 text-neon-amber text-xs rounded-full border border-neon-amber/30">
              {categories.find((c) => c.id === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory(null)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBrands.map((brand) => (
            <span
              key={brand}
              className="inline-flex items-center gap-1 px-3 py-1 bg-night-800 text-night-200 text-xs rounded-full border border-night-600/50"
            >
              {brand}
              <button onClick={() => toggleBrand(brand)} className="hover:text-gray-900">
                <X className="w-3 h-3" />
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
            className="text-xs text-neon-amber hover:text-white transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="hidden w-64 flex-shrink-0 self-start space-y-6 rounded-lg border border-white/10 bg-night-900/70 p-4 lg:block">
            {/* Category filter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Categories</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    !selectedCategory
                      ? 'bg-neon-amber/10 text-neon-amber border border-neon-amber/30'
                      : 'text-night-300 hover:bg-night-800 hover:text-white'
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
                        : 'text-night-300 hover:bg-night-800 hover:text-white'
                    }`}
                  >
                    {cat.name}
                    <span className="float-right text-night-500 text-xs">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Brands</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {allBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-night-800 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 rounded border-night-600 bg-night-800 text-neon-amber focus:ring-neon-amber/30"
                    />
                    <span className="text-sm text-night-300">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
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
                <div className="flex justify-between text-xs text-night-400 mt-2">
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
            <div className="text-center py-16">
              <p className="text-night-200 text-lg">No products found</p>
              <p className="text-night-400 text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
