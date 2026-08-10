import { ArrowLeft, CheckCircle, Clock, MapPin, Package, Phone as PhoneIcon, Sparkles, Truck } from 'lucide-react';
import { useOrdersStore } from '@/store/ordersStore';
import { useAppStore } from '@/store/appStore';
import LiveOrderTrackingPanel from '@/components/tracking/LiveOrderTrackingPanel';

export default function OrderTrackingPage() {
  const selectedOrderId = useOrdersStore((s) => s.selectedOrderId);
  const orders = useOrdersStore((s) => s.orders);
  const { setPage } = useAppStore();

  const order = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : orders[0];

  const statusTimeline = [
    { stage: 'placed', label: 'Order Placed', description: 'Order received by Admin', icon: CheckCircle },
    { stage: 'confirmed', label: 'Confirmed', description: 'Confirmed by store admin', icon: CheckCircle },
    { stage: 'preparing', label: 'Items Packed', description: 'Packed & ready at store for rider pickup', icon: Clock },
    { stage: 'out_for_delivery', label: 'Out for Delivery', description: 'Rider picked up order — Live GPS active', icon: Truck },
    { stage: 'delivered', label: 'Delivered', description: 'Order completed', icon: CheckCircle },
  ];

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package className="mx-auto h-12 w-12 text-night-500" />
        <p className="mt-4 text-lg text-night-300">No order found</p>
        <button onClick={() => setPage('profile')} className="btn-primary mt-6">
          View Account
        </button>
      </div>
    );
  }

  const currentStageIndex = statusTimeline.findIndex((s) => s.stage === order.status);
  const isLive = order.status === 'out_for_delivery';

  const getStageStatus = (stage) => {
    const stageIndex = statusTimeline.findIndex((s) => s.stage === stage);
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="pb-16 text-night-100">
      <div className="page-header">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <button
            onClick={() => setPage('profile')}
            className="mb-2 inline-flex items-center gap-2 text-sm text-night-400 transition-colors hover:text-neon-amber"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to account
          </button>
          <h1 className="text-2xl font-bold text-white">Order {order.id}</h1>
          <p className="mt-1 text-sm text-night-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="panel border-neon-amber/20 bg-neon-amber/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-amber">Current status</p>
            <p className="mt-2 text-2xl font-bold capitalize text-white">{order.status.replace(/_/g, ' ')}</p>
            {order.eta && (
              <p className="mt-2 text-sm text-night-300">
                ETA: {new Date(order.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {isLive && (
              <p className="mt-2 flex items-center gap-2 text-sm text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                Rider picked up order — Live GPS tracking active
              </p>
            )}
            {!isLive && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <p className="mt-2 text-sm text-night-400">
                {order.status === 'placed' && 'Order sent to Admin. Waiting for store confirmation.'}
                {order.status === 'confirmed' && 'Confirmed by Admin. Store is packing your supply.'}
                {order.status === 'preparing' && 'Items packed! Waiting for rider to manually pick up order.'}
              </p>
            )}
          </div>

          <LiveOrderTrackingPanel order={order} viewer="customer" />

          <div className="panel p-5">
            <h2 className="mb-5 text-sm font-semibold text-white">Delivery progress</h2>
            <div className="space-y-1">
              {statusTimeline.map((stage, idx) => {
                const status = getStageStatus(stage.stage);
                const Icon = stage.icon;

                return (
                  <div key={stage.stage} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          status === 'completed'
                            ? 'bg-green-500/15 text-green-400'
                            : status === 'current'
                            ? 'bg-neon-amber/15 text-neon-amber'
                            : 'bg-night-800 text-night-500'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {idx < statusTimeline.length - 1 && (
                        <div
                          className={`my-1 h-10 w-0.5 ${
                            status === 'completed' || status === 'current' ? 'bg-neon-amber/40' : 'bg-night-700'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-6 pt-1">
                      <p className={`text-sm font-semibold ${status === 'current' ? 'text-neon-amber' : 'text-white'}`}>
                        {stage.label}
                      </p>
                      <p className="mt-1 text-xs text-night-400">{stage.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {order.pointsEarned && order.pointsEarned > 0 && order.status === 'delivered' && (
            <div className="panel border-green-500/20 bg-green-500/5 p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-semibold text-white">+{order.pointsEarned} loyalty points earned</p>
                  <p className="text-sm text-night-400">Added to your account after delivery</p>
                </div>
              </div>
            </div>
          )}

          {!isLive && order.deliveryRider && order.status !== 'delivered' && (
            <div className="panel p-5">
              <p className="mb-3 text-sm font-semibold text-white">Assigned rider</p>
              <div className="flex items-center justify-between rounded-xl bg-night-950/50 p-4">
                <div>
                  <p className="font-medium text-white">{order.deliveryRider.name}</p>
                  <p className="text-sm text-night-400">{order.deliveryRider.vehicle}</p>
                  <p className="text-xs text-night-500">{order.deliveryRider.phone}</p>
                </div>
                <a
                  href={`tel:${order.deliveryRider.phone}`}
                  className="rounded-xl bg-green-500/10 p-3 text-green-400 transition-colors hover:bg-green-500/20"
                >
                  <PhoneIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          )}

        </div>

        <aside className="space-y-5">
          <div className="panel p-5">
            <h2 className="text-sm font-semibold text-white">Order items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-night-400">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-white">
                    Rs {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold text-white">Payment summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-night-400">
                <span>Subtotal</span>
                <span>Rs {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-Rs {order.discount.toLocaleString()}</span>
                </div>
              )}
              {order.pointsRedeemed && order.pointsRedeemed > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Loyalty points</span>
                  <span>-{order.pointsRedeemed} pts</span>
                </div>
              )}
              <div className="flex justify-between text-night-400">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `Rs ${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between border-t border-night-700/50 pt-3 font-bold text-white">
                <span>Total</span>
                <span>Rs {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin className="h-4 w-4 text-neon-amber" />
              Delivery address
            </h2>
            <p className="font-medium text-white">{order.address.label}</p>
            <p className="mt-1 text-sm text-night-400">
              {order.address.street}, {order.address.area}
            </p>
            {order.address.landmark && <p className="mt-1 text-xs text-night-500">{order.address.landmark}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

