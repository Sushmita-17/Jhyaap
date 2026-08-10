import { Award, CheckCircle2, Clock, MapPin, Package, Percent, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { getLast3MonthsRange } from '../utils/dateUtils'
import { calculateTotal, formatCurrency } from '../utils/earningsExport'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

const metrics = [
  { id: 'total', label: 'Total Deliveries', valueKey: 'total', icon: Package, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/15' },
  { id: 'completed', label: 'Completed', valueKey: 'completed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
  { id: 'cancelled', label: 'Cancelled', valueKey: 'cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/15' },
  { id: 'completion', label: 'Completion Rate', valueKey: 'completion', icon: Percent, color: 'text-blue-500', bg: 'bg-blue-500/15' },
  { id: 'rating', label: 'Average Rating', valueKey: 'rating', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/15' },
  { id: 'distance', label: 'Distance', valueKey: 'distance', icon: MapPin, color: 'text-purple-500', bg: 'bg-purple-500/15' },
  { id: 'time', label: 'Time Online', valueKey: 'time', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/15' },
]

export default function Performance() {
  const { rider } = useAuthStore()
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    if (!rider?.id) return
    setLoading(true)
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const { start, end } = getLast3MonthsRange()
      const res = await fetch(
        `${BACKEND_API_URL}/api/v1/earnings/rider/${rider.id}?start_date=${start.toISOString()}&end_date=${end.toISOString()}`,
        { headers: token ? { Authorization: 'Bearer ' + token } : {} }
      )
      if (res.ok) {
        const data = await res.json()
        setEarnings(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching performance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rider?.id])

  const total = earnings.length
  const completed = earnings.filter((e) => e.status === 'completed' || e.status === 'delivered').length || total
  const cancelled = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100
  const totalEarnings = calculateTotal(earnings)
  const rating = rider?.rating ? Number(rider.rating).toFixed(1) : '4.8'

  const values = {
    total: String(total),
    completed: String(completed),
    cancelled: String(cancelled),
    completion: `${completionRate}%`,
    rating,
    distance: '0 km',
    time: '0h 0m',
  }

  return (
    <div className="rider-page pb-24 lg:pb-8">
      <header className="mb-6">
        <h1 className="text-lg font-bold tracking-tight mb-1">Performance</h1>
        <p className="text-xs text-gray-400">Your delivery performance metrics</p>
      </header>

      {/* Summary */}
      <div className="mb-6 relative overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-br from-[#C9A84C]/25 via-[#C9A84C]/5 to-transparent p-5 shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#C9A84C]/20 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-medium text-[#C9A84C]">Total Earnings (3 months)</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#C9A84C]">{formatCurrency(totalEarnings)}</p>
          <p className="mt-1 text-xs text-gray-400">{total} deliveries in the last 3 months</p>
        </div>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rider-card p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.id} className="rider-card p-4">
                <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${metric.bg} ${metric.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-lg font-bold">{values[metric.valueKey]}</p>
                <p className="text-[11px] text-gray-400">{metric.label}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
