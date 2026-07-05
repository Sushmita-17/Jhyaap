import { useOrdersStore } from '@/store/ordersStore';
import { Order } from '@/types';
import LiveOrderTrackingPanel from '@/components/tracking/LiveOrderTrackingPanel';
import { Radio } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';

const STATUS_OPTIONS: Order['status'][] = [
  'placed',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export default function AdminOrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const liveOrders = sorted.filter((o) => o.status === 'out_for_delivery');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminBackButton />
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Orders</h1>
        <p className="mt-1 text-sm text-night-400">
          {orders.length} total · orders auto-advance to live GPS tracking
        </p>
      </div>

      {liveOrders.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-green-400" />
              <div>
                <h2 className="font-semibold text-white">Live night deliveries</h2>
                <p className="text-xs text-night-400">Auto-tracking — no button needed</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              {liveOrders.length} live
            </span>
          </div>

          {liveOrders.map((order) => (
            <div key={order.id} className="panel border-green-500/20 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-night-500">{order.id}</p>
                  <p className="font-semibold text-white">
                    {order.deliveryRider?.name} → {order.address.area}
                  </p>
                </div>
                <p className="text-sm text-green-400">{formatRiderSpeed(order)}</p>
              </div>
              <LiveOrderTrackingPanel order={order} viewer="admin" compact />
            </div>
          ))}
        </section>
      )}

      {sorted.length === 0 ? (
        <div className="panel py-16 text-center text-night-500">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => {
            const isLive = order.status === 'out_for_delivery';
            const showTracking = isLive || order.status === 'delivered';

            return (
              <div key={order.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-night-500">{order.id}</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      Rs {order.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-night-500">
                      {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod.toUpperCase()}
                    </p>
                    <p className="mt-1 capitalize text-xs text-neon-amber">{order.status.replace(/_/g, ' ')}</p>
                    {order.deliveryRider && (
                      <p className="mt-1 text-xs text-night-400">
                        Rider: {order.deliveryRider.name} · {order.deliveryRider.vehicle}
                      </p>
                    )}
                  </div>
                  <select
                    className="input-field py-2 text-sm capitalize"
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value as Order['status'], order.userId)
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
                  <div className="mt-5 border-t border-white/10 pt-5">
                    <LiveOrderTrackingPanel order={order} viewer="admin" compact />
                  </div>
                )}

                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs font-medium uppercase text-night-500">Items</p>
                  <ul className="mt-2 space-y-2">
                    {order.items.map((item) => (
                      <li key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-night-300">
                          {item.quantity}× {item.product.name}
                        </span>
                        <span className="text-white">
                          Rs {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-night-500">
                    Deliver to: {order.address.area}, {order.address.street}
                    {order.address.landmark ? ` · ${order.address.landmark}` : ''}
                  </p>
                  {order.notes && (
                    <p className="mt-1 text-xs text-night-400">Note: {order.notes}</p>
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

function formatRiderSpeed(order: Order): string {
  const speed = order.deliveryRider?.speed ?? 0;
  const status = order.deliveryRider?.status;
  if (status === 'driving') return `${Math.round(speed)} km/h · Driving`;
  if (status === 'arrived') return 'Arrived';
  return 'Idle';
}
