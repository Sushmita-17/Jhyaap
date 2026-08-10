import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EarningsSummaryCard from '../components/EarningsSummaryCard'
import OrderCard from '../components/OrderCard'
import ThemeToggle from '../components/ThemeToggle'
import AvailabilitySwitch from '../components/AvailabilitySwitch'
import { useAuthStore } from '../store/authStore'
import { getTodayRange } from '../utils/dateUtils'
import { calculateTotal, formatCurrency } from '../utils/earningsExport'
import {
  Star,
  Bike,
  Package,
  CheckCircle2,
  TrendingUp,
  Clock,
  MapPin,
  Wallet,
  Bell,
  LifeBuoy,
  User,
  Gauge,
  ChevronRight,
  Percent,
  Award,
} from 'lucide-react'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

const performanceCards = [
  { id: 'deliveries', label: 'Total Deliveries', value: '0', icon: Package, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/15' },
  { id: 'completion', label: 'Completion Rate', value: '100%', icon: Percent, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
  { id: 'rating', label: 'Average Rating', value: '4.8', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/15' },
  { id: 'earnings', label: 'Total Earnings', value: 'NPR 0', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/15' },
]

const quickActions = [
  { to: '/wallet', label: 'My Wallet', icon: Wallet },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/support', label: 'Support', icon: LifeBuoy },
  { to: '/profile', label: 'View Profile', icon: User },
  { to: '/performance', label: 'Performance', icon: Gauge },
]

const recentActivity = [
  { id: 1, title: 'Joined as Rider', time: '2 months ago', type: 'success' },
  { id: 2, title: 'Document Verified', time: '1 month ago', type: 'info' },
  { id: 3, title: 'Bank Details Verified', time: '3 weeks ago', type: 'info' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { rider, isAvailable, loading: authLoading } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [earnings, setEarnings] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeFilter, setActiveFilter] = useState('available') // 'available' | 'active' | 'history'

  const fetchOrders = async () => {
    if (!rider?.id) return
    setLoadingOrders(true)
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const response = await fetch(
        `${BACKEND_API_URL}/api/v1/orders/rider/${rider.id}?status=available,accepted,picked_up,out_for_delivery`,
        { headers: token ? { Authorization: 'Bearer ' + token } : {} }
      )
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : data.orders || [])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchEarnings = async () => {
    if (!rider?.id) return
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const { start, end } = getTodayRange()
      const response = await fetch(
        `${BACKEND_API_URL}/api/v1/earnings/rider/${rider.id}?start_date=${start.toISOString()}&end_date=${end.toISOString()}`,
        { headers: token ? { Authorization: 'Bearer ' + token } : {} }
      )
      if (response.ok) {
        const data = await response.json()
        setEarnings(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching earnings:', err)
    }
  }

  useEffect(() => {
    if (rider?.id) {
      fetchOrders()
      fetchEarnings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider?.id, isAvailable])

  if (authLoading) {
    return <div className="rider-page p-6 text-gray-400 text-sm">Initializing...</div>
  }

  const todayTotal = calculateTotal(earnings)

  const availableOrders = orders.filter((o) => o.status === 'pending' || o.status === 'available')
  const activeOrders = orders.filter((o) => ['accepted', 'picked_up', 'out_for_delivery'].includes(o.status))
  const historyOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status))

  const visibleOrders =
    activeFilter === 'available' ? availableOrders
    : activeFilter === 'active' ? activeOrders
    : historyOrders

  return (
    <div className="rider-page pb-24 lg:pb-8">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8a6410] text-lg font-black text-[#0F0B08] shadow-lg">
              {(rider?.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Rider')[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">{rider?.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Rider'}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Bike className="h-3 w-3" />
                  {rider?.vehicle_type || 'Scooter'}
                </span>
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {rider?.rating ? Number(rider.rating).toFixed(1) : '4.8'}
                </span>
              </div>
            </div>
          </div>

{/* Original availability switch + order-notification bell + theme toggle — top-right */}
          <div className="flex shrink-0 items-center gap-2">
            <AvailabilitySwitch />
            <button
              onClick={() => navigate('/notifications-page')}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white text-gray-600 shadow-sm transition hover:text-[#8a6410]"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {availableOrders.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9A84C] px-1 text-[9px] font-bold text-[#0F0B08]">
                  {availableOrders.length}
                </span>
              )}
            </button>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Earnings Summary */}
      <div className="mb-6">
        <EarningsSummaryCard earnings={earnings} period="Today" />
      </div>

      {/* Performance Cards */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Performance</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {performanceCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.id} className="rider-card p-4">
                <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-lg font-bold">{card.value}</p>
                <p className="text-[11px] text-gray-400">{card.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
        {[
          { id: 'available', label: 'Available', count: availableOrders.length },
          { id: 'active', label: 'Active', count: activeOrders.length },
          { id: 'history', label: 'History', count: historyOrders.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex flex-col items-center rounded-xl px-2 py-2 text-xs font-bold transition ${
              activeFilter === tab.id
                ? 'bg-[#C9A84C] text-[#0F0B08] shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] ${activeFilter === tab.id ? 'text-[#0F0B08]/70' : 'text-gray-500'}`}>
              {tab.count} {tab.count === 1 ? 'order' : 'orders'}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loadingOrders ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rider-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="rider-card p-6 text-center">
          <p className="text-sm text-gray-400">
            {activeFilter === 'available'
              ? 'No available orders right now.'
              : activeFilter === 'active'
                ? 'No active deliveries.'
                : 'No past deliveries yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Today's Summary */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Today's Summary</h2>
        <div className="rider-card p-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{formatCurrency(todayTotal)}</p>
                <p className="text-[11px] text-gray-400">Earnings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{earnings.length}</p>
                <p className="text-[11px] text-gray-400">Deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">0h 0m</p>
                <p className="text-[11px] text-gray-400">Time Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">0 km</p>
                <p className="text-[11px] text-gray-400">Distance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Completion + Quick Actions */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rider-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Profile Completion</h3>
            <span className="rounded-full bg-[#C9A84C]/15 px-2.5 py-1 text-xs font-bold text-[#C9A84C]">85%</span>
          </div>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#D9B85C]" style={{ width: '85%' }} />
          </div>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Personal Information
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Vehicle Details
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Documents Verified
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Bank Details
            </li>
            <li className="flex items-center gap-2 text-amber-400">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-400" /> Add Profile Photo
            </li>
          </ul>
          <Link
            to="/profile"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-2.5 text-sm font-bold text-[#0F0B08] transition hover:bg-[#D9B85C]"
          >
            Complete Profile <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rider-card p-5">
          <h3 className="mb-3 text-sm font-bold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-center transition hover:border-[#C9A84C]/40 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5 text-[#C9A84C]" />
                  <span className="text-xs font-semibold text-gray-300">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Recent Activity</h2>
        <div className="rider-card divide-y divide-white/5">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                activity.type === 'success' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-blue-500/15 text-blue-500'
              }`}>
                {activity.type === 'success'
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <TrendingUp className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{activity.title}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
