import { useState } from 'react';
import { Save, Bell, Lock, Store, Clock, Truck, CreditCard, Sun, Moon } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const isLight = theme === 'light';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-6 shadow-2xl shadow-[#C9A84C]/20 animate-gradient-x bg-[length:200%_200%] backdrop-blur-xl relative overflow-hidden ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="relative">
          <h1 className={`font-display text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>Settings</h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Configure your Jhyaap Station store</p>
        </div>
        <button
          onClick={handleSave}
          className="relative inline-flex items-center gap-2 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/15 px-6 py-3 text-sm font-bold text-[#C9A84C] transition-all hover:bg-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:scale-105 animate-glow"
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className={`panel p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 mb-6">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
              {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Appearance</h2>
          </div>
          <div className="relative space-y-4">
            <div className={`flex items-center justify-between rounded-xl border p-4 hover:border-[#C9A84C]/50 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
              isLight 
                ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                : 'border-white/10 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/50'
            }`}>
              <div>
                <span className={`text-sm font-medium group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>Theme</span>
                <p className={`text-xs mt-1 group-hover:text-[#666666] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                  {theme === 'light' ? 'Light mode with golden accents' : 'Dark mode with golden accents'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="relative inline-flex items-center gap-2 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/15 px-4 py-2 text-sm font-bold text-[#C9A84C] transition-all hover:bg-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:scale-105"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
              </button>
            </div>
          </div>
        </div>

        {/* Store Settings */}
        <div className={`panel p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 mb-6">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
              <Store className="h-5 w-5" />
            </span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Store Information</h2>
          </div>
          <div className="relative space-y-4">
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Store Name</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="Jhyaap Station" />
            </div>
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Location</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="Jhyaap Station, Kathmandu" />
            </div>
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Contact Phone</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="+977 98XXXXXXXX" />
            </div>
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Email</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="info@jhyaapstation.com" />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className={`panel p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 mb-6">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
              <Truck className="h-5 w-5" />
            </span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Delivery Settings</h2>
          </div>
          <div className="relative space-y-4">
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Delivery Fee (Rs)</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="100" type="number" />
            </div>
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Free Delivery Minimum (Rs)</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="2000" type="number" />
            </div>
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Estimated Delivery Time</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="30-45 minutes" />
            </div>
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Delivery Radius (km)</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} defaultValue="5" type="number" />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className={`panel p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 mb-6">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
              <Clock className="h-5 w-5" />
            </span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Operating Hours</h2>
          </div>
          <div className="relative space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
              <div key={day} className={`flex items-center gap-4 p-2 rounded-lg transition-colors ${
                isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.03]'
              }`} style={{ animationDelay: `${index * 50}ms` }}>
                <span className={`w-28 text-sm font-medium ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>{day}</span>
                <input className={`input-field flex-1 backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                  isLight 
                    ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                    : 'bg-[#1A1A1A]/80 border-white/10 text-white'
                }`} defaultValue="10:00 AM" />
                <span className={`text-[#666666] ${isLight ? 'text-gray-400' : ''}`}>to</span>
                <input className={`input-field flex-1 backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                  isLight 
                    ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                    : 'bg-[#1A1A1A]/80 border-white/10 text-white'
                }`} defaultValue="10:00 PM" />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className={`panel p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 mb-6">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
              <CreditCard className="h-5 w-5" />
            </span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Payment Methods</h2>
          </div>
          <div className="relative space-y-3">
            {[
              { name: 'Cash on Delivery', enabled: true },
              { name: 'eSewa', enabled: true },
              { name: 'Khalti', enabled: true },
              { name: 'Fonepay', enabled: false },
              { name: 'Credit/Debit Card', enabled: false },
            ].map((method, index) => (
              <div key={method.name} className={`flex items-center justify-between rounded-xl border p-4 hover:border-[#C9A84C]/50 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
                isLight 
                  ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                  : 'border-white/10 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/50'
              }`} style={{ animationDelay: `${index * 50}ms` }}>
                <span className={`text-sm font-medium group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{method.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                  <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C] peer-checked:shadow-lg peer-checked:shadow-[#C9A84C]/30 ${
                    isLight ? 'bg-gray-300' : 'bg-[#1A1A1A]'
                  }`} />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className={`panel p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 mb-6">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
              <Bell className="h-5 w-5" />
            </span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Notifications</h2>
          </div>
          <div className="relative space-y-3">
            {[
              { name: 'New order alerts', enabled: true },
              { name: 'Low stock warnings', enabled: true },
              { name: 'Customer messages', enabled: true },
              { name: 'Daily sales report', enabled: false },
              { name: 'Weekly analytics', enabled: false },
            ].map((notif, index) => (
              <div key={notif.name} className={`flex items-center justify-between rounded-xl border p-4 hover:border-[#C9A84C]/50 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
                isLight 
                  ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                  : 'border-white/10 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/50'
              }`} style={{ animationDelay: `${index * 50}ms` }}>
                <span className={`text-sm font-medium group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{notif.name}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                  <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C] peer-checked:shadow-lg peer-checked:shadow-[#C9A84C]/30 ${
                    isLight ? 'bg-gray-300' : 'bg-[#1A1A1A]'
                  }`} />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className={`panel p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 mb-6">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-float">
              <Lock className="h-5 w-5" />
            </span>
            <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Security</h2>
          </div>
          <div className="relative space-y-4">
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Change Admin Password</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} type="password" placeholder="New password" />
            </div>
            <div>
              <label className={`mb-2 block text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Confirm Password</label>
              <input className={`input-field w-full backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                isLight 
                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                  : 'bg-[#1A1A1A]/80 border-white/10 text-white'
              }`} type="password" placeholder="Confirm new password" />
            </div>
            <div className={`flex items-center justify-between rounded-xl border p-4 hover:border-[#C9A84C]/50 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
              isLight 
                ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' 
                : 'border-white/10 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/50'
            }`}>
              <div>
                <span className={`text-sm font-medium group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>Two-Factor Authentication</span>
                <p className={`text-xs mt-1 group-hover:text-[#666666] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Add extra security to your admin account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A84C] peer-checked:shadow-lg peer-checked:shadow-[#C9A84C]/30 ${
                  isLight ? 'bg-gray-300' : 'bg-[#1A1A1A]'
                }`} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

