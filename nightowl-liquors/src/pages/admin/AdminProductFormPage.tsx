import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminPath } from '@/lib/adminRoutes';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { Product } from '@/types';
import { useCatalogStore } from '@/store/catalogStore';
import { CATEGORY_META, slugify } from '@/lib/catalogUtils';
import { useThemeStore } from '@/store/themeStore';



export default function AdminProductFormPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const { id } = useParams();
  const navigate = useNavigate();
  const products = useCatalogStore((s) => s.products);
  const customCategories = useCatalogStore((s) => s.customCategories);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const addProduct = useCatalogStore((s) => s.addProduct);
  const builtCategories = useCatalogStore((s) => s.getCategories());

  const existing = id && id !== 'new' ? products.find((p) => p.id === id) : undefined;
  const isEdit = !!existing;

  const [form, setForm] = useState<Omit<Product, 'id'>>(() => {
    if (existing) {
      const { id: _, ...rest } = existing;
      return rest;
    }
    return {
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
    };
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

    if (isEdit && id) {
      updateProduct(id, payload);
    } else {
      addProduct(payload);
    }
    navigate(adminPath('products'));
  };


  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to={adminPath('products')} className={`rounded-lg p-2 transition-all duration-300 ${
          isLight 
            ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-900' 
            : 'text-[#888888] hover:bg-white/5 hover:text-white'
        }`}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className={`font-display text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>
            {isEdit ? 'Edit product' : 'Add new product'}
          </h1>
          <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
            {isEdit ? 'Update product details — saved to your store instantly' : 'Create a new product — add to your catalog instantly'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`panel space-y-6 p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className="relative grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Product name *</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Brand *</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Category *</label>
            <select
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
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
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
              Or new category slug (optional)
            </label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. energy-drinks"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Subcategory</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.subcategory}
              onChange={(e) => set('subcategory', e.target.value)}
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Volume</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.volume}
              onChange={(e) => set('volume', e.target.value)}
              placeholder="750ML"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Price (Rs) *</label>
            <input
              type="number"
              min={0}
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Original price (Rs)</label>
            <input
              type="number"
              min={0}
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.originalPrice ?? ''}
              onChange={(e) =>
                set('originalPrice', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>ABV</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.abv}
              onChange={(e) => set('abv', e.target.value)}
              placeholder="40%"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Badge</label>
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.badge ?? ''}
              onChange={(e) => set('badge', e.target.value || undefined)}
              placeholder="Best Seller, New…"
            />
            </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Rating</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              value={form.rating}
              onChange={(e) => set('rating', Number(e.target.value))}
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Review count</label>
            <input
              type="number"
              min={0}
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
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
              className={`h-4 w-4 rounded text-[#C9A84C] focus:ring-[#C9A84C] focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'border-gray-300 bg-gray-50' 
                  : 'border-white/20 bg-[#1A1A1A]'
              }`}
            />
            <label htmlFor="inStock" className={`text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
              In stock
            </label>
          </div>
        </div>

        <div className="relative">
          <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Image URL</label>
          <input
            className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            value={form.image.startsWith('data:') ? '' : form.image}
            onChange={(e) => set('image', e.target.value)}
            placeholder="https://… or /products/…"
          />
          <label className="relative mt-3 flex cursor-pointer items-center gap-2 text-sm text-[#C9A84C] hover:underline hover:text-[#C9A84C]/80 transition-colors">
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
            <img src={form.image} alt="Preview" className={`mt-3 h-32 w-32 rounded-xl object-cover hover:border-[#C9A84C]/50 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:scale-105 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-100 border-gray-200' 
                : 'bg-[#1A1A1A] border-white/10'
            }`} />
          )}
        </div>

        <div className="relative">
          <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Description</label>
          <textarea
            className={`input-field min-h-[100px] w-full resize-y backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
          />
        </div>

        <div className="relative">
          <label className={`mb-1.5 block text-xs font-medium ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Tags (comma-separated)</label>
          <input
            className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="beer, lager, nepali"
          />
        </div>

        <div className={`relative flex gap-3 border-t pt-6 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <button type="submit" className="btn-primary flex items-center gap-2 hover:scale-105 hover:shadow-xl hover:shadow-[#C9A84C]/30 transition-all duration-300">
            {isEdit ? 'Save changes' : <><Plus className="h-4 w-4" /> Add product</>}
          </button>
          <Link to={adminPath('products')} className="btn-secondary hover:scale-105 transition-transform duration-300">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
