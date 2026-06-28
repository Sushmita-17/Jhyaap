import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { CATEGORY_META, slugify } from '@/lib/catalogUtils';
import AdminBackButton from '@/components/admin/AdminBackButton';

const ICON_OPTIONS = ['Beer', 'Wine', 'Droplets', 'Flame', 'Leaf', 'Sun', 'Sparkles', 'Package', 'BadgePercent'];

export default function AdminCategoriesPage() {
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
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminBackButton />
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Categories</h1>
        <p className="mt-1 text-sm text-night-400">Add custom categories for new product types</p>
      </div>

      <form onSubmit={handleAdd} className="panel space-y-4 p-5">
        <h2 className="font-semibold text-white">Add category</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-night-400">Name *</label>
            <input
              className="input-field w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Energy Drinks"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-night-400">ID (slug)</label>
            <input
              className="input-field w-full"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="auto from name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-night-400">Icon</label>
            <select className="input-field w-full" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICON_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-night-400">Color</label>
            <input
              type="color"
              className="h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-night-900"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </form>

      <div className="panel overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-white">All categories ({builtCategories.length})</h2>
        </div>
        <ul className="divide-y divide-white/5">
          {builtCategories.map((cat) => {
            const isCustom = customCategories.some((c) => c.id === cat.id);
            const isBuiltIn = Boolean(CATEGORY_META[cat.id]);
            return (
              <li key={cat.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <p className="font-medium text-white">{cat.name}</p>
                    <p className="text-xs text-night-500">
                      {cat.id} · {cat.count} products
                      {isBuiltIn && ' · built-in'}
                      {isCustom && ' · custom'}
                    </p>
                  </div>
                </div>
                {isCustom && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg p-2 text-night-500 hover:bg-neon-rose/10 hover:text-neon-rose"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="panel border-neon-rose/20 p-5">
        <h2 className="font-semibold text-neon-rose">Danger zone</h2>
        <p className="mt-1 text-sm text-night-400">
          Reset catalog to original Cheers import. Custom products and categories will be lost.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset entire catalog to defaults?')) resetCatalog();
          }}
          className="mt-4 rounded-lg border border-neon-rose/40 px-4 py-2 text-sm text-neon-rose hover:bg-neon-rose/10"
        >
          Reset catalog
        </button>
      </div>
    </div>
  );
}
