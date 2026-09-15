import { ArrowLeft, CheckCircle, Clock, MapPin, Package, Phone as PhoneIcon, Sparkles, Truck } from 'lucide-react';
import { useOrdersStore } from '@/store/ordersStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import LiveOrderTrackingPanel from '@/components/tracking/LiveOrderTrackingPanel';
import FloatingNotification from '@/components/FloatingNotification';
import { requestNotificationPermission, showBrowserNotification } from '@/lib/notificationUtils';
import { useEffect, useState } from 'react';

export default function OrderTrackingPage() {
  const selectedOrderId = useOrdersStore((s) => s.selectedOrderId);
  const orders = useOrdersStore((s) => s.orders);
  const { setPage } = useAppStore();
  const { user } = useAuthStore();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: '', message: '', type: 'info' });

  const order = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : orders[0];

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Poll for rider arrival notifications
  useEffect(() => {
    if (!order?.id) return;

    const checkForNotifications = async () => {
      try {
        const response = await fetch(`/api/v1/orders/${order.id}/notifications`);
        if (response.ok) {
          const data = await response.json();
          if (data.hasArrivalNotification && !showNotification) {
            const message = `Your rider ${data.rider_name || 'is'} is arriving at your location. Please be ready to receive your order.`;
            setNotificationData({
              title: 'Rider Arriving!',
              message: message,
              type: 'location'
            });
            setShowNotification(true);
            
            // Also show browser notification for when browser is inactive/minimized
            showBrowserNotification('Rider Arriving!', message, {
              onClick: () => {
                window.focus();
                setPage('order-tracking');
              }
            });
          }
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // Check every 10 seconds when order is out for delivery
    const interval = setInterval(() => {
      if (order?.status === 'out_for_delivery') {
        checkForNotifications();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [order?.id, order?.status, showNotification]);

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
            className="mb-2 inline-flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to account
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Order No {order.orderNumber || order.id?.slice(0, 8)}</h1>
          <p className="mt-1 text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="panel border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Current status</p>
            <p className="mt-2 text-2xl font-bold capitalize text-gray-900">{order.status.replace(/_/g, ' ')}</p>
            {order.eta && (
              <p className="mt-2 text-sm text-gray-700">
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
              <p className="mt-2 text-sm text-gray-700">
                {order.status === 'placed' && 'Order sent to Admin. Waiting for store confirmation.'}
                {order.status === 'confirmed' && 'Confirmed by Admin. Store is packing your supply.'}
                {order.status === 'preparing' && 'Items packed! Waiting for rider to manually pick up order.'}
              </p>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold text-gray-900">Customer details</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-700"><span className="font-semibold">Name:</span> {user?.name || 'N/A'}</p>
              <p className="text-gray-700"><span className="font-semibold">Phone:</span> {user?.phone_number || 'N/A'}</p>
              <p className="text-gray-700"><span className="font-semibold">Address:</span> {order.address?.label || 'N/A'}</p>
              {order.address?.street && <p className="text-gray-700"><span className="font-semibold">Street:</span> {order.address.street}</p>}
              {order.address?.area && <p className="text-gray-700"><span className="font-semibold">Area:</span> {order.address.area}</p>}
            </div>
          </div>

          <LiveOrderTrackingPanel order={order} viewer="customer" />

          <div className="panel p-5">
            <h2 className="mb-5 text-sm font-semibold text-gray-900">Delivery progress</h2>
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
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {idx < statusTimeline.length - 1 && (
                        <div
                          className={`my-1 h-10 w-0.5 ${
                            status === 'completed' || status === 'current' ? 'bg-green-300' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-6 pt-1">
                      <p className={`text-sm font-semibold ${status === 'current' ? 'text-green-600' : 'text-gray-900'}`}>
                        {stage.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">{stage.description}</p>
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
                  <p className="font-semibold text-gray-900">+{order.pointsEarned} loyalty points earned</p>
                  <p className="text-sm text-gray-600">Added to your account after delivery</p>
                </div>
              </div>
            </div>
          )}

        </div>

        <aside className="space-y-5">
          <div className="panel p-5">
            <h2 className="text-sm font-semibold text-gray-900">Order items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item, index) => (
                <div key={item.product?.id || index} className="flex justify-between gap-3 text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{item.product?.name || item.name || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × Rs {item.product?.price || item.price}</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    Rs {((item.product?.price || item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold text-gray-900">Payment summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
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
              <div className="flex justify-between text-gray-700">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `Rs ${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-3 font-bold text-gray-900">
                <span>Total</span>
                <span>Rs {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="h-4 w-4 text-amber-600" />
              Delivery address
            </h2>
            <p className="font-medium text-gray-900">{order.address.label}</p>
            <p className="mt-1 text-sm text-gray-600">
              {order.address.street}, {order.address.area}
            </p>
            {order.address.landmark && <p className="mt-1 text-xs text-gray-500">{order.address.landmark}</p>}
          </div>
        </aside>
      </div>

      {/* Floating Notification */}
      <FloatingNotification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        title={notificationData.title}
        message={notificationData.message}
        type={notificationData.type}
        duration={8000}
      />
    </div>
  );
}

