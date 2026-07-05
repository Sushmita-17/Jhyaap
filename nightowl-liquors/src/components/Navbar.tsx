import { useState, useRef, useEffect, useMemo } from 'react';
import { Clock, Phone, Search, ShoppingCart, User, CreditCard } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useCatalogStore, useCategories } from '@/store/catalogStore';
import { STORE_INFO } from '@/lib/storeInfo';

export default function Navbar() {
  const { setPage, setSelectedCategory, setSearchQuery, setOnlyDeals } = useAppStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const user = useAuthStore((s) => s.user);
  const products = useCatalogStore((s) => s.products);
  const categories = useCategories();
  
  const [searchValue, setSearchValue] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementHeight, setAnnouncementHeight] = useState(38);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeaderH = () => {
      if (announcementRef.current) {
        setAnnouncementHeight(announcementRef.current.offsetHeight);
      }
    };

    updateHeaderH();
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      updateHeaderH();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeaderH);

    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
        setBrandsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBrandsOpen(false);
        setMegaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeaderH);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Update global padding dynamically
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) {
      const hNavbar = 72; // Mobile height
      const hSecondary = 40; // Mobile height
      const hDesktopNav = 88;
      const hDesktopSec = 44;
      
      if (window.innerWidth < 768) {
        main.style.paddingTop = `${announcementHeight + hNavbar + hSecondary}px`;
      } else {
        main.style.paddingTop = `${scrolled ? (hDesktopNav + hDesktopSec) : (announcementHeight + hDesktopNav + hDesktopSec)}px`;
      }
    }
  }, [announcementHeight, scrolled]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();
  }, [products]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.id !== 'deals');
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchValue);
    setSelectedCategory(null);
    setOnlyDeals(false);
    setPage('products');
  };

  const scrollToSection = (id: string) => {
    setMegaMenuOpen(false);
    setBrandsOpen(false);
    if (useAppStore.getState().page !== 'home') {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Shop All', action: () => { setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { label: 'All Categories ›', type: 'categories' },
    { label: 'Brands', type: 'brands' },
    { label: 'Deals', action: () => scrollToSection('deals') },
    { label: 'Trending Products', action: () => scrollToSection('trending') },
    { label: 'New Arrivals', action: () => scrollToSection('new-arrivals') },
    { label: 'All Products', action: () => scrollToSection('all-products') },
  ];

  return (
    <header ref={headerRef} className="w-full">
      {/* 1. ANNOUNCEMENT BAR */}
      <div 
        ref={announcementRef}
        className={`fixed top-0 left-0 right-0 z-[1002] bg-gold-primary transition-all duration-300 will-change-transform ${
          scrolled ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Desktop */}
        <div className="hidden md:flex max-w-[1248px] mx-auto h-[38px] items-center justify-between px-10 text-[12px] font-medium text-black">
          <div className="flex-1 flex items-center justify-start border-r border-black/15 h-full px-5">
            <a href={`tel:${STORE_INFO.phoneTel}`} className="flex items-center gap-2 underline px-2">
              <Phone size={12} className="stroke-[2.5]" />
              Order by Phone: {STORE_INFO.phone}
            </a>
          </div>
          <div className="flex-1 flex items-center justify-center border-r border-black/15 h-full px-5">
            <span className="flex items-center gap-2 px-2">
              <Clock size={12} className="stroke-[2.5]" />
              Delivery Hours: 6:00 PM to 2:00 AM (NST)
            </span>
          </div>
          <div className="flex-1 flex items-center justify-end h-full px-5">
            <span className="flex items-center gap-2 px-2">
              <CreditCard size={12} className="stroke-[2.5]" />
              Cash or Card on Delivery
            </span>
          </div>
        </div>

        {/* Mobile (iPhone XR Fix) */}
        <div className="md:hidden flex flex-col items-center justify-center py-[6px] px-[12px] gap-[2px] text-center text-black font-medium leading-tight">
          <a href={`tel:${STORE_INFO.phoneTel}`} className="text-[11px] flex items-center gap-1.5 underline">
            <Phone size={11} /> {STORE_INFO.phone}
          </a>
          <span className="text-[10px] opacity-90">
            🕐 6 PM – 2 AM  •  💳 Cash or Card
          </span>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <div 
        className={`fixed left-0 right-0 z-[1001] bg-[#0A0A0A] transition-all duration-300 will-change-transform flex items-center border-b border-[#1A1A1A]`}
        style={{ 
          top: scrolled ? '0px' : `${announcementHeight}px`,
          height: window.innerWidth < 768 ? '72px' : '88px'
        }}
      >
        <div className="max-w-[1248px] mx-auto px-[12px] md:px-[40px] flex items-center justify-between gap-4 md:gap-5 h-full w-full box-border">
          {/* LOGO */}
          <button 
            onClick={() => { setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="shrink-0 flex items-center"
          >
            <div className="h-[60px] w-[60px] md:h-[80px] md:w-[80px] border-[2px] border-gold-primary rounded-full p-[4px] overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(245,166,35,0.3)]">
               <img src="/logo-256.png" alt="Logo" className="h-full w-full object-contain rounded-full" />
            </div>
          </button>

          {/* SEARCH BAR (iPhone XR Fix) */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[840px] relative h-[34px] md:h-[38px] box-border">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#888888]" />
            <input
              type="text"
              placeholder="Search whisky, beer, vodka, rum..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-[6px] pl-[38px] pr-4 text-[12px] md:text-[13px] text-white placeholder:text-[#666666] focus:outline-none focus:border-gold-primary focus:bg-[#1E1E1E] transition-all font-sans box-border"
            />
          </form>

          {/* ICONS (Stop Shift) */}
          <div className="shrink-0 flex items-center gap-[12px] md:gap-[16px]">
            <button onClick={() => setPage(user ? 'profile' : 'login')} className="text-[#AAAAAA] hover:text-white transition-colors">
              <User size={window.innerWidth < 768 ? 18 : 20} />
            </button>
            <button onClick={() => setPage('cart')} className="relative text-[#AAAAAA] hover:text-white transition-colors">
              <ShoppingCart size={window.innerWidth < 768 ? 18 : 20} />
              {totalItems > 0 && (
                <span className="absolute -top-[5px] -right-[5px] w-[14px] h-[14px] md:w-[16px] md:h-[16px] bg-gold-primary text-black text-[8px] md:text-[9px] font-black rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECONDARY NAV */}
      <div 
        className={`fixed left-0 right-0 z-[1000] bg-[#0A0A0A] border-b border-[#1A1A1A] transition-all duration-300 will-change-transform flex items-center box-border w-100% overflow-hidden`}
        style={{ 
          top: scrolled 
            ? (window.innerWidth < 768 ? '72px' : '88px') 
            : `${announcementHeight + (window.innerWidth < 768 ? 72 : 88)}px`,
          height: window.innerWidth < 768 ? '40px' : '44px'
        }}
      >
        <div className="max-w-[1248px] mx-auto px-[12px] md:px-[40px] w-full h-full box-border">
          <nav className="flex items-center md:justify-center gap-[16px] md:gap-[32px] h-full overflow-x-auto hide-scrollbar whitespace-nowrap">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  if (link.type === 'categories') {
                    setMegaMenuOpen(!megaMenuOpen); setBrandsOpen(false);
                  } else if (link.type === 'brands') {
                    setBrandsOpen(!brandsOpen); setMegaMenuOpen(false);
                  } else if (link.action) {
                    link.action();
                  }
                }}
                className={`text-[11px] md:text-[13px] font-medium uppercase tracking-[0.3px] transition-colors ${
                  (link.type === 'categories' && megaMenuOpen) || (link.type === 'brands' && brandsOpen)
                    ? 'text-gold-primary'
                    : 'text-[#CCCCCC] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* MEGA DROP */}
      {(brandsOpen || megaMenuOpen) && (
        <div 
          className="fixed left-0 right-0 z-[998] bg-[#141414] border-y border-[#222222] p-[20px_40px] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex flex-wrap gap-[12px_24px] max-h-[300px] overflow-y-auto"
          style={{ 
            top: scrolled 
              ? (window.innerWidth < 768 ? '112px' : '132px') 
              : `${announcementHeight + (window.innerWidth < 768 ? 112 : 132)}px` 
          }}
        >
          {brandsOpen ? (
            brands.map((brand) => (
              <button key={brand} onClick={() => {setSearchQuery(brand); setPage('products'); setBrandsOpen(false);}} className="text-[#CCCCCC] text-[13px] p-[6px_12px] rounded-[4px] hover:bg-[#1E1E1E] hover:text-white transition-all font-medium uppercase">{brand}</button>
            ))
          ) : (
            filteredCategories.map((cat) => (
              <button key={cat.id} onClick={() => {setSelectedCategory(cat.id); setPage('products'); setMegaMenuOpen(false);}} className="text-[#CCCCCC] text-[13px] p-[6px_12px] rounded-[4px] hover:bg-[#1E1E1E] hover:text-white transition-all font-medium uppercase">{cat.name}</button>
            ))
          )}
        </div>
      )}
    </header>
  );
}
