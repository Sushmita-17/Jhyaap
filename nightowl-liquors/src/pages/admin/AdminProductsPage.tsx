import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminPath } from '@/lib/adminRoutes';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import AdminBackButton from '@/components/admin/AdminBackButton';

export default function AdminProductsPage() {
  const products = useCatalogStore((s) => s.products);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const categories = useCatalogStore((s) => s.getCategories());
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <AdminBackButton />
      <div className="panel flex flex-wrap items-center justify-between gap-6 border-neon-amber/30 bg-gradient-to-r from-neon-amber/15 via-neon-amber/5 to-transparent p-6 shadow-xl shadow-neon-amber/10 animate-gradient-x bg-[length:200%_200%]">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-night-300">{products.length} items in catalog</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-night-400">Categories</p>
            <p className="text-lg font-bold text-white">{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative min-w-[250px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-night-500" />
          <input
            className="input-field w-full pl-12 bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
            placeholder="Search name, brand, ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input-field bg-night-800/50 border-white/10 focus:border-neon-amber/50 focus:ring-neon-amber/20"
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

      <div className="panel overflow-hidden bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 hover:border-neon-amber/30 transition-all duration-300 hover:shadow-xl hover:shadow-neon-amber/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-night-950/60 text-xs uppercase tracking-wider text-night-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.slice(0, 100).map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover bg-night-800 shadow-lg group-hover:scale-110 transition-transform duration-200"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white group-hover:text-neon-amber transition-colors">{product.name}</p>
                        <p className="text-xs text-night-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-night-300 font-medium group-hover:text-white transition-colors">{product.category}</td>
                  <td className="px-6 py-4 text-white font-bold group-hover:text-neon-amber transition-colors">Rs {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        product.inStock
                          ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                          : 'bg-neon-rose/15 text-neon-rose border border-neon-rose/20'
                      }`}
                    >
                      {product.inStock ? 'In stock' : 'Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={adminPath(`products/${product.id}/edit`)}
                        className="rounded-xl p-2.5 text-night-400 hover:bg-white/5 hover:text-neon-amber transition-all hover:scale-110"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="rounded-xl p-2.5 text-night-400 hover:bg-neon-rose/10 hover:text-neon-rose transition-all hover:scale-110"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <p className="border-t border-white/10 px-6 py-4 text-center text-sm text-night-500">
            Showing first 100 of {filtered.length} — use search to narrow down
          </p>
        )}
        {filtered.length === 0 && (
          <p className="px-6 py-16 text-center text-night-500">No products match your filters</p>
        )}
      </div>
    </div>
  );
}
