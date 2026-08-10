import { useEffect, useState } from 'react'
import OrderCard from '../components/OrderCard'
import { useAuthStore } from '../store/authStore'
import { Package, Search, PackageCheck, Timer, ClipboardList } from 'lucide-react'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

const tabs = [
  { id: 'available', label: 'Available' },
  { id: 'active', label: 'Active' },
  { id: 'history', label: 'History' },
]

export default function Orders() {
  const { rider, isAvailable } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('available')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
    if (!rider?.id) return
    setLoading(true)
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const response = await fetch(
        `${BACKEND_API_URL}/api/v1/orders/rider/${rider.id}?status=available,accepted,picked_up,out_for_delivery,delivered,cancelled`,
        { headers: token ? { Authorization: 'Bearer ' + token } : {} }
      )
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : data.orders || [])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider?.id, isAvailable])

  const availableOrders = orders.filter((o) => o.status === 'pending' || o.status === 'available')
  const activeOrders = orders.filter((o) => ['accepted', 'picked_up', 'out_for_delivery'].includes(o.status))
  const historyOrders = orders.filter((o) => ['delivered', 'cancelled'].includes(o.status))

  const stats = [
    { label: 'Available', value: availableOrders.length, icon: Package, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/15' },
    { label: 'Active', value: activeOrders.length, icon: Timer, color: 'text-blue-500', bg: 'bg-blue-500/15' },
    { label: 'Completed', value: historyOrders.filter((o) => o.status === 'delivered').length, icon: PackageCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
    { label: 'Total', value: orders.length, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-500/15' },
  ]

  let visibleOrders =
    activeTab === 'available' ? availableOrders
    : activeTab === 'active' ? activeOrders
    : historyOrders

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    visibleOrders = visibleOrders.filter((o) =>
      String(o.id).toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.address?.street || o.address || '').toLowerCase().includes(q)
    )
  }

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6">
        <h1 className="text-lg font-bold tracking-tight mb-1">Orders</h1>
        <p className="text-xs text-gray-400">Manage and track your deliveries</p>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rider-card p-4">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer or address"
          className="w-full bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-500"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
        {tabs.map((tab) => {
          const count =
            tab.id === 'available' ? availableOrders.length
            : tab.id === 'active' ? activeOrders.length
            : historyOrders.length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center rounded-xl px-2 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-[#C9A84C] text-[#0F0B08] shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] ${activeTab === tab.id ? 'text-[#0F0B08]/70' : 'text-gray-500'}`}>
                {count} {count === 1 ? 'order' : 'orders'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Orders */}
      {loading ? (
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
            {search.trim()
              ? 'No orders match your search.'
              : activeTab === 'available'
                ? 'No available orders right now.'
                : activeTab === 'active'
                  ? 'No active deliveries.'
                  : 'No order history yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
