import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCategories } from '@/store/catalogStore';
import { Grid, Home, ShoppingBag, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Home', page: 'home', Icon: Home },
  { label: 'Categories', page: 'categories', Icon: Grid },
  { label: 'Shop All', page: 'products', Icon: ShoppingBag, featured: true },
  { label: 'Cart', page: 'cart', Icon: ShoppingCart },
  { label: 'Account', page: 'profile', Icon: User },
];

export default function BottomNav() {
  const currentPage = useAppStore((s) => s.currentPage);
  const setPage = useAppStore((s) => s.setPage);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setOnlyDeals = useAppStore((s) => s.setOnlyDeals);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const user = useAuthStore((s) => s.user);
  const categories = useCategories();

  const [openCategories, setOpenCategories] = useState(false);

  const handleNav = (page: string) => {
    setSearchQuery('');
    setSelectedCategory(null);
    setOnlyDeals(false);
    setPage(page as any);
    setOpenCategories(false);
  };

  const openCategoryMenu = () => {
    setSearchQuery('');
    setOnlyDeals(false);
    setOpenCategories((current) => !current);
  };

  const selectCategory = (categoryId: string) => {
    setSearchQuery('');
    setOnlyDeals(false);
    setSelectedCategory(categoryId);
    setPage('products');
    setOpenCategories(false);
  };

  return (
    <>
      {openCategories && (
        <div className="fixed inset-x-0 bottom-14 z-[1006] mx-auto max-w-[640px] rounded-t-2xl border border-white/10 bg-[#0B0B0B]/95 p-1.5 shadow-[0_-16px_32px_rgba(0,0,0,0.65)] backdrop-blur-lg md:hidden">
          <div className="flex items-center justify-between pb-1.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-amber">Categories</p>
              <p className="text-[11px] text-white">Tap a category to browse bottles.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpenCategories(false)}
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-[#CCCCCC] hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id)}
                className="rounded-xl border border-white/10 bg-[#111111] px-1.5 py-1.5 text-left transition hover:border-neon-amber/40 hover:bg-[#181818]"
              >
                <p className="text-[11px] font-semibold text-white">{category.name}</p>
                <p className="mt-0.5 text-[8px] text-night-400">{category.count} items</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-[1005] border-t border-white/10 bg-[#080808]/95 px-0.5 pb-1 pt-1 shadow-[0_-12px_32px_rgba(0,0,0,0.6)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-[640px] items-end justify-between gap-0.5 rounded-[14px] border border-white/5 bg-[#0D0D0D]/95 px-1 py-0.5">
          {navItems.map((item) => {
            const isActive =
              item.page === 'home'
                ? currentPage === 'home'
                : item.page === 'categories'
                ? openCategories || currentPage === 'products'
                : item.page === 'products'
                ? currentPage === 'products' || currentPage === 'product'
                : item.page === 'profile'
                ? currentPage === 'profile' || currentPage === 'login'
                : currentPage === item.page;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.page === 'categories') {
                    openCategoryMenu();
                  } else if (item.page === 'profile') {
                    setOpenCategories(false);
                    setPage(user ? 'profile' : 'login');
                  } else {
                    handleNav(item.page);
                  }
                }}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[8px] transition-all rounded-xl px-1 py-0.5 ${
                  isActive ? 'text-gold-primary' : 'text-[#B7B7B7] hover:text-white'
                }`}
              >
                <span className="flex items-center justify-center h-4 w-4">
                  <item.Icon size={14} className="min-w-[14px]" />
                </span>
                <span className="uppercase text-[7px] tracking-[0.14em]">{item.label}</span>
                {item.page === 'cart' && totalItems > 0 ? (
                  <span className="absolute -top-0.5 right-3 inline-flex h-4 min-w-[14px] items-center justify-center rounded-full bg-gold-primary px-1 text-[8px] font-semibold text-black">
                    {totalItems}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
