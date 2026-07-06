import { MapPin, Mail, Phone, MessageSquare, Facebook, Instagram, Send, SlidersHorizontal, Grid3X3 } from 'lucide-react';
import { STORE_INFO } from '@/lib/storeInfo';
import { useAppStore } from '@/store/appStore';
import { useThemeStore } from '@/store/themeStore';
import BrandLogo from '@/components/BrandLogo';
import { useState } from 'react';

export default function Footer() {
  const { setPage } = useAppStore();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const [shopAllDropdownOpen, setShopAllDropdownOpen] = useState(false);
  const [filtersDropdownOpen, setFiltersDropdownOpen] = useState(false);

  const handleQuickLink = (name: string) => {
    const formatted = name.toLowerCase();
    if (formatted === 'home') {
      setPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (formatted === 'shop all' || formatted === 'all products') {
      setPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (formatted === 'deals') {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById('deals');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (formatted === 'trending') {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById('trending');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (formatted === 'new arrivals') {
      setPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (formatted === 'brands') {
      setPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (formatted === 'combo offers') {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById('combos');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (formatted === 'my orders') {
      setPage('orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompanyLink = (name: string) => {
    const formatted = name.toLowerCase();
    if (formatted === 'about us') {
      setPage('about');
    } else if (formatted === 'faq' || formatted === 'how it works' || formatted === 'delivery areas') {
      setPage('faqs');
    } else if (formatted === 'contact') {
      setPage('contact');
    } else if (formatted === 'reviews') {
      setPage('reviews');
    } else if (formatted === 'offers & promotions') {
      setPage('products');
    } else {
      setPage('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`w-full border-t box-border pb-[160px] md:pb-0 ${
      isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0A0A0A] border-[#1A1A1A]'
    }`}>
      {/* ━━━━━━━━━━━━━━━━━━━━━
          TOP SECTION — 3 columns
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10 p-[12px_10px] md:p-[38px_34px_30px_34px] border-b ${
        isLight ? 'border-gray-200' : 'border-[#1A1A1A]'
      }`}>

        {/* COL 1 — QUICK LINKS */}
        <div>
          <h4 className="text-[#C9A84C] text-[9px] font-bold uppercase tracking-[1.2px] mb-2 md:mb-3">QUICK LINKS</h4>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-0">
            {['Home', 'Deals', 'Trending', 'New Arrivals', 'All Products', 'Brands', 'Combo Offers', 'My Orders'].map((link) => (
              <button
                key={link}
                onClick={() => handleQuickLink(link)}
                className={`text-[9px] md:text-[10px] leading-[1.6] md:leading-[1.8] transition-colors text-left ${
                  isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888] hover:text-white'
                }`}
              >
                {link}
              </button>
            ))}
            {/* Shop All Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShopAllDropdownOpen(!shopAllDropdownOpen)}
                className={`text-[9px] md:text-[10px] leading-[1.6] md:leading-[1.8] transition-colors text-left flex items-center gap-1 ${
                  isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888] hover:text-white'
                }`}
              >
                Shop All
                <SlidersHorizontal size={12} />
              </button>
              {shopAllDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1 w-40 rounded-lg border shadow-xl z-50 ${isLight ? 'bg-white border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.1)]' : 'bg-[#141414] border-[#222222]'}`}>
                  <button
                    onClick={() => { setPage('products'); setShopAllDropdownOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-[#CCCCCC] hover:bg-white/5'}`}
                  >
                    <Grid3X3 size={14} />
                    <span className="text-[10px]">All Bottles</span>
                  </button>
                  {/* Filters with nested dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setFiltersDropdownOpen(!filtersDropdownOpen); }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-[#CCCCCC] hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal size={14} />
                        <span className="text-[10px]">Filters</span>
                      </div>
                      <span className={`text-[8px] transition-transform ${filtersDropdownOpen ? 'rotate-90' : ''}`}>›</span>
                    </button>
                    {/* Nested vertical dropdown for filters */}
                    {filtersDropdownOpen && (
                      <div className={`absolute top-0 left-full ml-1 w-36 rounded-lg border shadow-xl z-[60] ${isLight ? 'bg-white border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.1)]' : 'bg-[#141414] border-[#222222]'}`}>
                        <button
                          onClick={() => { setPage('products'); setShopAllDropdownOpen(false); setFiltersDropdownOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-full text-left px-3 py-2 text-[10px] transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-[#CCCCCC] hover:bg-white/5'}`}
                        >
                          Featured
                        </button>
                        <button
                          onClick={() => { setPage('products'); setShopAllDropdownOpen(false); setFiltersDropdownOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-full text-left px-3 py-2 text-[10px] transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-[#CCCCCC] hover:bg-white/5'}`}
                        >
                          Price: Low to High
                        </button>
                        <button
                          onClick={() => { setPage('products'); setShopAllDropdownOpen(false); setFiltersDropdownOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-full text-left px-3 py-2 text-[10px] transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-[#CCCCCC] hover:bg-white/5'}`}
                        >
                          Price: High to Low
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COL 2 — COMPANY + PAYMENT QR */}
        <div>
          <h4 className="text-[#C9A84C] text-[9px] font-bold uppercase tracking-[1.2px] mb-2 md:mb-3">COMPANY</h4>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 md:gap-0">
            {['About Us', 'How It Works', 'Delivery Areas', 'Offers & Promotions', 'Reviews', 'FAQ', 'Contact'].map((link) => (
              <button
                key={link}
                onClick={() => handleCompanyLink(link)}
                className={`text-[9px] md:text-[10px] leading-[1.6] md:leading-[1.8] transition-colors text-left ${
                  isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888] hover:text-white'
                }`}
              >
                {link}
              </button>
            ))}
          </div>

          <div className="mt-3 md:mt-4">
            <h4 className="text-[#C9A84C] text-[9px] font-bold uppercase tracking-[1.2px] mb-1.5 md:mb-2">SCAN TO PAY</h4>
            <div className={`flex gap-2 ${
            isLight ? 'bg-gray-100 rounded-[6px] p-1 md:p-1.5' : 'bg-white rounded-[6px] p-1 md:p-1.5'
          }`}>
              <div className={`w-[60px] md:w-[70px] flex flex-col items-center ${isLight ? 'bg-white rounded-[4px] p-1' : 'p-0'}`}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOCO" alt="MOCO QR" className="w-full h-auto grayscale opacity-90" />
                <span className={`text-[7px] md:text-[8px] font-bold mt-0.5 uppercase ${isLight ? 'text-gray-900' : 'text-black'}`}>MOCO</span>
              </div>
              <div className={`w-[60px] md:w-[70px] flex flex-col items-center ${isLight ? 'bg-white rounded-[4px] p-1' : 'p-0'}`}>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FONEPAY" alt="FONEPAY QR" className="w-full h-auto grayscale opacity-90" />
                <span className={`text-[7px] md:text-[8px] font-bold mt-0.5 uppercase ${isLight ? 'text-gray-900' : 'text-black'}`}>FONEPAY</span>
              </div>
            </div>
          </div>
        </div>

        {/* COL 3 — GET CONNECTED + CONTACT */}
        <div>
          <h4 className="text-[#C9A84C] text-[9px] font-bold uppercase tracking-[1.2px] mb-1.5 md:mb-2">GET CONNECTED</h4>
          <div className={`flex gap-2 md:gap-2.5 mb-3 md:mb-4 ${
            isLight ? 'bg-gray-100 rounded-[8px] p-2' : ''
          }`}>
            <a href={STORE_INFO.facebook} target="_blank" rel="noopener noreferrer" className={`p-1 md:p-1.5 rounded-full transition-all ${
              isLight 
                ? 'border border-gray-300 text-gray-600 hover:text-[#C9A84C] hover:border-[#C9A84C]/30' 
                : 'border border-white/5 text-[#888888] hover:text-[#C9A84C] hover:border-[#C9A84C]/30'
            }`}>
              <Facebook size={14} className="w-3 h-3 md:w-auto md:h-auto" />
            </a>
            <a href={STORE_INFO.instagram} target="_blank" rel="noopener noreferrer" className={`p-1 md:p-1.5 rounded-full transition-all ${
              isLight 
                ? 'border border-gray-300 text-gray-600 hover:text-[#C9A84C] hover:border-[#C9A84C]/30' 
                : 'border border-white/5 text-[#888888] hover:text-[#C9A84C] hover:border-[#C9A84C]/30'
            }`}>
              <Instagram size={14} className="w-3 h-3 md:w-auto md:h-auto" />
            </a>
            <a href={STORE_INFO.whatsapp} target="_blank" rel="noopener noreferrer" className={`p-1 md:p-1.5 rounded-full transition-all ${
              isLight 
                ? 'border border-gray-300 text-gray-600 hover:text-[#C9A84C] hover:border-[#C9A84C]/30' 
                : 'border border-white/5 text-[#888888] hover:text-[#C9A84C] hover:border-[#C9A84C]/30'
            }`}>
              <Send size={14} className="w-3 h-3 md:w-auto md:h-auto" />
            </a>
          </div>

          <h4 className="text-[#C9A84C] text-[9px] font-bold uppercase tracking-[1.2px] mb-1.5 md:mb-2">CONTACT US</h4>
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-start gap-1 md:gap-1.5 group cursor-default">
              <MapPin size={11} className="text-[#C9A84C] shrink-0 mt-0.5 w-2.5 h-2.5 md:w-auto md:h-auto" />
              <span className={`text-[9px] md:text-[10px] leading-[1.4] md:leading-[1.5] transition-colors ${
                isLight ? 'text-gray-600 group-hover:text-gray-900' : 'text-[#888888] group-hover:text-white'
              }`}>Jhyaap Station, Kathmandu</span>
            </div>
            <a href={`mailto:${STORE_INFO.email}`} className="flex items-start gap-1 md:gap-1.5 group">
              <Mail size={11} className="text-[#C9A84C] shrink-0 mt-0.5 w-2.5 h-2.5 md:w-auto md:h-auto" />
              <span className={`text-[9px] md:text-[10px] leading-[1.4] md:leading-[1.5] transition-colors ${
                isLight ? 'text-gray-600 group-hover:text-gray-900' : 'text-[#888888] group-hover:text-white'
              }`}>{STORE_INFO.email}</span>
            </a>
            <a href={`tel:${STORE_INFO.phoneTel}`} className="flex items-start gap-1 md:gap-1.5 group">
              <Phone size={11} className="text-[#C9A84C] shrink-0 mt-0.5 w-2.5 h-2.5 md:w-auto md:h-auto" />
              <span className={`text-[9px] md:text-[10px] leading-[1.4] md:leading-[1.5] transition-colors ${
                isLight ? 'text-gray-600 group-hover:text-gray-900' : 'text-[#888888] group-hover:text-white'
              }`}>{STORE_INFO.phone}</span>
            </a>
            <a href={`https://wa.me/${STORE_INFO.phoneTel}`} className="flex items-start gap-1 md:gap-1.5 group">
              <MessageSquare size={11} className="text-[#C9A84C] shrink-0 mt-0.5 w-2.5 h-2.5 md:w-auto md:h-auto" />
              <span className={`text-[9px] md:text-[10px] leading-[1.4] md:leading-[1.5] transition-colors ${
                isLight ? 'text-gray-600 group-hover:text-gray-900' : 'text-[#888888] group-hover:text-white'
              }`}>WhatsApp: {STORE_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━
          MIDDLE SECTION — brand
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`p-[10px_10px] md:p-[24px_30px] text-center border-b ${
        isLight ? 'bg-white border-gray-200' : 'border-[#1A1A1A]'
      }`}>
        <div className="inline-flex items-center justify-center p-1 md:p-1.5 rounded-full border border-[#C9A84C] mb-1.5 md:mb-2">
          <BrandLogo size="sm" />
        </div>
        <h2 className={`text-[11px] md:text-[12px] font-bold tracking-[1.5px] mb-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>JHYAAP STATION</h2>
        <p className={`text-[8px] md:text-[9px] tracking-[2px] uppercase ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Raise Your Glass</p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━
          18+ DISCLAIMER BAR
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`p-[6px_10px] md:p-[16px_34px] text-center border-b ${
        isLight ? 'bg-gray-50 border-gray-200' : 'border-[#1A1A1A]'
      }`}>
        <h4 className="text-[#C9A84C] text-[8px] md:text-[9px] font-bold uppercase tracking-[1.2px] mb-0.5 md:mb-1">18+ ONLY · DRINK RESPONSIBLY</h4>
        <p className={`text-[8px] md:text-[9px] leading-[1.3] md:leading-[1.4] max-w-[480px] mx-auto ${
          isLight ? 'text-gray-500' : 'text-[#555555]'
        }`}>
          Notice: Spirits cannot be sold to minors under the age of 18. Consuming excessive amounts of alcohol is detrimental to health.
        </p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━
          BOTTOM BAR
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`flex flex-col md:flex-row items-center justify-between p-[6px_10px] md:p-[14px_40px] gap-1 md:gap-0 ${
        isLight ? 'bg-gray-100' : 'bg-[#080808]'
      }`}>
        <p className={`text-[8px] md:text-[9px] ${isLight ? 'text-gray-500' : 'text-[#444444]'}`}>© 2026 Jhyaap Station. All rights reserved.</p>
        <div className="flex gap-2 md:gap-3">
          <button onClick={() => handleCompanyLink('terms')} className={`text-[8px] md:text-[9px] transition-colors ${isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#444444] hover:text-white'}`}>Terms & Conditions</button>
          <span className={isLight ? 'text-gray-300' : 'text-[#222222]'}>·</span>
          <button onClick={() => handleCompanyLink('privacy')} className={`text-[8px] md:text-[9px] transition-colors ${isLight ? 'text-gray-500 hover:text-gray-900' : 'text-[#444444] hover:text-white'}`}>Privacy Policy</button>
        </div>
      </div>
    </footer>
  );
}
