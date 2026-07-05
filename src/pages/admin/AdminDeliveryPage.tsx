import { useState, useMemo } from 'react';
import { Search, MapPin, Clock, Truck, Phone, Navigation } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: string;
  activeOrders: number;
  completedToday: number;
  rating: number;
}

interface DeliveryOrder {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  phone: string;
  riderId?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  estimatedTime: string;
  createdAt: string;
}

const mockRiders: DeliveryRider[] = [
  {
    id: '1',
    name: 'Rajesh Sharma',
    phone: '+977 98XXXXXXXX',
    status: 'available',
    currentLocation: 'Jhyaap Station',
    activeOrders: 0,
    completedToday: 8,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Sita Thapa',
    phone: '+977 97XXXXXXXX',
    status: 'busy',
    currentLocation: 'Thamel',
    activeOrders: 2,
    completedToday: 5,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Bikash Gurung',
    phone: '+977 98XXXXXXXX',
    status: 'offline',
    currentLocation: 'Unknown',
    activeOrders: 0,
    completedToday: 0,
    rating: 4.7,
  },
];

const mockOrders: DeliveryOrder[] = [
  {
    id: '1',
    orderId: 'ORD-1234',
    customer: 'John Doe',
    address: 'Thamel, Kathmandu',
    phone: '+977 98XXXXXXXX',
    riderId: '2',
    status: 'picked_up',
    estimatedTime: '15 mins',
    createdAt: '2026-07-03 18:30',
  },
  {
    id: '2',
    orderId: 'ORD-1235',
    customer: 'Jane Smith',
    address: 'Lazimpat, Kathmandu',
    phone: '+977 97XXXXXXXX',
    status: 'pending',
    estimatedTime: '25 mins',
    createdAt: '2026-07-03 18:45',
  },
  {
    id: '3',
    orderId: 'ORD-1236',
    customer: 'Bob Johnson',
    address: 'Baluwatar, Kathmandu',
    phone: '+977 98XXXXXXXX',
    riderId: '2',
    status: 'assigned',
    estimatedTime: '20 mins',
    createdAt: '2026-07-03 18:50',
  },
];

export default function AdminDeliveryPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'assigned' | 'picked_up' | 'delivered'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'riders'>('orders');

  const filteredOrders = useMemo(() => {
    let list = mockOrders;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.customer.toLowerCase().includes(q) ||
          o.orderId.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [mockOrders, query, statusFilter]);

  const filteredRiders = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return mockRiders.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.currentLocation.toLowerCase().includes(q),
      );
    }
    return mockRiders;
  }, [mockRiders, query]);

  const pendingOrders = mockOrders.filter((o) => o.status === 'pending').length;
  const activeDeliveries = mockOrders.filter((o) => ['assigned', 'picked_up'].includes(o.status)).length;
  const availableRiders = mockRiders.filter((r) => r.status === 'available').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'assigned':
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

  const getRiderStatusColor = (status: string) => {
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
            Orders ({mockOrders.length})
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
            Riders ({mockRiders.length})
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
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50 ${
                  isLight 
                    ? 'bg-gray-50 border-gray-300 text-gray-900' 
                    : 'bg-[#0A0A0A]/50 border-white/10 text-white'
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
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
                    const rider = mockRiders.find((r) => r.id === order.riderId);
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
                        <td className={`px-6 py-4 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                          {rider ? rider.name : 'Unassigned'}
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
                            <button className={`rounded-lg p-2 transition-colors border-none bg-transparent cursor-pointer ${
                              isLight 
                                ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-900' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}>
                              <MapPin className="h-4 w-4" />
                            </button>
                            <button className={`rounded-lg p-2 transition-colors border-none bg-transparent cursor-pointer ${
                              isLight 
                                ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-900' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}>
                              <Phone className="h-4 w-4" />
                            </button>
                            {order.status === 'pending' && (
                              <button className="rounded-lg p-2 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors border-none bg-transparent cursor-pointer">
                                <Truck className="h-4 w-4" />
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
                    <span className={isLight ? 'text-gray-900' : 'text-white'}>⭐ {rider.rating}</span>
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
                  <button className="flex-1 rounded-lg bg-[#C9A84C] px-3 py-2 text-sm font-bold text-[#0D0D0D] hover:bg-[#A68B3D] transition-colors border-none cursor-pointer">
                    <Navigation className="h-4 w-4 inline mr-1" />
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
