import BrandLogo from '@/components/BrandLogo';
import { STORE_INFO } from '@/lib/storeInfo';
import { useAppStore } from '@/store/appStore';
import { useCartStore } from '@/store/cartStore';
import { useCatalogStore, useCategories } from '@/store/catalogStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/contexts/AuthContext';
import CustomerNotificationPanel from '@/components/CustomerNotificationPanel';
import { Bell, Clock, CreditCard, Menu, Phone, Search, ShoppingCart, User, X, Minus, Plus, Sun, Moon, Grid3X3, SlidersHorizontal, LogOut } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';

export default function Navbar() {
  const { currentPage, setPage, setSelectedCategory, setSearchQuery, setOnlyDeals } = useAppStore();
  const products = useCatalogStore((s) => s.products);
  const categories = useCategories();
  const cartQty = useCartStore((s) => s.getTotalItems());
  const { theme, toggleTheme } = useThemeStore();
  const { user: authUser, isAuthenticated: authIsAuthenticated, logout: authLogout } = useAuth();
  const { user: storeUser, isAuthenticated: storeIsAuthenticated, logout: storeLogout } = useAuthStore();
  
  // Use auth user if available, otherwise use store user
  const user = authUser || storeUser;
  const isAuthenticated = authIsAuthenticated || storeIsAuthenticated;
  const logout = () => {
    authLogout();
    storeLogout();
  };
  
  // Only show notifications when logged in
  const showNotifications = isAuthenticated && !!user;
  const isLight = theme === 'light';
  
  const [searchValue, setSearchValue] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementHeight, setAnnouncementHeight] = useState(38);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSecondary, setShowMobileSecondary] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [shopAllDropdownOpen, setShopAllDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const handleNotificationClick = () => {
    setNotificationDropdownOpen((open) => !open);
  };

  const closeNotificationPanel = () => {
    setNotificationDropdownOpen(false);
  };

  const headerRef = useRef(null);

  const announcementRef = useRef(null);
  const lastScrollY = useRef(0);


  useEffect(() => {
    const updateHeaderH = () => {
      let annH = 38;
      if (announcementRef.current) {
        annH = announcementRef.current.offsetHeight;
        setAnnouncementHeight(annH);
      }

      const main = document.querySelector('main');
      if (main) {
        const isMobile = window.innerWidth < 768;
        const hNavbar = isMobile ? 60 : 80;
        const hSecondary = isMobile ? 90 : 44;
        const isScrolled = window.scrollY > 80;
        const topOffset = isMobile
          ? annH + hNavbar + hSecondary
          : isScrolled
            ? hNavbar + hSecondary
            : annH + hNavbar + hSecondary;

        main.style.paddingTop = `${topOffset}px`;
        main.style.paddingBottom = isMobile ? '84px' : '0px';
      }
    };

    updateHeaderH();
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 80);
      
      // Mobile secondary nav hide/show based on scroll direction
      if (window.innerWidth < 768) {
        const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
        if (scrollDirection === 'down' && currentScrollY > 100) {
          setShowMobileSecondary(false);
        } else if (scrollDirection === 'up') {
          setShowMobileSecondary(true);
        }
        lastScrollY.current = currentScrollY;
      }
      
      updateHeaderH();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeaderH);

    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMegaMenuOpen(false);
        setBrandsOpen(false);
        setShopAllDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
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
  }, [scrolled]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).filter(Boolean).sort();
  }, [products]);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.id !== 'deals');
  }, [categories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchValue);
    setSelectedCategory(null);
    setOnlyDeals(false);
    setPage('products');
  };

  const scrollToSection = (id) => {
    setMegaMenuOpen(false);
    setBrandsOpen(false);
    if (currentPage !== 'home') {
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
    { label: 'All Categories', type: 'categories' },
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
        <div className="hidden md:flex max-w-[1248px] mx-auto h-[38px] items-center justify-between px-[28px] lg:px-[44px] text-[12px] font-medium text-black">
          <div className="flex-1 flex items-center justify-start border-r border-black/15 h-full px-[22px]">
            <a href={`tel:${STORE_INFO.phoneTel}`} className="flex items-center gap-2 underline px-2">
              <Phone size={12} className="stroke-[2.5]" />
              {STORE_INFO.phone}
            </a>
          </div>
          <div className="flex-1 flex items-center justify-center border-r border-black/15 h-full px-[18px]">
            <span className="flex items-center gap-2 px-2">
              <Clock size={12} className="stroke-[2.5]" />
              Delivery Hours: 10:00 PM to 4:00 AM (NST)
            </span>
          </div>
          <div className="flex-1 flex items-center justify-end h-full px-[18px]">
            <span className="flex items-center gap-2 px-2">
              <CreditCard size={12} className="stroke-[2.5]" />
              Cash or Card on Delivery
            </span>
          </div>
        </div>

        {/* Mobile (iPhone XR Fix) */}
        <div className="md:hidden flex flex-col items-center justify-center py-[6px] px-[12px] gap-[2px] text-center text-black font-medium leading-tight">
          <span className="text-[11px] flex items-center gap-1.5 font-semibold">
            <Phone size={11} /> {STORE_INFO.phone}
          </span>
          <span className="text-[10px] opacity-90">
            10 PM - 4 AM - Cash or Card
          </span>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <div 
        className={`fixed left-0 right-0 z-[1001] transition-all duration-300 will-change-transform flex items-center border-b ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-[#0A0A0A] border-[#1A1A1A]'
        }`}
        style={{ 
          top: scrolled ? '0px' : `${announcementHeight}px`,
          height: window.innerWidth < 768 ? '60px' : '80px'
        }}
      >
        <div className="max-w-[1248px] mx-auto px-[10px] md:px-[48px] lg:px-[64px] flex items-center justify-between gap-3 md:gap-6 h-full w-full box-border">
          {/* LOGO */}
          <button 
            onClick={() => { setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="shrink-0 flex items-center"
          >
            <BrandLogo size="md" className="h-[42px] w-[42px] md:h-[72px] md:w-[72px] shadow-[0_0_14px_rgba(245,166,35,0.24)]" />
          </button>

          {/* Search Input - Center */}
          <div className="flex flex-1 justify-center px-2">
            <div className="relative w-full max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isLight ? 'text-gray-400' : 'text-[#888888]'}`} />
              <input
                type="text"
                placeholder="Search products..."
                className={`w-full pl-10 pr-4 py-2 rounded-full border text-sm transition-all ${
                  isLight 
                    ? 'bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]' 
                    : 'bg-white/5 border-white/10 text-white placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop icons (no hamburger) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Toggle Switch */}
              <button
                onClick={toggleTheme}
                className={`shrink-0 relative w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                  isLight 
                    ? 'bg-gray-200' 
                    : 'bg-[#C9A84C]'
                }`}
                aria-label="Toggle theme"
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${
                  isLight 
                    ? 'left-1 bg-white shadow-md' 
                    : 'left-7 bg-black shadow-md'
                }`} />
                <Sun className={`absolute left-1.5 top-1 w-3 h-3 transition-opacity duration-300 ${isLight ? 'opacity-100 text-gray-600' : 'opacity-0'}`} />
                <Moon className={`absolute right-1.5 top-1 w-3 h-3 transition-opacity duration-300 ${!isLight ? 'opacity-100 text-white' : 'opacity-0'}`} />
              </button>
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={handleNotificationClick}
                    className={`shrink-0 rounded-2xl p-2.5 transition-colors relative ${
                      isLight 
                        ? 'bg-gray-100 text-gray-600 hover:text-gray-900' 
                        : 'bg-white/5 text-[#AAAAAA] hover:text-white'
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                  </button>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => setPage('profile')}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-white'
                      }`}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className={`text-sm font-medium hidden md:block ${
                        isLight ? 'text-gray-700' : 'text-white'
                      }`}>
                        {user?.name || 'User'}
                      </span>
                    </button>
                    <button
                      onClick={logout}
                      className={`p-2 rounded-lg transition-colors ${
                        isLight 
                          ? 'hover:bg-gray-100 text-gray-600' 
                          : 'hover:bg-white/10 text-gray-400'
                      }`}
                      aria-label="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setPage('login')}
                  className={`shrink-0 rounded-2xl p-2.5 transition-colors ${
                    isLight 
                      ? 'bg-gray-100 text-gray-600 hover:text-gray-900' 
                      : 'bg-white/5 text-[#AAAAAA] hover:text-white'
                  }`}
                  aria-label="Login"
                >
                  <User size={20} />
                </button>
              )}
              <button
                onClick={() => setPage('cart')}
                className={`shrink-0 rounded-2xl p-2.5 transition-colors relative ${
                  isLight 
                    ? 'bg-gray-100 text-gray-600 hover:text-gray-900' 
                    : 'bg-white/5 text-[#AAAAAA] hover:text-white'
                }`}
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cartQty > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-gold-primary text-black text-[10px] font-black leading-[18px] text-center shadow-[0_0_0_2px_rgba(245,166,35,0.15)]">
                    {cartQty}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile hamburger and theme toggle */}
            <div className="flex md:hidden items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={handleNotificationClick}
                    className={`shrink-0 rounded-xl p-1.5 transition-colors ${
                      isLight 
                        ? 'bg-gray-100 text-gray-600 hover:text-gray-900' 
                        : 'bg-white/5 text-[#AAAAAA] hover:text-white'
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-white'
                    }`}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className={`text-xs font-medium ${
                      isLight ? 'text-gray-700' : 'text-white'
                    }`}>
                      {user?.name || 'User'}
                    </span>
                  </div>
                </>
              ) : null}
              {/* Theme Toggle Switch - Mobile */}
              <button
                onClick={toggleTheme}
                className={`shrink-0 relative w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${
                  isLight 
                    ? 'bg-gray-200' 
                    : 'bg-[#C9A84C]'
                }`}
                aria-label="Toggle theme"
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  isLight 
                    ? 'left-0.5 bg-white shadow-md' 
                    : 'left-5 bg-black shadow-md'
                }`} />
                <Sun className={`absolute left-1 top-0.5 w-2 h-2 transition-opacity duration-300 ${isLight ? 'opacity-100 text-gray-600' : 'opacity-0'}`} />
                <Moon className={`absolute right-1 top-0.5 w-2 h-2 transition-opacity duration-300 ${!isLight ? 'opacity-100 text-white' : 'opacity-0'}`} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="shrink-0 rounded-2xl bg-white/5 p-2.5 text-[#AAAAAA] hover:bg-[#F5E8C1] hover:text-[#B07B23] transition-colors"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECONDARY NAV */}
      <div 
        className={`fixed left-0 right-0 z-[1000] border-t border-b shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-300 will-change-transform box-border overflow-hidden md:block ${showMobileSecondary ? 'block' : 'hidden'} ${
          isLight 
            ? 'bg-gray-50 border-gray-200 shadow-[0_18px_40px_rgba(0,0,0,0.1)]' 
            : 'bg-[#171717] border-t border-white/15 border-b border-white/10'
        }`}
        style={{ 
          top: scrolled 
            ? (window.innerWidth < 768 ? '60px' : '80px') 
            : `${announcementHeight + (window.innerWidth < 768 ? 60 : 80)}px`,
          height: window.innerWidth < 768 ? '90px' : '44px'
        }}
      >
        <div className="max-w-[1248px] mx-auto px-[12px] md:px-[40px] w-full box-border h-full">
          {/* Desktop Nav Links */}
          <div className="hidden md:flex h-full items-center justify-center">
            <nav className="flex items-center md:justify-center gap-[16px] md:gap-[34px] lg:gap-[40px] h-full overflow-x-auto hide-scrollbar whitespace-nowrap">
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
                      : isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#CCCCCC] hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Category Circles Row */}
          <div className="md:hidden h-full flex items-center">
            <div className="w-full px-2 py-1">
              <div className="flex w-full gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                {filteredCategories.slice(0, 6).map((cat, index) => (
                  <React.Fragment key={cat.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setPage('products');
                      }}
                      className="flex-shrink-0 flex flex-col items-center gap-1 transition opacity-80 hover:opacity-100"
                    >
                      <div className={`h-[44px] w-[44px] overflow-hidden rounded-full border p-[3px] flex items-center justify-center ${
                        isLight 
                          ? 'bg-gray-100 border-gray-300' 
                          : 'bg-[#1A1A1A] border-white/10'
                      }`}>
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className={`block text-[8px] font-bold uppercase tracking-[0.1em] leading-[1.1] max-w-[44px] text-center truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {cat.name}
                      </span>
                    </button>
                  </React.Fragment>
                ))}
                {/* More button with three dots at the end */}
                {filteredCategories.length > 6 && (
                  <button
                    type="button"
                    onClick={() => { setMegaMenuOpen(!megaMenuOpen); setBrandsOpen(false); }}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition opacity-80 hover:opacity-100 ${
                      megaMenuOpen ? 'opacity-100' : ''
                    }`}
                  >
                    <div className={`h-[44px] w-[44px] flex items-center justify-center rounded-full border text-gold-primary text-[16px] font-black ${
                      isLight 
                        ? 'bg-gray-200 border-gray-300' 
                        : 'bg-[#222] border-gold-primary/40'
                    }`}>
                      ...
                    </div>
                    <span className={`block text-[9px] font-bold uppercase tracking-[0.1em] leading-[1.1] ${isLight ? 'text-gray-900' : 'text-white'}`}>More</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEGA DROP */}
      {(brandsOpen || megaMenuOpen) && (
        <div 
          className={`fixed left-0 right-0 z-[998] border-y p-[20px_26px] lg:p-[20px_56px] shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex flex-wrap gap-[12px_24px] max-h-[300px] overflow-y-auto ${
            isLight 
              ? 'bg-white border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.1)]' 
              : 'bg-[#141414] border-y border-[#222222]'
          }`}
          style={{ 
            top: scrolled 
              ? (window.innerWidth < 768 ? '164px' : '124px') 
              : `${announcementHeight + (window.innerWidth < 768 ? 164 : 124)}px` 
          }}
        >
          {brandsOpen ? (
            brands.map((brand) => (
              <button key={brand} onClick={() => {setSearchQuery(brand); setPage('products'); setBrandsOpen(false);}} className={`text-[13px] p-[6px_12px] rounded-[4px] hover:transition-all font-medium uppercase ${
                isLight 
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' 
                  : 'text-[#CCCCCC] hover:bg-[#1E1E1E] hover:text-white'
              }`}>{brand}</button>
            ))
          ) : (
            filteredCategories.map((cat) => (
              <button key={cat.id} onClick={() => {setSelectedCategory(cat.id); setPage('products'); setMegaMenuOpen(false);}} className={`text-[13px] p-[6px_12px] rounded-[4px] hover:transition-all font-medium uppercase ${
                isLight 
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' 
                  : 'text-[#CCCCCC] hover:bg-[#1E1E1E] hover:text-white'
              }`}>{cat.name}</button>
            ))
          )}
        </div>
      )}
      {/* MOBILE SLIDE-IN MENU */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className={`fixed top-0 right-0 bottom-0 z-[1101] w-[75vw] max-w-[300px] border-l flex flex-col md:hidden shadow-2xl ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-[#0D0D0D] border-l border-white/10'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-4 border-b ${
              isLight ? 'border-gray-200' : 'border-white/10'
            }`}>
              <span className={`font-bold text-[14px] uppercase tracking-wider ${isLight ? 'text-gray-900' : 'text-white'}`}>Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-full p-2 transition-colors ${
                  isLight 
                    ? 'bg-gray-100 text-gray-600 hover:bg-[#F5E8C1] hover:text-[#B07B23]' 
                    : 'bg-white/5 text-[#AAAAAA] hover:bg-[#3B2A0F] hover:text-[#F5E8C1]'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Nav Links */}
            <div className={`px-3 py-3 border-b ${
              isLight ? 'border-gray-200' : 'border-white/5'
            }`}>
              <p className={`text-[9px] uppercase tracking-[1.5px] font-bold mb-2 px-1 ${isLight ? 'text-gray-500' : 'text-[#555555]'}`}>Navigate</p>
              {[
                { label: 'Home', action: () => { setPage('home'); setMobileMenuOpen(false); } },
                { label: 'All Products', action: () => { setPage('products'); setMobileMenuOpen(false); } },
                { label: 'Flash Deals', action: () => { const el = document.getElementById('deals'); if(el) el.scrollIntoView({behavior:'smooth'}); setMobileMenuOpen(false); } },
                { label: 'My Cart', action: () => { setPage('cart'); setMobileMenuOpen(false); } },
                { label: 'My Account', action: () => { setPage('profile'); setMobileMenuOpen(false); } },
                { label: 'Track Order', action: () => { setPage('order-tracking'); setMobileMenuOpen(false); } },
              ].map(link => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`w-full text-left px-3 py-2.5 text-[12px] font-medium rounded-[8px] transition-all ${
                    isLight 
                      ? 'text-gray-700 hover:text-[#B07B23] hover:bg-[#F5E8C1]' 
                      : 'text-[#CCCCCC] hover:text-[#F5E8C1] hover:bg-[#3B2A0F]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Categories */}
            <div className="px-3 py-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className={`text-[9px] uppercase tracking-[1.5px] font-bold ${isLight ? 'text-gray-500' : 'text-[#555555]'}`}>Categories</p>
                <button
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="w-6 h-6 rounded-full border border-gold-primary/40 text-gold-primary hover:bg-gold-primary hover:text-black transition-all flex items-center justify-center"
                >
                  {categoriesExpanded ? <Minus size={12} /> : <Plus size={12} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(categoriesExpanded ? filteredCategories : filteredCategories.slice(0, 5)).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setPage('products'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-2.5 py-2 border rounded-[8px] hover:border-gold-primary/30 transition-all text-left ${
                      isLight 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-[#161616] border-white/5'
                    }`}
                  >
                    <img src={cat.image} alt={cat.name} className={`w-6 h-6 object-contain rounded-full flex-shrink-0 ${
                      isLight ? 'bg-gray-100' : 'bg-[#111111]'
                    }`} />
                    <span className={`text-[10px] font-medium truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={`px-4 py-3 border-t ${
              isLight ? 'border-gray-200' : 'border-white/5'
            }`}>
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setPage('profile')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-white'
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className={`text-sm font-medium ${
                      isLight ? 'text-gray-700' : 'text-white'
                    }`}>
                      {user.name || 'User'}
                    </span>
                  </button>
                  <button
                    onClick={logout}
                    className={`p-2 rounded-lg transition-colors ${
                      isLight 
                        ? 'hover:bg-gray-100 text-gray-600' 
                        : 'hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : null}
              <p className={`text-[10px] text-center ${isLight ? 'text-gray-500' : 'text-[#555555]'}`}>📞 {STORE_INFO.phone} &middot; 6PM&ndash;2AM</p>
            </div>
          </div>
        </>
      )}
      
      {/* Notification Panel - positioned below navigation */}
      {notificationDropdownOpen && isAuthenticated && user && (
        <div className="fixed top-[130px] right-4 z-[1003] pointer-events-auto">
          <CustomerNotificationPanel 
            isOpen={true} 
            onClose={closeNotificationPanel} 
          />
        </div>
      )}
    </header>
  );
}


