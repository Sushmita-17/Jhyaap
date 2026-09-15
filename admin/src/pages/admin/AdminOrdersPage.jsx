import { useEffect } from 'react';
import { useOrdersStore } from '@/store/ordersStore';
// Type imports removed - these are JSDoc type definitions only, not actual exports
import LiveOrderTrackingPanel from '@/components/tracking/LiveOrderTrackingPanel';
import { Radio } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';
import { getBackendOrders } from '@/lib/backendAPI';

const STATUS_OPTIONS = [
  'placed',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'picked_up',
  'delivered',
  'cancelled',
];

export default function AdminOrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const hydrateOrders = useOrdersStore((s) => s.hydrateOrders);

  useEffect(() => {
    let active = true;
    getBackendOrders()
      .then((remoteOrders) => {
        if (!active || !Array.isArray(remoteOrders)) return;
        const normalized = remoteOrders.map((order) => ({
          ...order,
          status: order.status === 'pending' ? 'placed' : order.status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          userId: order.customer_id,
          deliveryRider: order.deliveryRider || null,
          customer_name: order.customer_name || 'Unknown',
          customer_phone: order.customer_phone || null,
          address: {
            label: 'Delivery address',
            area: order.delivery_address || 'Kathmandu',
            street: order.delivery_address || '',
          },
          items: order.items || [],
          destinationCoords: null,
        }));
        hydrateOrders(normalized);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [hydrateOrders]);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const liveOrders = sorted.filter((o) => o.status === 'out_for_delivery' || o.status === 'picked_up');

  return (
    <div className="mx-auto max-w-6xl space-y-4 md:space-y-6 animate-fade-in">
      <AdminBackButton />
      <div className="panel flex flex-wrap items-center justify-between gap-4 md:gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-4 md:p-6 shadow-2xl shadow-[#C9A84C]/20 animate-gradient-x bg-[length:200%_200%] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="relative">
          <h1 className={`font-display text-xl md:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>Orders</h1>
          <p className={`mt-1 text-[10px] md:text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
            {orders.length} total · orders auto-advance to live GPS tracking
          </p>
        </div>
        <div className="relative flex items-center gap-2 md:gap-4">
          <div className="text-right">
            <p className={`text-[10px] md:text-xs uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Live Deliveries</p>
            <p className={`text-sm md:text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{liveOrders.length}</p>
          </div>
        </div>
      </div>

      {liveOrders.length > 0 && (
        <section className="space-y-3 md:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 md:h-5 md:w-5 text-green-400 animate-pulse-slow" />
              <div>
                <h2 className={`text-sm md:text-base font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Live night deliveries</h2>
                <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Auto-tracking - no button needed</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-full bg-green-500/15 px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold text-green-400 border border-green-500/20 shadow-lg shadow-green-500/10">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 animate-pulse rounded-full bg-green-400" />
              {liveOrders.length} live
            </span>
          </div>

          {liveOrders.map((order, index) => (
            <div key={order.id} className={`panel border-green-500/20 p-3 md:p-5 backdrop-blur-xl hover:border-green-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 relative overflow-hidden ${
              isLight 
                ? 'bg-white' 
                : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80'
            }`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <div className="relative mb-3 md:mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className={`font-mono text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{order.id}</p>
                  <p className={`text-xs md:text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {order.deliveryRider?.name || 'No Rider'} → {order.address?.area || 'Unknown Area'}
                  </p>
                </div>
                <p className="text-[10px] md:text-sm text-green-400 animate-pulse-slow">{formatRiderSpeed(order)}</p>
              </div>
              <LiveOrderTrackingPanel order={order} viewer="admin" compact />
            </div>
          ))}
        </section>
      )}

      {sorted.length === 0 ? (
        <div className={`panel py-16 text-center backdrop-blur-xl border hover:border-[#C9A84C]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'text-gray-500 bg-white border-gray-200' 
            : 'text-[#888888] bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">No orders yet</div>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {sorted.map((order, index) => {
            const isLive = order.status === 'out_for_delivery';
            const showTracking = isLive;

            return (
              <div key={order.id} className={`panel p-3 md:p-5 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
                isLight 
                  ? 'bg-white border-gray-200' 
                  : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
              }`} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex flex-wrap items-start justify-between gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Order No {order.order_number || 'N/A'}</p>
                    <p className={`mt-1 text-sm md:text-lg font-semibold group-hover:text-[#C9A84C] transition-colors ${
                      isLight ? 'text-gray-900' : 'text-white'
                    }`}>
                      Rs {order.total?.toLocaleString() || 'N/A'}
                    </p>
                    <p className={`text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>
                      Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown Date'} at {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Unknown Time'}
                    </p>
                    <p className={`mt-1 capitalize text-[10px] md:text-xs font-semibold ${
                      isLight ? 'text-gray-700' : 'text-[#C9A84C]'
                    }`}>{order.status?.replace(/_/g, ' ') || 'Unknown'}</p>
                    {order.customer_name && (
                      <p className={`mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
                        Customer: {order.customer_name}
                      </p>
                    )}
                    {order.customer_phone && (
                      <div className={`mt-1 flex items-center gap-2 text-[10px] md:text-xs ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
                        <span>Phone: {order.customer_phone}</span>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="text-blue-500 hover:text-blue-600 underline"
                        >
                          Call
                        </a>
                      </div>
                    )}
                    <p className={`mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                      Address: {order.delivery_address || 'N/A'}
                    </p>
                    {order.items && order.items.length > 0 && (
                      <div className={`mt-2 text-[10px] md:text-xs ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
                        <p className="font-semibold mb-1">Items:</p>
                        {order.items.slice(0, 3).map((item, idx) => (
                          <p key={idx} className="truncate">
                            {item.name || item.product?.name} × {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-gray-400">+{order.items.length - 3} more</p>
                        )}
                      </div>
                    )}
                    {order.deliveryRider && (
                      <p className={`mt-1 text-[10px] md:text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                        Rider: {order.deliveryRider.name || 'Unknown'} · {order.deliveryRider.vehicle || 'Unknown'}
                      </p>
                    )}
                  </div>
                  <select
                    className={`input-field py-1.5 md:py-2 text-[10px] md:text-sm capitalize backdrop-blur-sm focus:border-[#C9A84C]/50 focus:ring-[#C9A84C]/20 focus:shadow-lg focus:shadow-[#C9A84C]/20 transition-all duration-300 ${
                      isLight 
                        ? 'bg-gray-100 border-gray-300 text-gray-900' 
                        : 'bg-[#1A1A1A]/80 border-white/10 text-white'
                    }`}
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value, order.userId)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {showTracking && !isLive && (
                  <div className={`relative mt-3 md:mt-5 border-t pt-3 md:pt-5 ${
                    isLight ? 'border-gray-200' : 'border-white/10'
                  }`}>
                    {order.status === 'out_for_delivery' && order.deliveryRider ? (
                      <div className={`p-3 rounded-lg ${isLight ? 'bg-yellow-50 border border-yellow-200' : 'bg-yellow-900/20 border border-yellow-500/30'}`}>
                        <p className={`text-xs font-medium ${isLight ? 'text-yellow-800' : 'text-yellow-400'}`}>
                          🚴 Rider assigned: {order.deliveryRider.name} - Waiting for rider acceptance
                        </p>
                      </div>
                    ) : (
                      <LiveOrderTrackingPanel order={order} viewer="admin" compact />
                    )}
                  </div>
                )}

                <div className={`relative mt-3 md:mt-4 border-t pt-3 md:pt-4 ${
                  isLight ? 'border-gray-200' : 'border-white/10'
                }`}>
                  <p className={`text-[10px] md:text-xs font-medium uppercase ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Items</p>
                  <ul className="mt-1 md:mt-2 space-y-1 md:space-y-2">
                    {order.items?.map((item, index) => (
                      <li key={item.product?.id || index} className={`flex justify-between text-[10px] md:text-sm hover:px-2 py-1 rounded-lg transition-colors ${
                        isLight ? 'hover:bg-gray-100' : 'hover:bg-white/[0.03]'
                      }`}>
                        <span className={`hover:text-[#C9A84C] transition-colors ${
                          isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888] hover:text-white'
                        }`}>
                          {item.quantity}× {item.product?.name || 'Unknown Product'}
                        </span>
                        <span className={`hover:text-[#C9A84C] transition-colors ${
                          isLight ? 'text-gray-900' : 'text-white'
                        }`}>
                          Rs {item.product?.price ? ((item.product.price * item.quantity).toLocaleString()) : 'N/A'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className={`mt-3 text-xs ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>
                    Deliver to: {order.address.area}, {order.address.street}
                    {order.address.landmark ? ` · ${order.address.landmark}` : ''}
                  </p>
                  {order.notes && (
                    <p className={`mt-1 text-xs ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Note: {order.notes}</p>
                  )}
                  {(order.paymentMethod === 'esewa' || order.paymentMethod === 'khalti') && order.paymentScreenshot && (
                    <div className="mt-3">
                      <p className={`text-[10px] md:text-xs font-medium uppercase mb-2 ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
                        Payment Screenshot ({order.paymentMethod.toUpperCase()})
                      </p>
                      <div className="relative inline-block">
                        <img
                          src={order.paymentScreenshot.startsWith('http') ? order.paymentScreenshot : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${order.paymentScreenshot}`}
                          alt="Payment screenshot"
                          className="max-w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(order.paymentScreenshot.startsWith('http') ? order.paymentScreenshot : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${order.paymentScreenshot}`, '_blank')}
                        />
                        <p className={`text-[9px] mt-1 ${isLight ? 'text-gray-400' : 'text-[#666666]'}`}>Click to view full size</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatRiderSpeed(order) {
  const speed = order.deliveryRider?.speed ?? 0;
  const status = order.deliveryRider?.status;
  if (status === 'driving') return `${Math.round(speed)} km/h · Driving`;
  if (status === 'arrived') return 'Arrived';
  return 'Idle';
}

