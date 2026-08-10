import { useState } from 'react';
import { ShieldCheck, XCircle } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

const STORAGE_KEY = 'jhyaap_age_verified';

export default function AgeConsentGate() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const [status, setStatus] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true' ? 'accepted' : 'pending';
  });

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setStatus('accepted');
  };

  if (status === 'accepted') {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-xl transition-colors duration-500 ${
      isLight ? 'bg-white/80' : 'bg-black/90'
    }`}>
      <div className={`w-full max-w-md rounded-[24px] p-8 text-center shadow-2xl transition-all duration-500 ${
        isLight 
          ? 'bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]' 
          : 'bg-gradient-to-b from-[#1A1A1A] to-[#121212] border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
      }`}>
        {status === 'blocked' ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
              isLight ? 'bg-red-50 text-red-500' : 'bg-red-500/10 text-red-400'
            }`}>
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className={`text-3xl font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Access Denied
            </h1>
            <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              You must be of legal drinking age (18+) to access this site. Please close this window.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
              isLight ? 'bg-amber-50 text-amber-500 shadow-sm' : 'bg-gold-primary/10 text-gold-primary'
            }`}>
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Are you 18 or older?
            </h1>
            <p className={`mt-3 text-sm leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              We sell alcohol. Nepali law requires you to be of legal drinking age. Our riders will verify your ID upon delivery.
            </p>
            
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button 
                onClick={accept} 
                className={`flex items-center justify-center rounded-xl py-3.5 font-bold transition-all active:scale-95 ${
                  isLight 
                    ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg' 
                    : 'bg-gold-primary text-black hover:bg-gold-primary/90 shadow-[0_0_15px_rgba(201,168,76,0.2)]'
                }`}
              >
                Yes, I am 18+
              </button>
              <button 
                onClick={() => setStatus('blocked')} 
                className={`flex items-center justify-center rounded-xl py-3.5 font-bold transition-all active:scale-95 ${
                  isLight 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                No, I am under 18
              </button>
            </div>
            
            <p className={`mt-6 text-[10px] uppercase tracking-widest font-semibold ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>
              Enjoy Responsibly
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

