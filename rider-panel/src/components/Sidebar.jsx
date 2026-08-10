import { NavLink, useNavigate } from 'react-router-dom'
import { authActions } from '../store/authStore'
import {
  LayoutDashboard,
  Package,
  WalletCards,
  User,
  Wallet,
  Gauge,
  Bell,
  LifeBuoy,
  Settings,
  Gift,
  LogOut,
  Bike,
} from 'lucide-react'

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/earnings', label: 'Earnings', icon: WalletCards },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/performance', label: 'Performance', icon: Gauge },
{ to: '/notifications-page', label: 'Notifications', icon: Bell },
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authActions.logout()
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#8a6410] text-white shadow-md">
          <Bike className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-extrabold tracking-tight text-[#1a1512]">Jhyaap</p>
          <p className="text-[11px] font-medium text-[#C9A84C]">Rider Panel</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Menu
        </p>
        <ul className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#C9A84C] text-[#0F0B08] shadow-sm'
                        : 'text-[#4b5563] hover:bg-[#C9A84C]/10 hover:text-[#8a6410]'
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>

        <p className="px-3 pb-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          More
        </p>
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/refer"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#C9A84C] text-[#0F0B08] shadow-sm'
                    : 'text-[#4b5563] hover:bg-[#C9A84C]/10 hover:text-[#8a6410]'
                }`
              }
            >
              <Gift className="h-[18px] w-[18px]" />
              Refer & Earn
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#4b5563] transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  )
}
