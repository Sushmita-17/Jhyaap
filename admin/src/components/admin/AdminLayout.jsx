import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Image,
  LogOut,
  ArrowLeft,
  Shield,
  BarChart3,
  Users,
  Settings,
  Briefcase,
  Bell,
  Flame,
  Zap,
  Percent,
  Truck,
  Bike,
  Warehouse,
  TrendingUp,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH, adminPath } from '@/lib/adminRoutes';
import BrandLogo from '@/components/BrandLogo';
import { useNotificationStore } from '@/store/notificationStore';
import { useThemeStore } from '@/store/themeStore';

const links = [
  { to: ADMIN_BASE_PATH, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: adminPath('products'), label: 'Products', icon: Package },
  { to: adminPath('orders'), label: 'Orders', icon: ShoppingBag },
  { to: adminPath('trending'), label: 'Trending', icon: Flame },
  { to: adminPath('flash-sale'), label: 'Flash Sale', icon: Zap },
  { to: adminPath('delivery'), label: 'Delivery', icon: Truck },
  { to: adminPath('riders'), label: 'Riders', icon: Bike },
  { to: adminPath('categories'), label: 'Categories', icon: Tags },
  { to: adminPath('banners'), label: 'Banners', icon: Image },
  { to: adminPath('coupons'), label: 'Coupons', icon: Percent },
  { to: adminPath('professionals'), label: 'Team', icon: Briefcase },
  { to: adminPath('users'), label: 'Customers', icon: Users },
  { to: adminPath('reports'), label: 'Reports', icon: BarChart3 },
  { to: adminPath('settings'), label: 'Settings', icon: Settings },

];

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth();
  const displayName = user?.name || 'Admin';
  const role = user?.role || 'admin';
  const username = user?.email?.split('@')[0] || 'admin';
  const navigate = useNavigate();
  const { unreadCount, markAllAsRead } = useNotificationStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useThemeStore();

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen text-white relative overflow-hidden transition-colors duration-300 ${
      isLight 
        ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900' 
        : 'bg-gradient-to-br from-[#0a0f1a] via-[#0d121d] to-[#0a0f1a]'
    }`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#C9A84C]/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>
      
      <div className="flex min-h-screen relative z-10">
        {/* Desktop Sidebar */}
        <aside className={`hidden w-80 flex-shrink-0 flex-col border-r backdrop-blur-2xl lg:flex animate-slide-up shadow-2xl shadow-[#C9A84C]/10 ${
          isLight 
            ? 'border-gray-200 bg-white/95' 
            : 'border-white/10 bg-gradient-to-b from-[#0D0D0D]/95 to-[#080808]/95'
        }`}>
          <div className={`border-b p-6 bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/10 to-transparent relative overflow-hidden ${
            isLight ? 'border-gray-200' : 'border-white/10'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <BrandLogo size="sm" className="animate-float" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 animate-pulse shadow-lg shadow-green-500/50 ${
                  isLight ? 'border-white' : 'border-[#0D0D0D]'
                }`} />
              </div>
              <div>
                <p className={`font-display text-lg font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
                  isLight 
                    ? 'text-gray-900 from-gray-900 to-gray-700' 
                    : 'text-white from-white to-white/80'
                }`}>Admin Panel</p>
                <p className="text-xs text-[#C9A84C] font-medium tracking-wide animate-pulse-slow">Jhyaap Station</p>
              </div>
            </div>
          </div>

          <div className={`border-b p-5 relative overflow-hidden ${
            isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-[#0A0A0A]/50'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className={`relative flex items-center gap-4 rounded-2xl p-4 border shadow-xl shadow-[#C9A84C]/10 backdrop-blur-sm hover:shadow-[#C9A84C]/20 transition-all duration-300 hover:scale-[1.02] hover:border-[#C9A84C]/30 ${
              isLight 
                ? 'bg-white border-gray-200' 
                : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
            }`}>
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#A68B3D] text-lg font-bold uppercase text-white shadow-lg shadow-[#C9A84C]/30 animate-glow">
                {displayName.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className={`truncate text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{displayName}</p>
                <p className={`truncate text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>@{username}</p>
                <span className="mt-2 inline-flex items-center rounded-full bg-[#C9A84C]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] border border-[#C9A84C]/30 animate-pulse-slow">
                  {role}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C9A84C]/20 to-[#C9A84C]/5 text-[#C9A84C] border border-[#C9A84C]/30 shadow-lg shadow-[#C9A84C]/10'
                      : isLight
                        ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-300'
                        : 'text-[#888888] hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                  }`
                }
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                <span className="relative z-10">
                  {label}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className={`space-y-2 border-t p-4 relative overflow-hidden ${
            isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-[#0A0A0A]/30'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#C9A84C]/5 to-transparent" />
            <button
              onClick={() => navigate('/')}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 border hover:shadow-lg ${
                isLight 
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent hover:border-gray-300 hover:shadow-gray-200' 
                  : 'text-[#888888] hover:bg-white/5 hover:text-white border-transparent hover:border-white/10 hover:shadow-white/5'
              }`}
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>View store</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate(ADMIN_LOGIN_PATH);
              }}
              className="group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20 hover:shadow-lg hover:shadow-red-500/10"
            >
              <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className={`fixed inset-y-0 left-0 w-80 max-h-screen flex-shrink-0 flex-col border-r backdrop-blur-2xl z-50 lg:hidden animate-slide-in-right shadow-2xl shadow-[#C9A84C]/10 overflow-hidden ${
              isLight 
                ? 'border-gray-200 bg-white/95' 
                : 'border-white/10 bg-gradient-to-b from-[#0D0D0D]/95 to-[#080808]/95'
            }`}>
              <div className={`border-b p-3 bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C]/10 to-transparent relative overflow-hidden flex items-center justify-between ${
                isLight ? 'border-gray-200' : 'border-white/10'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                <div className="relative flex items-center gap-2">
                  <div className="relative">
                    <BrandLogo size="sm" className="animate-float" />
                    <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 animate-pulse shadow-lg shadow-green-500/50 ${
                      isLight ? 'border-white' : 'border-[#0D0D0D]'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-display text-sm font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
                      isLight 
                        ? 'text-gray-900 from-gray-900 to-gray-700' 
                        : 'text-white from-white to-white/80'
                    }`}>Admin Panel</p>
                    <p className="text-[9px] text-[#C9A84C] font-medium tracking-wide animate-pulse-slow">Jhyaap Station</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg p-1 transition-colors border-none bg-transparent cursor-pointer ${
                    isLight ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className={`border-b p-2 relative overflow-hidden ${
                isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-[#0A0A0A]/50'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative flex items-center gap-2 rounded-lg p-2 border shadow-xl shadow-[#C9A84C]/10 backdrop-blur-sm ${
                  isLight 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
                }`}>
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#A68B3D] text-xs font-bold uppercase text-white shadow-lg shadow-[#C9A84C]/30 animate-glow">
                    {displayName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className={`truncate text-[11px] font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{displayName}</p>
                    <p className={`truncate text-[9px] ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>@{username}</p>
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-[#C9A84C]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#C9A84C] border border-[#C9A84C]/30 animate-pulse-slow">
                      {role}
                    </span>
                  </div>
                </div>
              </div>

              <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto overflow-x-hidden">
                {links.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-[#C9A84C]/20 to-[#C9A84C]/5 text-[#C9A84C] border border-[#C9A84C]/30 shadow-lg shadow-[#C9A84C]/10'
                          : isLight
                            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-300'
                            : 'text-[#888888] hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                      }`
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                    <span className="relative z-10">
                      {label}
                    </span>
                  </NavLink>
                ))}
              </nav>

              <div className={`space-y-0.5 border-t p-2 relative overflow-hidden ${
                isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-[#0A0A0A]/30'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#C9A84C]/5 to-transparent" />
                <button
                  onClick={() => {
                    navigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-all duration-300 border hover:shadow-lg ${
                    isLight 
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent hover:border-gray-300 hover:shadow-gray-200' 
                      : 'text-[#888888] hover:bg-white/5 hover:text-white border-transparent hover:border-white/10 hover:shadow-white/5'
                  }`}
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                  <span>View store</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate(ADMIN_LOGIN_PATH);
                    setMobileMenuOpen(false);
                  }}
                  className="group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20 hover:shadow-lg hover:shadow-red-500/10"
                >
                  <LogOut className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
                  <span>Log out</span>
                </button>
              </div>
            </aside>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`hidden items-center justify-between border-b backdrop-blur-2xl px-8 py-4 lg:flex shadow-lg shadow-[#C9A84C]/5 relative overflow-hidden ${
            isLight 
              ? 'border-gray-200 bg-white/95' 
              : 'border-white/10 bg-gradient-to-r from-[#0D0D0D]/95 to-[#0A0A0A]/95'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
                  Logged in as{' '}
                  <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{displayName}</span>
                </p>
              </div>
              <span className="rounded-full bg-[#C9A84C]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] border border-[#C9A84C]/30 animate-pulse-slow shadow-lg shadow-[#C9A84C]/20">
                {role}
              </span>
            </div>
            <div className="relative flex items-center gap-4">
              <div className="text-right">
                <p className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Current Time</p>
                <p className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{new Date().toLocaleTimeString()}</p>
              </div>
              <div className={`h-8 w-px ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
              <div className="flex items-center gap-2">
                {/* Theme Toggle Switch */}
                <button
                  onClick={() => useThemeStore.getState().setTheme(isLight ? 'dark' : 'light')}
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
              </div>
              <div className={`h-8 w-px ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
              <button
                onClick={() => {
                  navigate(adminPath('orders'));
                  markAllAsRead();
                }}
                className={`relative rounded-xl backdrop-blur-sm p-2.5 border transition-all hover:shadow-lg hover:scale-110 cursor-pointer ${
                  isLight 
                    ? 'bg-gray-100 border-gray-200 hover:border-[#C9A84C]/50 hover:shadow-[#C9A84C]/20' 
                    : 'bg-[#1A1A1A]/80 border-white/10 hover:border-[#C9A84C]/50 hover:shadow-[#C9A84C]/20'
                }`}
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4 text-[#C9A84C] animate-swing" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-gradient-to-r from-[#C9A84C] to-[#A68B3D] text-black text-[10px] font-bold leading-[18px] text-center animate-pulse shadow-lg shadow-[#C9A84C]/50">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A84C]/15 to-[#C9A84C]/5 px-4 py-2 border border-[#C9A84C]/30 shadow-lg shadow-[#C9A84C]/10 hover:shadow-[#C9A84C]/20 transition-all hover:scale-105">
                <Shield className="h-4 w-4 text-[#C9A84C] animate-pulse-slow" />
                <span className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Admin Panel</span>
              </div>
            </div>
          </header>

          <header className={`flex items-center justify-between border-b backdrop-blur-2xl px-4 py-3 lg:hidden relative overflow-hidden ${
            isLight 
              ? 'border-gray-200 bg-white/95' 
              : 'border-white/10 bg-gradient-to-r from-[#0D0D0D]/95 to-[#0A0A0A]/95'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/5 to-transparent" />
            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`rounded-lg p-2.5 transition-colors border-none bg-transparent cursor-pointer ${
                  isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#A68B3D] flex items-center justify-center shadow-lg shadow-[#C9A84C]/30 animate-glow">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className={`font-display font-bold text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>Admin</p>
                  <p className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{displayName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle Switch */}
              <button
                onClick={() => useThemeStore.getState().setTheme(isLight ? 'dark' : 'light')}
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
              <button
                onClick={() => {
                  navigate(adminPath('orders'));
                  markAllAsRead();
                }}
                className={`relative rounded-xl backdrop-blur-sm p-2 border transition-all hover:shadow-lg ${
                  isLight 
                    ? 'bg-gray-100 border-gray-200 hover:border-[#C9A84C]/50 hover:shadow-[#C9A84C]/20' 
                    : 'bg-[#1A1A1A]/80 border-white/10 hover:border-[#C9A84C]/50 hover:shadow-[#C9A84C]/20'
                }`}
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4 text-[#C9A84C] animate-swing" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[4px] rounded-full bg-gradient-to-r from-[#C9A84C] to-[#A68B3D] text-black text-[9px] font-bold leading-[16px] text-center animate-pulse shadow-lg shadow-[#C9A84C]/50">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}

