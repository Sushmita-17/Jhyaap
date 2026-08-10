import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'
import { Package, Clock, MapPin, LogIn } from 'lucide-react'

export default function PublicNotifications() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  useEffect(() => {
    let active = true;
    fetch(`${BACKEND_API_URL}/api/v1/orders`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load orders')))
      .then((data) => {
        if (!active) return;
        setOrders((Array.isArray(data) ? data : []).map((order) => ({
          ...order,
          customer_name: order.customer?.name || order.customer_name || 'Customer',
          address: typeof order.address === 'object' ? order.address : { street: order.delivery_address || 'Unknown location' },
          total_amount: order.total_amount ?? order.total ?? 0,
          payment_status: order.payment_status || 'unpaid',
        })));
        setLastRefreshed(new Date());
      })
      .catch(() => { if (active) { setOrders([]); setLastRefreshed(new Date()); } });
    return () => { active = false; };
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-[#0F0B08] pb-20">
      {/* Header */}
      <div className="rider-card p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1 tracking-tight">Live Order Feed</h1>
            <p className="text-sm text-gray-400">Real-time delivery notifications</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-[#C9A84C] text-[#0F0B08] rounded-lg text-sm font-semibold hover:bg-[#b8973b] transition flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Rider Login
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Live Orders */}
      <div className="px-4 space-y-3">
        {orders.length === 0 ? <div className="rider-card p-8 text-center text-sm text-gray-400">No live orders available.</div> : orders.map((order) => (
          <div key={order.id} className="rider-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{order.customer_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{order.address.street}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Rs {order.total_amount}</span>
                  <span>•</span>
                  <span>{formatTime(order.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2a221c]">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Package className="w-3 h-3" />
                <span>Order #{order.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {order.payment_status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center px-4">
        <p className="text-xs text-gray-500 mb-2">
          Want to accept orders and earn money?
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-[#C9A84C] text-[#0F0B08] rounded-lg text-sm font-semibold hover:bg-[#b8973b] transition"
        >
          Join as Rider
        </button>
      </div>
    </div>
  )
}


