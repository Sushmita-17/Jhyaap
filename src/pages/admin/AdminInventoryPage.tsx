import { useState, useMemo } from 'react';
import { Search, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

export default function AdminInventoryPage() {
  const products = useCatalogStore((s) => s.products);
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const filtered = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }
    if (stockFilter === 'low') {
      list = list.filter((p) => p.inStock);
    }
    if (stockFilter === 'out') {
      list = list.filter((p) => !p.inStock);
    }
    return list;
  }, [products, query, stockFilter]);

  const lowStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;
  const totalStock = products.filter((p) => p.inStock).length;

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className="panel flex flex-wrap items-center justify-between gap-4 md:gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-4 md:p-6 shadow-xl shadow-[#C9A84C]/10">
        <div>
          <h1 className={`font-display text-xl md:text-3xl font-bold tracking-tight ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>Inventory Management</h1>
          <p className={`mt-1 md:mt-2 text-[10px] md:text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Track stock levels and manage inventory</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right">
            <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Total Items</p>
            <p className={`text-sm md:text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{products.length}</p>
          </div>
          <div className="text-right">
            <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Total Stock</p>
            <p className={`text-sm md:text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalStock}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 md:gap-6 md:grid-cols-3">
        <div className={`panel rounded-2xl border p-3 md:p-6 ${
          isLight 
            ? 'border-gray-200 bg-white' 
            : 'border-white/10 bg-[#0D0D0D]/50'
        }`}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <p className={`text-[10px] md:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Out of Stock</p>
              <p className={`text-xl md:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{outOfStockCount}</p>
            </div>
          </div>
        </div>
        <div className={`panel rounded-2xl border p-3 md:p-6 ${
          isLight 
            ? 'border-gray-200 bg-white' 
            : 'border-white/10 bg-[#0D0D0D]/50'
        }`}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400">
              <TrendingDown className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <p className={`text-[10px] md:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Low Stock</p>
              <p className={`text-xl md:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className={`panel rounded-2xl border p-3 md:p-6 ${
          isLight 
            ? 'border-gray-200 bg-white' 
            : 'border-white/10 bg-[#0D0D0D]/50'
        }`}>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <p className={`text-[10px] md:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>In Stock</p>
              <p className={`text-xl md:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{products.length - outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`panel rounded-2xl border p-3 md:p-6 ${
        isLight 
          ? 'border-gray-200 bg-white' 
          : 'border-white/10 bg-[#0D0D0D]/50'
      }`}>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="relative flex-1 min-w-48 md:min-w-64">
            <Search className="absolute left-3 md:left-3 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className={`w-full rounded-lg border pl-9 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-[10px] md:text-sm outline-none focus:border-[#C9A84C]/50 ${
                isLight 
                  ? 'border-gray-300 bg-gray-50 text-gray-900' 
                  : 'border-white/10 bg-[#0A0A0A]/50 text-white'
              }`}
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className={`rounded-lg border px-3 md:px-4 py-2 md:py-2.5 text-[10px] md:text-sm outline-none focus:border-[#C9A84C]/50 ${
              isLight 
                ? 'border-gray-300 bg-gray-50 text-gray-900' 
                : 'border-white/10 bg-[#0A0A0A]/50 text-white'
            }`}
          >
            <option value="all">All Stock</option>
            <option value="low">Low Stock (&lt;10)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`panel rounded-2xl border overflow-hidden ${
        isLight 
          ? 'border-gray-200 bg-white' 
          : 'border-white/10 bg-[#0D0D0D]/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] md:text-sm">
            <thead className={`border-b text-[10px] md:text-xs font-semibold uppercase tracking-wider ${
              isLight 
                ? 'border-gray-200 bg-gray-50 text-gray-600' 
                : 'border-white/10 bg-[#0A0A0A]/50 text-gray-400'
            }`}>
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left">Product</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left">Brand</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left">Stock</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left">Price</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-gray-200' : 'divide-white/5'}`}>
              {filtered.map((product) => {
                const isOut = !product.inStock;
                
                return (
                  <tr key={product.id} className={`transition-colors ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <img src={product.image} alt={product.name} className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-cover" />
                        <div>
                          <p className={`text-[10px] md:text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{product.name}</p>
                          <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{product.volume}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{product.brand}</td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        <span className={`text-[10px] md:text-sm font-semibold ${isOut ? 'text-red-400' : isLight ? 'text-gray-900' : 'text-white'}`}>
                          {isOut ? '0' : 'Available'}
                        </span>
                        {!product.inStock && <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-400" />}
                      </div>
                    </td>
                    <td className={`px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {product.price.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      {isOut ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-semibold text-red-400">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-semibold text-green-400">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <p className="text-sm text-gray-400">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
