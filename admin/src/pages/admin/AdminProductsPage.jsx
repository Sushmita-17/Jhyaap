import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminPath } from '@/lib/adminRoutes';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

export default function AdminProductsPage() {
  const products = useCatalogStore((s) => s.products);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const categories = useCatalogStore((s) => s.getCategories());
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const filtered = useMemo(() => {
    let list = products;
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, query, categoryFilter]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-8 animate-fade-in">
      <AdminBackButton />
      <div className="panel flex flex-wrap items-center justify-between gap-4 md:gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-4 md:p-6 shadow-2xl shadow-[#C9A84C]/20 animate-gradient-x bg-[length:200%_200%] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="relative">
          <h1 className={`font-display text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>Products</h1>
          <p className={`mt-1 md:mt-2 text-[10px] md:text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>{products.length} items in catalog</p>
        </div>
        <div className="relative flex items-center gap-2 md:gap-4">
          <div className="text-right">
            <p className={`text-[10px] md:text-xs uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Categories</p>
            <p className={`text-sm md:text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{categories.length}</p>
          </div>
          <Link
            to={adminPath('products/new')}
            className="btn-primary flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm hover:scale-105 hover:shadow-xl hover:shadow-[#C9A84C]/30 transition-all duration-300"
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 md:gap-4">
        <div className="relative min-w-[200px] md:min-w-[250px] flex-1">
          <Search className={`absolute left-3 md:left-4 top-1/2 h-3.5 w-3.5 md:h-4 md:w-4 -translate-y-1/2 animate-pulse-slow ${
            isLight ? 'text-gray-400' : 'text-[#888888]'
          }`} />
          <input
            className={`input-field w-full pl-10 md:pl-12 backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 text-sm ${
              isLight 
                ? 'bg-gray-100 border-gray-300' 
                : 'bg-[#1A1A1A]/80 border-white/10'
            }`}
            placeholder="Search name, brand, ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className={`input-field backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 text-sm ${
            isLight 
              ? 'bg-gray-100 border-gray-300' 
              : 'bg-[#1A1A1A]/80 border-white/10'
          }`}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      <div className={`panel overflow-hidden backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-[10px] md:text-sm">
            <thead className={`text-[10px] md:text-xs uppercase tracking-wider ${
              isLight ? 'bg-gray-100 text-gray-600' : 'bg-[#0A0A0A]/60 text-[#888888]'
            }`}>
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-4 font-semibold">Product</th>
                <th className="px-3 md:px-6 py-2 md:py-4 font-semibold">Category</th>
                <th className="px-3 md:px-6 py-2 md:py-4 font-semibold">Price</th>
                <th className="px-3 md:px-6 py-2 md:py-4 font-semibold">Stock</th>
                <th className="px-3 md:px-6 py-2 md:py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-gray-200' : 'divide-white/5'}`}>
              {filtered.slice(0, 100).map((product, index) => (
                <tr key={product.id} className={`hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
                  isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.05]'
                }`} style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <div className="flex items-center gap-2 md:gap-4">
                      <img
                        src={product.image}
                        alt=""
                        className={`h-8 w-8 md:h-12 md:w-12 rounded-xl object-cover shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
                          isLight ? 'bg-gray-200' : 'bg-[#1A1A1A]'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className={`truncate text-[10px] md:text-sm font-semibold group-hover:text-[#C9A84C] transition-colors ${
                          isLight ? 'text-gray-900' : 'text-white'
                        }`}>{product.name}</p>
                        <p className={`text-[10px] md:text-xs group-hover:text-[#666666] transition-colors ${
                          isLight ? 'text-gray-500' : 'text-[#888888]'
                        }`}>{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-3 md:px-6 py-2 md:py-4 capitalize text-[10px] md:text-sm font-medium group-hover:text-white transition-colors ${
                    isLight ? 'text-gray-600' : 'text-[#888888]'
                  }`}>{product.category}</td>
                  <td className={`px-3 md:px-6 py-2 md:py-4 text-[10px] md:text-sm font-bold group-hover:text-[#C9A84C] transition-colors ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}>Rs {product.price.toLocaleString()}</td>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold border ${
                        product.inStock
                          ? 'bg-green-500/15 text-green-400 border-green-500/20 shadow-lg shadow-green-500/10'
                          : 'bg-red-500/15 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10'
                      }`}
                    >
                      {product.inStock ? 'In stock' : 'Out'}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Link
                        to={adminPath(`products/${product.id}/edit`)}
                        className={`rounded-xl p-1.5 md:p-2.5 transition-all hover:scale-110 hover:rotate-6 hover:shadow-lg hover:shadow-[#C9A84C]/20 ${
                          isLight 
                            ? 'text-gray-500 hover:bg-gray-100 hover:text-[#C9A84C]' 
                            : 'text-[#888888] hover:bg-white/5 hover:text-[#C9A84C]'
                        }`}
                        aria-label="Edit"
                      >
                        <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="rounded-xl p-1.5 md:p-2.5 text-[#888888] hover:bg-red-500/10 hover:text-red-400 transition-all hover:scale-110 hover:rotate-6 hover:shadow-lg hover:shadow-red-500/20"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <p className="relative border-t border-white/10 px-6 py-4 text-center text-sm text-[#888888]">
            Showing first 100 of {filtered.length} - use search to narrow down
          </p>
        )}
        {filtered.length === 0 && (
          <p className="relative px-6 py-16 text-center text-[#888888]">No products match your filters</p>
        )}
      </div>
    </div>
  );
}

