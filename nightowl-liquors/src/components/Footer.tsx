import { MapPin, Mail, Phone, MessageSquare, Facebook, Instagram, Send } from 'lucide-react';
import { STORE_INFO } from '@/lib/storeInfo';
import { useAppStore } from '@/store/appStore';

export default function Footer() {
  const { setPage } = useAppStore();

  const handleLink = (page: string) => {
    setPage(page as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-[#1A1A1A] box-border">
      {/* ━━━━━━━━━━━━━━━━━━━━━
          TOP SECTION — 3 columns
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-[1248px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-10 p-[32px_20px] md:p-[48px_40px_32px_40px] border-b border-[#1A1A1A]">
        
        {/* COL 1 — QUICK LINKS */}
        <div>
          <h4 className="text-gold-primary text-[11px] font-bold uppercase tracking-[1.5px] mb-4">QUICK LINKS</h4>
          <div className="grid grid-cols-1 gap-0">
            {['Home', 'Shop All', 'Deals', 'Trending', 'New Arrivals', 'All Products', 'Brands', 'Combo Offers', 'My Orders'].map((link) => (
              <button
                key={link}
                onClick={() => handleLink(link.toLowerCase().replace(' ', '-'))}
                className="text-[#888888] text-[13px] leading-[2.2] hover:text-white transition-colors text-left"
              >
                {link}
              </button>
            ))}
          </div>
        </div>

        {/* COL 2 — COMPANY + PAYMENT QR */}
        <div>
          <h4 className="text-gold-primary text-[11px] font-bold uppercase tracking-[1.5px] mb-4">COMPANY</h4>
          <div className="grid grid-cols-1 gap-0">
            {['About Us', 'How It Works', 'Delivery Areas', 'Offers & Promotions', 'Reviews', 'FAQ', 'Contact'].map((link) => (
              <button
                key={link}
                onClick={() => handleLink(link.toLowerCase().replace(' ', '-'))}
                className="text-[#888888] text-[13px] leading-[2.2] hover:text-white transition-colors text-left"
              >
                {link}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-gold-primary text-[11px] font-bold uppercase tracking-[1.5px] mb-3">SCAN TO PAY</h4>
            <div className="flex gap-3">
              <div className="bg-white rounded-[8px] p-2 w-[90px] md:w-[90px] flex flex-col items-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOCO" alt="MOCO QR" className="w-full h-auto grayscale opacity-90" />
                <span className="text-black text-[10px] font-bold mt-1 uppercase">MOCO</span>
              </div>
              <div className="bg-white rounded-[8px] p-2 w-[90px] md:w-[90px] flex flex-col items-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FONEPAY" alt="FONEPAY QR" className="w-full h-auto grayscale opacity-90" />
                <span className="text-black text-[10px] font-bold mt-1 uppercase">FONEPAY</span>
              </div>
            </div>
          </div>
        </div>

        {/* COL 3 — GET CONNECTED + CONTACT */}
        <div>
          <h4 className="text-gold-primary text-[11px] font-bold uppercase tracking-[1.5px] mb-3">GET CONNECTED</h4>
          <div className="flex gap-3.5 mb-6">
            {[Facebook, Instagram, Send].map((Icon, i) => (
              <a key={i} href="#" className="p-2 border border-white/5 rounded-full text-[#888888] hover:text-gold-primary hover:border-gold-primary/30 transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>

          <h4 className="text-gold-primary text-[11px] font-bold uppercase tracking-[1.5px] mb-3">CONTACT US</h4>
          <div className="space-y-3.5">
            <div className="flex items-start gap-2 group cursor-default">
              <MapPin size={13} className="text-gold-primary shrink-0 mt-0.5" />
              <span className="text-[#888888] text-[12px] leading-[1.6] group-hover:text-white transition-colors">Jhyaap Station, Kathmandu</span>
            </div>
            <a href={`mailto:${STORE_INFO.email}`} className="flex items-start gap-2 group">
              <Mail size={13} className="text-gold-primary shrink-0 mt-0.5" />
              <span className="text-[#888888] text-[12px] leading-[1.6] group-hover:text-white transition-colors">{STORE_INFO.email}</span>
            </a>
            <a href={`tel:${STORE_INFO.phoneTel}`} className="flex items-start gap-2 group">
              <Phone size={13} className="text-gold-primary shrink-0 mt-0.5" />
              <span className="text-[#888888] text-[12px] leading-[1.6] group-hover:text-white transition-colors">{STORE_INFO.phone}</span>
            </a>
            <a href={`https://wa.me/${STORE_INFO.phoneTel}`} className="flex items-start gap-2 group">
              <MessageSquare size={13} className="text-gold-primary shrink-0 mt-0.5" />
              <span className="text-[#888888] text-[12px] leading-[1.6] group-hover:text-white transition-colors">WhatsApp: {STORE_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━
          MIDDLE SECTION — brand
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="p-[28px_40px] text-center border-b border-[#1A1A1A]">
        <div className="inline-flex items-center justify-center p-2 rounded-full border border-gold-primary mb-2.5">
          <img src="/logo-256.png" alt="Logo" className="w-[32px] h-[32px] object-contain rounded-full" />
        </div>
        <h2 className="text-white text-[15px] font-bold tracking-[2px] mb-1">JHYAAP STATION</h2>
        <p className="text-[#888888] text-[11px] tracking-[3px] uppercase">Raise Your Glass</p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━
          18+ DISCLAIMER BAR
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="p-5 md:p-[20px_40px] text-center border-b border-[#1A1A1A]">
        <h4 className="text-gold-primary text-[11px] font-bold uppercase tracking-[1.5px] mb-1.5">18+ ONLY · DRINK RESPONSIBLY</h4>
        <p className="text-[#555555] text-[12px] leading-[1.5] max-w-[480px] mx-auto">
          Notice: Spirits cannot be sold to minors under the age of 18. Consuming excessive amounts of alcohol is detrimental to health.
        </p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━
          BOTTOM BAR
          ━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col md:flex-row items-center justify-between p-[14px_40px] gap-2 md:gap-0 bg-[#080808]">
        <p className="text-[#444444] text-[12px]">© 2026 Jhyaap Station. All rights reserved.</p>
        <div className="flex gap-4">
          <button onClick={() => handleLink('terms')} className="text-[#444444] text-[12px] hover:text-white transition-colors">Terms & Conditions</button>
          <span className="text-[#222222]">·</span>
          <button onClick={() => handleLink('privacy')} className="text-[#444444] text-[12px] hover:text-white transition-colors">Privacy Policy</button>
        </div>
      </div>
    </footer>
  );
}
