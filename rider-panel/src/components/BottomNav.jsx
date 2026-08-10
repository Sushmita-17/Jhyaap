import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authActions } from '../store/authStore'
import {
  Package,
  WalletCards,
  User,
  LogOut,
  LayoutDashboard,
  Wallet,
  Gauge,
  Bell,
  LifeBuoy,
  Settings,
  Gift,
  ChevronRight,
  X,
} from 'lucide-react'

const primaryNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: Package },
  { to: '/earnings', label: 'Earnings', icon: WalletCards },
]

const profileMenu = [
  { to: '/profile', label: 'Profile Information', icon: User },
  { to: '/profile', label: 'Vehicle Details', icon: Package },
  { to: '/profile', label: 'Documents', icon: Package },
  { to: '/profile', label: 'Bank & Payment', icon: Wallet },
  { to: '/profile', label: 'Emergency Contact', icon: User },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/performance', label: 'Performance', icon: Gauge },
{ to: '/notifications-page', label: 'Notifications', icon: Bell },
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/refer', label: 'Refer & Earn', icon: Gift },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname.startsWith('/dashboard')
    if (path === '/orders') return location.pathname.startsWith('/orders')
    if (path === '/earnings') return location.pathname.startsWith('/earnings')
    return false
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    await authActions.logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="rider-nav fixed bottom-0 left-0 right-0 z-[1100] px-4 py-2 lg:hidden">
        <div className="mx-auto flex items-center justify-around max-w-lg">
          {primaryNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rider-nav-item ${isActive(item.to) ? 'is-active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
          {/* Profile button opens the menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`rider-nav-item ${location.pathname.startsWith('/profile') ? 'is-active' : ''}`}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Profile menu — bottom sheet exposing ALL secondary sections */}
      {menuOpen && (
        <div className="fixed inset-0 z-[1300] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[#2a221c] bg-white p-5 shadow-2xl animate-slide-up">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-base font-extrabold tracking-tight text-[#1a1512]">My Account</p>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-xs text-gray-400">Everything available on desktop, right in your pocket.</p>

            <p className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">My Profile</p>
            <div className="mb-3 space-y-1">
              {profileMenu.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-2 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#C9A84C]/10 hover:text-[#8a6410]"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-[18px] w-[18px] text-[#C9A84C]" />
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                )
              })}
            </div>

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-[18px] w-[18px]" />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  )
}
