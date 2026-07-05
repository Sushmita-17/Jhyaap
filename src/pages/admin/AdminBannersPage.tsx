import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { BannerSlide } from '@/types';
import { useCatalogStore } from '@/store/catalogStore';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

const emptyBanner = (): Omit<BannerSlide, 'id'> => ({
  title: '',
  subtitle: '',
  image: '',
  cta: 'Shop Now',
  link: '/products',
  tag: '',
});

export default function AdminBannersPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const banners = useCatalogStore((s) => s.banners);
  const addBanner = useCatalogStore((s) => s.addBanner);
  const updateBanner = useCatalogStore((s) => s.updateBanner);
  const deleteBanner = useCatalogStore((s) => s.deleteBanner);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BannerSlide, 'id'>>(emptyBanner());

  const startEdit = (banner: BannerSlide) => {
    const { id, ...rest } = banner;
    setEditingId(id);
    setForm(rest);
  };

  const startNew = () => {
    setEditingId('new');
    setForm(emptyBanner());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === 'new') {
      addBanner(form);
    } else if (editingId) {
      updateBanner(editingId, form);
    }
    setEditingId(null);
    setForm(emptyBanner());
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <AdminBackButton />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`font-display text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>Homepage banners</h1>
          <p className={`mt-1 text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Hero carousel slides on the store homepage</p>
        </div>
        <button onClick={startNew} className="btn-primary inline-flex items-center gap-2 text-sm hover:scale-105 hover:shadow-xl hover:shadow-[#C9A84C]/30 transition-all duration-300">
          <Plus className="h-4 w-4" />
          Add banner
        </button>
      </div>

      {(editingId !== null) && (
        <form onSubmit={handleSave} className={`panel space-y-4 p-5 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <h2 className={`relative font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{editingId === 'new' ? 'New banner' : 'Edit banner'}</h2>
          <input
            className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className={`input-field w-full resize-y backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            placeholder="Subtitle"
            rows={2}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            required
          />
          <input
            className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              placeholder="CTA button text"
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
            />
            <input
              className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`}
              placeholder="Link (e.g. /products?category=beer)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>
          <input
            className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                : 'bg-[#1A1A1A]/80 border-white/10 text-white'
            }`}
            placeholder="Tag label (optional)"
            value={form.tag ?? ''}
            onChange={(e) => setForm({ ...form, tag: e.target.value || undefined })}
          />
          {form.image && (
            <img src={form.image} alt="" className={`h-24 w-full rounded-lg object-cover border hover:border-[#C9A84C]/50 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:scale-105 transition-all duration-300 ${
              isLight 
                ? 'bg-gray-100 border-gray-200' 
                : 'bg-[#1A1A1A] border-white/10'
            }`} />
          )}
          <div className="relative flex gap-3">
            <button type="submit" className="btn-primary text-sm hover:scale-105 hover:shadow-xl hover:shadow-[#C9A84C]/30 transition-all duration-300">
              Save
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-sm hover:scale-105 transition-transform duration-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {banners.map((banner, index) => (
          <div key={banner.id} className={`panel overflow-hidden backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
          }`} style={{ animationDelay: `${index * 100}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col sm:flex-row">
              <img
                src={banner.image}
                alt=""
                className="h-32 w-full object-cover sm:h-auto sm:w-48 hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  {banner.tag && (
                    <span className="text-[10px] font-bold uppercase text-[#C9A84C] bg-[#C9A84C]/15 px-2 py-1 rounded-full border border-[#C9A84C]/30 shadow-lg shadow-[#C9A84C]/10">{banner.tag}</span>
                  )}
                  <h3 className={`font-semibold hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{banner.title}</h3>
                  <p className={`mt-1 text-sm line-clamp-2 ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>{banner.subtitle}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(banner)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-[#C9A84C] bg-[#C9A84C]/15 border border-[#C9A84C]/30 hover:bg-[#C9A84C]/25 hover:shadow-lg hover:shadow-[#C9A84C]/20 hover:scale-105 transition-all duration-300"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this banner?')) deleteBanner(banner.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-400 bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
