import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Truck, Phone, Navigation, Bell, XCircle, User } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';
import { notificationService } from '@/lib/notifications';
import DeliveryMap from '@/components/DeliveryMap';
import { getBackendOrders, getBackendRiders, assignRiderToOrder } from '@/lib/backendAPI';
import { adminPath } from '@/lib/adminRoutes';
import { STORE_LOCATION } from '@/lib/deliveryLocations';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';



export default function AdminDeliveryPageFixed() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      getBackendOrders(),
      getBackendRiders(),
    ]).then(([remoteOrders, remoteRiders]) => {
      if (!active) return;
      if (Array.isArray(remoteOrders)) {
        setOrders(remoteOrders.map((order) => ({
          id: order.id,
          orderId: order.order_number || order.id,
          customer: order.customer_id || 'Customer',
          address: order.delivery_address || '',
          phone: '',
          riderId: order.rider_id,
          status: order.status,
          total: order.total || 0,
          estimatedTime: '-',
          createdAt: order.created_at,
          currentLocation: null,
          coordinates: null,
          customerNotified: false,
        })));
      }
      if (Array.isArray(remoteRiders)) {
        setRiders(remoteRiders.map((rider) => ({
          id: rider.id,
          name: rider.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Rider',
          phone: rider.phone_number || '',
          status: rider.name === 'Rajesh Sharma' ? 'busy' : rider.status === 'active' ? 'available' : rider.status,
          currentLocation: rider.name === 'Rajesh Sharma' ? STORE_LOCATION.label + ' Hub' : '',
          coordinates: rider.name === 'Rajesh Sharma' ? { lat: STORE_LOCATION.lat, lng: STORE_LOCATION.lng } : null,
          activeOrders: rider.name === 'Rajesh Sharma' ? 1 : 0,
          completedToday: 0,
          rating: 0,
          destinationCoords: rider.name === 'Rajesh Sharma' ? { lat: 27.6915, lng: 85.3410, label: 'Customer Destination' } : undefined,
          lastUpdate: rider.updated_at || rider.created_at,
        })));
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const refreshRiderLocations = async () => {
      const activeOrders = orders.filter((order) => order.riderId && !['delivered', 'cancelled'].includes(order.status));
      const activeRiderIds = new Set(activeOrders.map((order) => order.riderId));
      const locations = await Promise.all(activeOrders.map(async (order) => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/tracking/${encodeURIComponent(order.id)}/location`);
          const result = await response.json();
          return result.status === 'success' && result.data ? { riderId: order.riderId, data: result.data } : null;
        } catch {
          return null;
        }
      }));
      setRiders((current) => current.map((rider) => {
        const update = locations.find((item) => item?.riderId === rider.id)?.data;
        if (activeRiderIds.has(rider.id) && update && Number.isFinite(Number(update.lat)) && Number.isFinite(Number(update.lng))) {
          return {
            ...rider,
            status: 'busy',
            coordinates: { lat: Number(update.lat), lng: Number(update.lng) },
            heading: Number(update.heading ?? rider.heading ?? 0),
            currentLocation: `${Number(update.lat).toFixed(5)}, ${Number(update.lng).toFixed(5)}`,
            lastUpdate: new Date().toISOString(),
          };
        }
        if (!activeRiderIds.has(rider.id)) {
          return {
            ...rider,
            status: rider.status === 'offline' ? 'offline' : 'available',
            coordinates: { lat: STORE_LOCATION.lat, lng: STORE_LOCATION.lng },
            heading: 0,
            currentLocation: `${STORE_LOCATION.label} Hub`,
            lastUpdate: new Date().toISOString(),
          };
        }
        return rider;
      }));
    };
    refreshRiderLocations();
    const interval = setInterval(refreshRiderLocations, 3000);
    return () => clearInterval(interval);
  }, [orders]);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [showRiderMap, setShowRiderMap] = useState(false);

  const filteredOrders = orders.filter((o) => {
    if (query && query.trim()) {
      const q = query.toLowerCase();
      const customer = o.customer || '';
      const orderId = o.orderId || '';
      const address = o.address || '';
      return customer.toLowerCase().includes(q) || orderId.toLowerCase().includes(q) || address.toLowerCase().includes(q);
    }
    return true;
  }).filter((o) => statusFilter === 'all' || o.status === statusFilter);

  const filteredRiders = riders.filter((r) => {
    if (query && query.trim()) {
      const q = query.toLowerCase();
      const name = r.name || '';
      const phone = r.phone || '';
      const location = r.currentLocation || '';
      return name.toLowerCase().includes(q) || phone.includes(q) || location.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const activeDeliveries = orders.filter((o) => ['assigned', 'picked_up'].includes(o.status)).length;
  const availableRiders = riders.filter((r) => r.status === 'available').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'out_for_delivery':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'assigned':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'accepted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'picked_up':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiderStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'busy':
        return 'bg-blue-500/20 text-blue-400';
      case 'offline':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const assignRider = async (orderId, riderId) => {
    const order = orders.find(o => o.id === orderId);
    const rider = riders.find(r => r.id === riderId);
    
    if (order && rider) {
      try {
        await assignRiderToOrder(orderId, riderId);
        order.riderId = riderId;
        order.status = 'assigned';
        order.estimatedTime = `${Math.floor(Math.random() * 20 + 10)} mins`;
        rider.status = 'busy';
        rider.activeOrders += 1;
        
        notificationService.showOrderNotification(order, 'assigned');
        console.log(`Customer notification sent: Order ${order.orderId} assigned to ${rider.name}`);
      } catch (error) {
        console.error('Failed to assign rider:', error);
        alert('Failed to assign rider. Please try again.');
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      try {
        await updateBackendOrderStatus(orderId, newStatus);
        order.status = newStatus;
        notificationService.showOrderNotification(order, newStatus);
        console.log(`Customer notification sent: Order ${order.orderId} status changed to ${newStatus}`);

        if (newStatus === 'delivered') {
          const rider = riders.find(r => r.id === order.riderId);
          if (rider) {
            rider.activeOrders -= 1;
            rider.completedToday += 1;
            if (rider.activeOrders === 0) {
              rider.status = 'available';
            }
          }
        }
      } catch (error) {
        console.error('Failed to update order status:', error);
        alert('Failed to update order status. Please try again.');
      }
    }
  };

  const selectRiderForTracking = (rider) => {
    setSelectedRider(rider);
    setShowRiderMap(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-6 shadow-xl shadow-[#C9A84C]/10 ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div>
          <h1 className={`font-display text-3xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>Delivery Management</h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Track riders and manage deliveries</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to={adminPath('riders')} className="rounded-xl bg-[#C9A84C] px-4 py-2 text-sm font-bold text-black hover:bg-[#E5B860]">
            Register Rider
          </Link>
          <div className="text-right">
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Pending Orders</p>
            <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{pendingOrders}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Active Deliveries</p>
            <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{activeDeliveries}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Available Riders</p>
            <p className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{availableRiders}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`panel rounded-2xl border p-2 ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-[#0D0D0D]/50 border-white/10'
      }`}>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#C9A84C] text-[#0D0D0D]'
                : isLight 
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('riders')}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'riders'
                ? 'bg-[#C9A84C] text-[#0D0D0D]'
                : isLight 
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            Riders ({riders.length})
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          <div className={`panel rounded-2xl border p-6 ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-[#0D0D0D]/50 border-white/10'
          }`}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders..."
                  className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50 ${
                    isLight 
                      ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                      : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                  }`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50 ${
                  isLight
                    ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white'
                    : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="accepted">Accepted</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className={`panel rounded-2xl border overflow-hidden ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-[#0D0D0D]/50 border-white/10'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${
                  isLight 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-white/10 bg-[#0A0A0A]/50'
                }`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Order ID</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Customer</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Address</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Amount</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Rider</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>ETA</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isLight ? 'divide-gray-200' : 'divide-white/5'
                }`}>
                  {filteredOrders.map((order) => {
                    const rider = riders.find((r) => r.id === order.riderId);
                    return (
                      <tr key={order.id} className={`transition-colors ${
                        isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                      }`}>
                        <td className={`px-6 py-4 font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{order.orderId}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{order.customer}</p>
                            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{order.phone}</p>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{order.address}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs. {order.total?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4">
                          {rider ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#C9A84C]" />
                              <div>
                                <p className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{rider.name}</p>
                                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{rider.phone}</p>
                              </div>
                            </div>
                          ) : (
                            <select
                              onChange={(e) => assignRider(order.id, e.target.value)}
                              className={`rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-[#C9A84C]/50 ${
                                isLight 
                                  ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                                  : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                              }`}
                            >
                              <option value="">Assign Rider</option>
                              {riders.filter(r => r.status === 'available').map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm flex items-center gap-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                          <Clock className="h-3 w-3" />
                          {order.estimatedTime}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border-none cursor-pointer bg-orange-500/20 text-orange-400 hover:bg-orange-500/30`}
                              >
                                Out for Delivery
                              </button>
                            )}
                            {order.status === 'out_for_delivery' && !order.riderId && (
                              <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Assign rider</span>
                            )}
                            {order.status === 'out_for_delivery' && order.riderId && (
                              <span className={`text-xs ${isLight ? 'text-green-600' : 'text-green-400'}`}>Rider assigned</span>
                            )}
                            {order.status === 'accepted' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'picked_up')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border-none cursor-pointer bg-purple-500/20 text-purple-400 hover:bg-purple-500/30`}
                              >
                                Mark Picked Up
                              </button>
                            )}
                            {order.status === 'picked_up' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border-none cursor-pointer bg-green-500/20 text-green-400 hover:bg-green-500/30`}
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="p-12 text-center">
                <Truck className={`mx-auto h-12 w-12 mb-4 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>No orders found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Riders Tab */}
      {activeTab === 'riders' && (
        <>
          <div className={`panel rounded-2xl border p-6 ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-[#0D0D0D]/50 border-white/10'
          }`}>
            <div className="relative flex-1 min-w-64">
              <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search riders..."
                className={`w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50 ${
                  isLight 
                    ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white' 
                    : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRiders.map((rider) => (
              <div key={rider.id} className={`panel rounded-2xl border p-6 ${
                isLight 
                  ? 'bg-white border-gray-200' 
                  : 'bg-[#0D0D0D]/50 border-white/10'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A68B3D] text-lg font-bold text-white">
                      {rider.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{rider.name}</p>
                      <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{rider.phone}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getRiderStatusColor(rider.status)}`}>
                    {rider.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Location</span>
                    <span className={isLight ? 'text-gray-900' : 'text-white'}>{rider.currentLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Active Orders</span>
                    <span className={isLight ? 'text-gray-900' : 'text-white'}>{rider.activeOrders}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Completed Today</span>
                    <span className={isLight ? 'text-gray-900' : 'text-white'}>{rider.completedToday}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Rating</span>
                    <span className={isLight ? 'text-gray-900' : 'text-white'}>{rider.rating}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors border-none cursor-pointer ${
                    isLight 
                      ? 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100' 
                      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}>
                    <Phone className="h-4 w-4 inline mr-1" />
                    Call
                  </button>
                  <button 
                    onClick={() => selectRiderForTracking(rider)}
                    disabled={rider.status === 'offline'}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors border-none cursor-pointer ${
                      rider.status === 'offline'
                        ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                        : 'bg-[#C9A84C] text-[#0D0D0D] hover:bg-[#A68B3D]'
                    }`}
                  >
                    <Navigation className="h-4 w-4 inline mr-1" />
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rider Tracking Map Modal */}
      {showRiderMap && selectedRider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`panel rounded-2xl border max-w-5xl w-full max-h-[90vh] overflow-hidden ${
            isLight 
              ? 'bg-white border-gray-200' 
              : 'bg-[#0D0D0D]/50 border-white/10'
          }`}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#C9A84C]" />
                <div>
                  <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Tracking {selectedRider.name}</h2>
                  <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{selectedRider.phone}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRiderMap(false)}
                className={`rounded-lg p-2 transition-colors border-none bg-transparent cursor-pointer ${
                  isLight 
                    ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-900' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map Area */}
                <div className="aspect-video rounded-lg overflow-hidden relative">
                  <DeliveryMap 
                    riders={riders.filter(r => r.status !== 'offline')}
                    selectedRider={selectedRider}
                    onRiderSelect={setSelectedRider}
                    height="100%"
                  />
                </div>

                {/* Rider Details & Active Orders */}
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    isLight 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-[#0A0A0A]/50 border-white/10'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Rider Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Status</span>
                        <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{selectedRider.status.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Active Orders</span>
                        <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{selectedRider.activeOrders}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Completed Today</span>
                        <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{selectedRider.completedToday}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Rating</span>
                        <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{selectedRider.rating}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`text-gray-400 ${isLight ? 'text-gray-500' : ''}`}>Last Update</span>
                        <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          {selectedRider.lastUpdate ? new Date(selectedRider.lastUpdate).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isLight 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-[#0A0A0A]/50 border-white/10'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Active Orders</h3>
                    {orders.filter(o => o.riderId === selectedRider.id && o.status !== 'delivered').length > 0 ? (
                      <div className="space-y-2">
                        {orders.filter(o => o.riderId === selectedRider.id && o.status !== 'delivered').map(order => (
                          <div key={order.id} className={`p-3 rounded border ${
                            isLight 
                              ? 'bg-white border-gray-200' 
                              : 'bg-[#0A0A0A]/50 border-white/10'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{order.orderId}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                              {order.customer} - {order.address}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-[#C9A84C]" />
                              <span className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>ETA: {order.estimatedTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>No active orders</p>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      if (selectedRider.status === 'available') {
                        notificationService.show(`Calling ${selectedRider.name}`, {
                          body: selectedRider.phone,
                          tag: `call-${selectedRider.id}`
                        });
                      }
                    }}
                    disabled={selectedRider.status === 'offline'}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors border-none cursor-pointer flex items-center justify-center gap-2 ${
                      selectedRider.status === 'offline'
                        ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                        : 'bg-[#C9A84C] text-[#0D0D0D] hover:bg-[#A68B3D]'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    Call Rider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



