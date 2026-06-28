import { NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH, adminPath } from '@/lib/adminRoutes';
import BrandLogo from '@/components/BrandLogo';

const links = [
  { to: ADMIN_BASE_PATH, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: adminPath('products'), label: 'Products', icon: Package },
  { to: adminPath('orders'), label: 'Orders', icon: ShoppingBag },
  { to: adminPath('categories'), label: 'Categories', icon: Tags },
  { to: adminPath('banners'), label: 'Banners', icon: Image },
  { to: adminPath('professionals'), label: 'Team', icon: Briefcase },
  { to: adminPath('users'), label: 'Customers', icon: Users },
  { to: adminPath('reports'), label: 'Reports', icon: BarChart3 },
  { to: adminPath('settings'), label: 'Settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const logout = useAdminStore((s) => s.logout);
  const displayName = useAdminStore((s) => s.displayName);
  const role = useAdminStore((s) => s.role);
  const username = useAdminStore((s) => s.username);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-950 via-night-900 to-night-950 text-night-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-white/10 bg-night-900/60 backdrop-blur-xl lg:flex animate-slide-up">
          <div className="border-b border-white/10 p-6 bg-gradient-to-r from-neon-amber/10 to-transparent">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" className="animate-float" />
              <div>
                <p className="font-display text-lg font-bold text-white">Admin Panel</p>
                <p className="text-xs text-neon-amber font-medium tracking-wide animate-pulse-slow">Jhyaap Station</p>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-night-800/80 to-night-800/40 p-4 border border-white/5 shadow-lg">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-amber to-amber-600 text-sm font-bold uppercase text-white shadow-lg shadow-neon-amber/20">
                {displayName.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="truncate text-xs text-night-400">@{username}</p>
                <span className="mt-1.5 inline-flex items-center rounded-full bg-neon-amber/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-amber border border-neon-amber/20">
                  {role}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-neon-amber/20 to-neon-amber/5 text-neon-amber border border-neon-amber/30 shadow-lg shadow-neon-amber/10 animate-glow'
                      : 'text-night-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                  }`
                }
              >
                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-2 border-t border-white/10 p-4">
            <button
              onClick={() => navigate('/')}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-night-400 hover:bg-white/5 hover:text-white transition-all duration-200 border border-transparent hover:border-white/10"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
              View store
            </button>
            <button
              onClick={() => {
                logout();
                navigate(ADMIN_LOGIN_PATH);
              }}
              className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-neon-rose hover:bg-neon-rose/10 hover:text-neon-rose transition-all duration-200 border border-transparent hover:border-neon-rose/20"
            >
              <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="hidden items-center justify-between border-b border-white/10 bg-night-950/80 backdrop-blur-xl px-8 py-4 lg:flex">
            <div className="flex items-center gap-4">
              <p className="text-sm text-night-400">
                Logged in as{' '}
                <span className="font-semibold text-white">{displayName}</span>
              </p>
              <span className="rounded-full bg-neon-amber/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-amber border border-neon-amber/20">
                {role}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-night-800/50 px-4 py-2 border border-white/10">
                <Shield className="h-4 w-4 text-neon-amber" />
                <span className="text-sm font-medium text-white">Admin Panel</span>
              </div>
            </div>
          </header>

          <header className="flex items-center justify-between border-b border-white/10 bg-night-950/80 backdrop-blur-xl px-4 py-4 lg:hidden">
            <div>
              <p className="font-display font-bold text-neon-amber text-lg">Admin</p>
              <p className="text-xs text-night-400">{displayName} · {role}</p>
            </div>
            <select
              className="input-field py-2.5 text-sm bg-night-800/50 border-white/10"
              onChange={(e) => navigate(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Menu
              </option>
              {links.map((l) => (
                <option key={l.to} value={l.to}>
                  {l.label}
                </option>
              ))}
            </select>
          </header>
          <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
