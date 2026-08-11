import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminPath } from '@/lib/adminRoutes';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Tags,
  Image,
  Bell,
  X,
} from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAdminStore } from '@/store/adminStore';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useThemeStore } from '@/store/themeStore';
import FloatingNotification from '@/components/FloatingNotification';
import { requestNotificationPermission, showBrowserNotification } from '@/lib/notificationUtils';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
}) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <div className={`panel p-3 md:p-4 lg:p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 group relative overflow-hidden ${
      isLight 
        ? 'bg-white border-gray-200' 
        : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
    }`}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 group-hover:text-[#C9A84C] transition-colors ${
            isLight ? 'text-gray-500' : 'text-[#888888]'
          }`}>{label}</p>
          <p className={`mt-1 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight group-hover:text-[#C9A84C] transition-colors animate-fade-in ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>{value}</p>
          {sub && <p className={`mt-1 md:mt-2 text-[10px] md:text-sm group-hover:text-[#888888] transition-colors ${
            isLight ? 'text-gray-500' : 'text-[#666666]'
          }`}>{sub}</p>}
          {trend && (
            <div className={`mt-2 md:mt-3 inline-flex items-center gap-1 md:gap-1.5 rounded-full px-2 py-0.5 md:px-2.5 md:py-1 text-[10px] md:text-xs font-semibold border ${
              trend.isPositive 
                ? 'bg-green-500/15 text-green-400 border-green-500/20 shadow-lg shadow-green-500/10' 
                : 'bg-red-500/15 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <span className={`relative flex h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl md:rounded-2xl ${color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float`}>
          <Icon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
        </span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const displayName = useAdminStore((s) => s.displayName);
  const role = useAdminStore((s) => s.role);
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.getCategories());
  const banners = useCatalogStore((s) => s.banners);
  const orders = useOrdersStore((s) => s.orders);
  const { newOrderCount, dismissNotifications } = useAdminNotifications();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: '', message: '', type: 'info' });

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Poll for admin notifications
  useEffect(() => {
    const checkForNotifications = async () => {
      try {
        const response = await fetch('/api/v1/notifications/admin');
        if (response.ok) {
          const data = await response.json();
          if (data.notifications && data.notifications.length > 0) {
            const latestNotification = data.notifications[0];
            if (!latestNotification.is_read) {
              setNotificationData({
                title: latestNotification.title,
                message: latestNotification.message,
                type: latestNotification.type === 'rider_acceptance' ? 'rider' : 'order'
              });
              setShowNotification(true);
              
              // Also show browser notification
              showBrowserNotification(latestNotification.title, latestNotification.message, {
                onClick: () => window.focus()
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    // Check every 15 seconds
    const interval = setInterval(checkForNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const inStock = products.filter((p) => p.inStock).length;
  const outOfStock = products.length - inStock;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const liveDeliveries = orders.filter((o) => o.status === 'out_for_delivery').length;

  const topCategories = [...categories].sort((a, b) => b.count - a.count).slice(0, 6);
  const maxCount = topCategories[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 animate-fade-in">
      {/* Notification Banner */}
      {newOrderCount > 0 && (
        <div className="relative bg-gradient-to-r from-[#C9A84C]/20 to-[#C9A84C]/10 border border-[#C9A84C]/40 rounded-xl p-3 md:p-4 shadow-2xl shadow-[#C9A84C]/30 animate-pulse backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-[#C9A84C]/30 text-[#C9A84C] animate-glow">
                <Bell className="h-4 w-4 md:h-5 md:w-5 animate-swing" />
              </div>
              <div>
                <p className={`text-xs md:text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>New Order{newOrderCount > 1 ? 's' : ''} Received</p>
                <p className={`text-[10px] md:text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>{newOrderCount} new order{newOrderCount > 1 ? 's have' : ' has'} been placed</p>
              </div>
            </div>
            <button
              onClick={dismissNotifications}
              className={`rounded-lg p-1.5 md:p-2 transition-all hover:scale-110 hover:rotate-90 ${
                isLight ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="panel flex flex-wrap items-center justify-between gap-4 md:gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-4 md:p-6 shadow-2xl shadow-[#C9A84C]/20 animate-gradient-x bg-[length:200%_200%] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="relative">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-1 md:mb-2 animate-pulse-slow">{role}</p>
          <h1 className={`mt-1 font-display text-xl md:text-2xl lg:text-3xl font-bold md:text-4xl tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>
            Welcome, {displayName}
          </h1>
          <p className={`mt-1 md:mt-2 text-[10px] md:text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>You are signed in to the Jhyaap Station admin panel</p>
        </div>
        <div className="relative flex items-center gap-2 md:gap-4">
          <div className="text-right">
            <p className={`text-[10px] md:text-xs uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Current Time</p>
            <p className={`text-sm md:text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{new Date().toLocaleTimeString()}</p>
          </div>
          <span className="rounded-2xl border border-[#C9A84C]/40 bg-[#C9A84C]/15 px-6 py-3 text-sm font-bold text-[#C9A84C] shadow-lg shadow-[#C9A84C]/20 animate-glow hover:scale-105 transition-transform cursor-default">
            Admin Access
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className={`font-display text-lg md:text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Dashboard</h2>
          <p className={`mt-1 text-[10px] md:text-sm ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>Overview of your Jhyaap Station store</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] md:text-xs text-green-400 font-medium">System Online</span>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 lg:gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total products"
          value={products.length}
          sub={`${categories.length} categories`}
          icon={Package}
          color="bg-[#C9A84C]/20 text-[#C9A84C]"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="In stock"
          value={inStock}
          sub={`${outOfStock} out of stock`}
          icon={TrendingUp}
          color="bg-green-500/20 text-green-400"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          label="Orders"
          value={orders.length}
          sub={`${pendingOrders} active${liveDeliveries > 0 ? ` · ${liveDeliveries} live GPS` : ''}`}
          icon={ShoppingBag}
          color="bg-sky-500/20 text-sky-400"
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          label="Revenue"
          value={`Rs ${revenue.toLocaleString()}`}
          sub="All orders"
          icon={AlertTriangle}
          color="bg-purple-500/20 text-purple-400"
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <div className={`panel p-4 md:p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center justify-between mb-4 md:mb-6">
            <h2 className={`font-bold text-base md:text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>Products by category</h2>
            <span className={`text-[10px] md:text-xs backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full border ${
              isLight 
                ? 'text-gray-600 bg-gray-100 border-gray-300' 
                : 'text-[#888888] bg-[#1A1A1A]/80 border-white/10'
            }`}>{categories.length} total</span>
          </div>
          <div className="relative space-y-3 md:space-y-4">
            {topCategories.map((cat, index) => (
              <div key={cat.id} className="group" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="mb-1.5 md:mb-2 flex justify-between text-xs md:text-sm">
                  <span className={`font-medium group-hover:text-[#C9A84C] transition-colors ${
                    isLight ? 'text-gray-600 group-hover:text-gray-900' : 'text-[#888888] group-hover:text-white'
                  }`}>{cat.name}</span>
                  <span className={`font-semibold group-hover:text-[#C9A84C] transition-colors ${
                    isLight ? 'text-gray-500' : 'text-[#666666]'
                  }`}>{cat.count}</span>
                </div>
                <div className={`h-3 overflow-hidden rounded-full shadow-inner transition-colors ${
                  isLight ? 'bg-gray-200 group-hover:bg-gray-300' : 'bg-[#1A1A1A] group-hover:bg-[#252525]'
                }`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] via-[#D4B06C] to-[#A68B3D] transition-all duration-700 animate-shimmer bg-[length:200%_100%] shadow-lg shadow-[#C9A84C]/30"
                    style={{ width: `${(cat.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`panel p-4 md:p-6 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <h2 className={`relative font-bold text-base md:text-lg mb-4 md:mb-6 ${isLight ? 'text-gray-900' : 'text-white'}`}>Quick actions</h2>
          <div className="relative grid gap-3 md:gap-4 sm:grid-cols-2">
            <Link
              to={adminPath('categories')}
              className={`group flex items-center gap-3 md:gap-4 rounded-xl border p-3 md:p-5 hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:scale-105 hover:-translate-y-1 ${
                isLight 
                  ? 'border-gray-200 hover:bg-gray-50' 
                  : 'border-white/10 hover:bg-[#1A1A1A]/50'
              }`}
            >
              <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C] group-hover:bg-[#C9A84C]/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Tags className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                <span className={`text-xs md:text-sm font-semibold group-hover:text-[#C9A84C] transition-colors ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>Manage categories</span>
                <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Organize products</p>
              </div>
            </Link>
            <Link
              to={adminPath('banners')}
              className={`group flex items-center gap-3 md:gap-4 rounded-xl border p-3 md:p-5 hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:scale-105 hover:-translate-y-1 ${
                isLight 
                  ? 'border-gray-200 hover:bg-gray-50' 
                  : 'border-white/10 hover:bg-[#1A1A1A]/50'
              }`}
            >
              <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C] group-hover:bg-[#C9A84C]/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Image className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                <span className={`text-xs md:text-sm font-semibold group-hover:text-[#C9A84C] transition-colors ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>Edit banners</span>
                <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>{banners.length} active</p>
              </div>
            </Link>
            <Link
              to={adminPath('orders')}
              className={`group flex items-center gap-3 md:gap-4 rounded-xl border p-3 md:p-5 hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:scale-105 hover:-translate-y-1 ${
                isLight 
                  ? 'border-gray-200 hover:bg-gray-50' 
                  : 'border-white/10 hover:bg-[#1A1A1A]/50'
              }`}
            >
              <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C] group-hover:bg-[#C9A84C]/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                <span className={`text-xs md:text-sm font-semibold group-hover:text-[#C9A84C] transition-colors ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>View orders</span>
                <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>{orders.length} total</p>
              </div>
            </Link>
            <Link
              to={adminPath('reports')}
              className={`group flex items-center gap-3 md:gap-4 rounded-xl border p-3 md:p-5 hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:scale-105 hover:-translate-y-1 ${
                isLight 
                  ? 'border-gray-200 hover:bg-gray-50' 
                  : 'border-white/10 hover:bg-[#1A1A1A]/50'
              }`}
            >
              <div className="relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-[#C9A84C]/15 text-[#C9A84C] group-hover:bg-[#C9A84C]/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div>
                <span className={`text-xs md:text-sm font-semibold group-hover:text-[#C9A84C] transition-colors ${
                  isLight ? 'text-gray-900' : 'text-white'
                }`}>View reports</span>
                <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${isLight ? 'text-gray-500' : 'text-[#666666]'}`}>Analytics & insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className={`panel overflow-hidden backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className={`relative border-b px-6 py-5 ${
            isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-[#0A0A0A]/30'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`font-bold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>Recent orders</h2>
              <Link to={adminPath('orders')} className="text-sm text-[#C9A84C] hover:text-[#C9A84C]/80 transition-colors hover:scale-105 inline-block">
                View all →
              </Link>
            </div>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs uppercase tracking-wider ${
                isLight ? 'bg-gray-100 text-gray-600' : 'bg-[#0A0A0A]/60 text-[#888888]'
              }`}>
                <tr>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isLight ? 'divide-gray-200' : 'divide-white/5'
              }`}>
                {orders
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((order) => (
                    <tr key={order.id} className={`hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 ${
                      isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.05]'
                    }`}>
                      <td className={`px-6 py-4 font-mono text-xs group-hover:text-[#C9A84C] transition-colors ${
                        isLight ? 'text-gray-600' : 'text-[#888888]'
                      }`}>{order.id}</td>
                      <td className={`px-6 py-4 font-semibold group-hover:text-[#C9A84C] transition-colors ${
                        isLight ? 'text-gray-900' : 'text-white'
                      }`}>Rs {order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                          order.status === 'delivered' 
                            ? 'bg-green-500/15 text-green-400 border-green-500/20 shadow-lg shadow-green-500/10' 
                            : order.status === 'cancelled' 
                            ? 'bg-red-500/15 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10' 
                            : 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/20 shadow-lg shadow-[#C9A84C]/10'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className={`px-6 py-4 group-hover:text-[#888888] transition-colors ${
                        isLight ? 'text-gray-500' : 'text-[#666666]'
                      }`}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

