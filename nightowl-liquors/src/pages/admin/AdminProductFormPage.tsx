import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminPath } from '@/lib/adminRoutes';
import { ArrowLeft, Upload } from 'lucide-react';
import { Product } from '@/types';
import { useCatalogStore } from '@/store/catalogStore';
import { CATEGORY_META, slugify } from '@/lib/catalogUtils';



export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useCatalogStore((s) => s.products);
  const customCategories = useCatalogStore((s) => s.customCategories);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const builtCategories = useCatalogStore((s) => s.getCategories());

  const existing = id ? products.find((p) => p.id === id) : undefined;

  const [form, setForm] = useState<Omit<Product, 'id'>>(existing ? { ...existing, id: undefined } : {
    name: '',
    brand: '',
    category: 'beer',
    subcategory: '',
    price: 0,
    volume: '750ML',
    abv: '40%',
    image: '',
    rating: 4.5,
    reviews: 0,
    inStock: true,
    description: '',
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState(existing ? existing.tags.join(', ') : '');
  const [customCategory, setCustomCategory] = useState('');

  const categoryOptions = [
    ...Object.entries(CATEGORY_META).map(([id, m]) => ({ id, name: m.name })),
    ...customCategories.map((c) => ({ id: c.id, name: c.name })),
    ...builtCategories
      .filter((c) => !CATEGORY_META[c.id] && !customCategories.some((x) => x.id === c.id))
      .map((c) => ({ id: c.id, name: c.name })),
  ];

  const uniqueCategories = [...new Map(categoryOptions.map((c) => [c.id, c])).values()];

  const set = <K extends keyof Omit<Product, 'id'>>(key: K, value: Omit<Product, 'id'>[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('image', String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = customCategory.trim() ? slugify(customCategory) : form.category;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const payload = { ...form, category, tags };

    if (id) {
      updateProduct(id, payload);
      navigate(adminPath('products'));
    }
  };

  if (!existing) {
    return (
      <div className="text-center py-20">
        <p className="text-night-400">Product not found</p>
        <Link to={adminPath('products')} className="btn-primary mt-4 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to={adminPath('products')} className="rounded-lg p-2 text-night-400 hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Edit product
          </h1>
          <p className="text-sm text-night-400">Update product details — saved to your store instantly</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-night-400">Product name *</label>
            <input
              className="input-field w-full"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Brand *</label>
            <input
              className="input-field w-full"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Category *</label>
            <select
              className="input-field w-full"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {uniqueCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-night-400">
              Or new category slug (optional)
            </label>
            <input
              className="input-field w-full"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. energy-drinks"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Subcategory</label>
            <input
              className="input-field w-full"
              value={form.subcategory}
              onChange={(e) => set('subcategory', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Volume</label>
            <input
              className="input-field w-full"
              value={form.volume}
              onChange={(e) => set('volume', e.target.value)}
              placeholder="750ML"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Price (Rs) *</label>
            <input
              type="number"
              min={0}
              className="input-field w-full"
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Original price (Rs)</label>
            <input
              type="number"
              min={0}
              className="input-field w-full"
              value={form.originalPrice ?? ''}
              onChange={(e) =>
                set('originalPrice', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">ABV</label>
            <input
              className="input-field w-full"
              value={form.abv}
              onChange={(e) => set('abv', e.target.value)}
              placeholder="40%"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Badge</label>
            <input
              className="input-field w-full"
              value={form.badge ?? ''}
              onChange={(e) => set('badge', e.target.value || undefined)}
              placeholder="Best Seller, New…"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Rating</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className="input-field w-full"
              value={form.rating}
              onChange={(e) => set('rating', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-night-400">Review count</label>
            <input
              type="number"
              min={0}
              className="input-field w-full"
              value={form.reviews}
              onChange={(e) => set('reviews', Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              id="inStock"
              checked={form.inStock}
              onChange={(e) => set('inStock', e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-night-900 text-neon-amber"
            />
            <label htmlFor="inStock" className="text-sm text-night-300">
              In stock
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-night-400">Image URL</label>
          <input
            className="input-field w-full"
            value={form.image.startsWith('data:') ? '' : form.image}
            onChange={(e) => set('image', e.target.value)}
            placeholder="https://… or /products/…"
          />
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-neon-amber hover:underline">
            <Upload className="h-4 w-4" />
            Upload image file
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {form.image && (
            <img src={form.image} alt="Preview" className="mt-3 h-32 w-32 rounded-lg object-cover bg-night-800" />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-night-400">Description</label>
          <textarea
            className="input-field min-h-[100px] w-full resize-y"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-night-400">Tags (comma-separated)</label>
          <input
            className="input-field w-full"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="beer, lager, nepali"
          />
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-6">
          <button type="submit" className="btn-primary">
            {isEdit ? 'Save changes' : 'Add product'}
          </button>
          <Link to={adminPath('products')} className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
