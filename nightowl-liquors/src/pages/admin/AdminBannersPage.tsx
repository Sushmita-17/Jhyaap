import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { BannerSlide } from '@/types';
import { useCatalogStore } from '@/store/catalogStore';
import AdminBackButton from '@/components/admin/AdminBackButton';

const emptyBanner = (): Omit<BannerSlide, 'id'> => ({
  title: '',
  subtitle: '',
  image: '',
  cta: 'Shop Now',
  link: '/products',
  tag: '',
});

export default function AdminBannersPage() {
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
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminBackButton />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Homepage banners</h1>
          <p className="mt-1 text-sm text-night-400">Hero carousel slides on the store homepage</p>
        </div>
        <button onClick={startNew} className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />
          Add banner
        </button>
      </div>

      {(editingId !== null) && (
        <form onSubmit={handleSave} className="panel space-y-4 p-5">
          <h2 className="font-semibold text-white">{editingId === 'new' ? 'New banner' : 'Edit banner'}</h2>
          <input
            className="input-field w-full"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="input-field w-full resize-y"
            placeholder="Subtitle"
            rows={2}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            required
          />
          <input
            className="input-field w-full"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="input-field w-full"
              placeholder="CTA button text"
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
            />
            <input
              className="input-field w-full"
              placeholder="Link (e.g. /products?category=beer)"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>
          <input
            className="input-field w-full"
            placeholder="Tag label (optional)"
            value={form.tag ?? ''}
            onChange={(e) => setForm({ ...form, tag: e.target.value || undefined })}
          />
          {form.image && (
            <img src={form.image} alt="" className="h-24 w-full rounded-lg object-cover bg-night-800" />
          )}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm">
              Save
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="panel overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <img
                src={banner.image}
                alt=""
                className="h-32 w-full object-cover sm:h-auto sm:w-48"
              />
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  {banner.tag && (
                    <span className="text-[10px] font-bold uppercase text-neon-amber">{banner.tag}</span>
                  )}
                  <h3 className="font-semibold text-white">{banner.title}</h3>
                  <p className="mt-1 text-sm text-night-400 line-clamp-2">{banner.subtitle}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(banner)}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-neon-amber hover:bg-neon-amber/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this banner?')) deleteBanner(banner.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-neon-rose hover:bg-neon-rose/10"
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
