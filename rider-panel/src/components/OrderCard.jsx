import { useNavigate } from 'react-router-dom'
import { getRelativeTime, paymentMethodBadge } from '../utils/timeUtils'
import { MapPin, ChevronRight } from 'lucide-react'

const statusColors = {
  pending: 'bg-gray-700/40 text-gray-300 border-gray-600',
  available: 'bg-blue-900/40 text-blue-300 border-blue-700',
  accepted: 'bg-blue-900/40 text-blue-300 border-blue-700',
  preparing: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  out_for_delivery: 'bg-orange-900/40 text-orange-300 border-orange-700',
  picked_up: 'bg-orange-900/40 text-orange-300 border-orange-700',
  delivered: 'bg-green-900/40 text-green-300 border-green-700',
  cancelled: 'bg-red-900/40 text-red-300 border-red-700',
}

export default function OrderCard({ order }) {
  const navigate = useNavigate()
  const method = order.payment_method || order.payment || 'cod'
  const methodBadge = paymentMethodBadge(method)
  const displayTotal = order.total_amount ?? order.total ?? order.total_price ?? 0
  const status = order.status
  const delivered = status === 'delivered'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/order/${order.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/order/${order.id}`)
      }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A84C]/50 hover:shadow-xl"
    >
      {/* Top accent line */}
      <div className={`absolute inset-x-0 top-0 h-1 ${delivered ? 'bg-emerald-500' : 'bg-[#C9A84C]'}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-gray-100">Order #{String(order.id).slice(0, 8)}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${statusColors[status] || 'rider-status rider-status-pending'}`}>
              {status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {order.customer_name || order.customer?.name || 'Customer'}
          </div>
        </div>

        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[#C9A84C]" />
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-sm text-gray-400">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A84C]/70" />
        <span className="min-w-0">
          <span className="block truncate">{order.address?.street || order.address || 'Pickup at store'}</span>
          {order.address?.landmark ? (
            <span className="block truncate text-gray-500">{order.address.landmark}</span>
          ) : null}
        </span>
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${methodBadge.bg} ${methodBadge.text}`}>
            <span>{methodBadge.icon}</span>
            <span className="uppercase">{method?.toUpperCase()}</span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-bold text-[#C9A84C]">NPR {Number(displayTotal || 0).toLocaleString()}</span>
          <span className="text-[10px] text-gray-500">{getRelativeTime(order.created_at || order.createdAt || order.created)}</span>
        </div>
      </div>
    </div>
  )
}

