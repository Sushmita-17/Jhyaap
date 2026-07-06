import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { CATEGORY_META, slugify } from '@/lib/catalogUtils';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

const ICON_OPTIONS = ['Beer', 'Wine', 'Droplets', 'Flame', 'Leaf', 'Sun', 'Sparkles', 'Package', 'BadgePercent'];

export default function AdminCategoriesPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const customCategories = useCatalogStore((s) => s.customCategories);
  const builtCategories = useCatalogStore((s) => s.getCategories());
  const addCategory = useCatalogStore((s) => s.addCategory);
  const deleteCategory = useCatalogStore((s) => s.deleteCategory);
  const resetCatalog = useCatalogStore((s) => s.resetCatalog);

  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [icon, setIcon] = useState('Package');
  const [color, setColor] = useState('#64748b');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const catId = id.trim() || slugify(name);
    if (!catId || !name.trim()) return;
    addCategory({ id: catId, name: name.trim(), icon, color });
    setName('');
    setId('');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <AdminBackButton />
      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-6 shadow-2xl shadow-[#C9A84C]/20 animate-gradient-x bg-[length:200%_200%] backdrop-blur-xl relative overflow-hidden ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="relative">
          <h1 className={`font-display text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>Categories</h1>
          <p className={`mt-1 text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Add custom categories for new product types</p>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="text-right">
            <p className={`text-xs uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Total</p>
            <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{builtCategories.length}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleAdd} className={`panel space-y-4 p-5 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <h2 className={`relative font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Add category</h2>
        <div className="relative grid gap-4 sm:grid-cols-2">
          <div>
            <label className={`mb-1.5 block text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Name *</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Energy Drinks"
              required
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>ID (slug)</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="auto from name"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Icon</label>
            <select className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`} value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICON_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`mb-1.5 block text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Color</label>
            <input
              type="color"
              className={`h-11 w-full cursor-pointer rounded-lg border backdrop-blur-sm hover:border-[#C9A84C]/50 focus:border-[#C9A84C]/50 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300' 
                  : 'bg-[#1A1A1A]/80 border-white/10'
              }`}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="relative btn-primary inline-flex items-center gap-2 text-sm hover:scale-105 hover:shadow-xl hover:shadow-[#C9A84C]/30 transition-all duration-300">
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </form>

      <div className={`panel overflow-hidden backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className={`relative border-b px-5 py-4 ${
          isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-[#0A0A0A]/30'
        }`}>
          <h2 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>All categories ({builtCategories.length})</h2>
        </div>
        <ul className={`relative divide-y ${
          isLight ? 'divide-gray-200' : 'divide-white/5'
        }`}>
          {builtCategories.map((cat, index) => {
            const isCustom = customCategories.some((c) => c.id === cat.id);
            const isBuiltIn = Boolean(CATEGORY_META[cat.id]);
            return (
              <li key={cat.id} className={`flex items-center justify-between px-5 py-3 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
                isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.05]'
              }`} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full shadow-lg group-hover:scale-125 group-hover:shadow-[#C9A84C]/50 transition-all duration-300"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <p className={`font-medium group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{cat.name}</p>
                    <p className={`text-xs group-hover:text-[#666666] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                      {cat.id} · {cat.count} products
                      {isBuiltIn && ' · built-in'}
                      {isCustom && ' · custom'}
                    </p>
                  </div>
                </div>
                {isCustom && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg p-2 text-[#888888] hover:bg-red-500/10 hover:text-red-400 hover:scale-110 hover:rotate-6 transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="panel border-red-500/20 p-5 bg-gradient-to-br from-red-500/5 to-transparent backdrop-blur-xl hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <h2 className="relative font-semibold text-red-400 animate-pulse-slow">Danger zone</h2>
        <p className="relative mt-1 text-sm text-[#888888]">
          Reset catalog to original Cheers import. Custom products and categories will be lost.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset entire catalog to defaults?')) resetCatalog();
          }}
          className="relative mt-4 rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300"
        >
          Reset catalog
        </button>
      </div>
    </div>
  );
}
