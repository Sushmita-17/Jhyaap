import { Link } from 'react-router-dom';
import { adminPath } from '@/lib/adminRoutes';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Tags,
  Image,
} from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAdminStore } from '@/store/adminStore';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-night-500 mb-2">{label}</p>
          <p className="mt-1 text-4xl font-bold text-white tracking-tight">{value}</p>
          {sub && <p className="mt-2 text-sm text-night-400">{sub}</p>}
          {trend && (
            <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend.isPositive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} shadow-lg`}>
          <Icon className="h-6 w-6" />
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

  const inStock = products.filter((p) => p.inStock).length;
  const outOfStock = products.length - inStock;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const liveDeliveries = orders.filter((o) => o.status === 'out_for_delivery').length;

  const topCategories = [...categories].sort((a, b) => b.count - a.count).slice(0, 6);
  const maxCount = topCategories[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <div className="panel flex flex-wrap items-center justify-between gap-6 border-neon-amber/30 bg-gradient-to-r from-neon-amber/15 via-neon-amber/5 to-transparent p-6 shadow-xl shadow-neon-amber/10 animate-gradient-x bg-[length:200%_200%]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neon-amber mb-2 animate-pulse-slow">{role}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-white md:text-4xl tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="mt-2 text-sm text-night-300">You are signed in to the Night Owl admin panel</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-night-400">Current Time</p>
            <p className="text-lg font-bold text-white">{new Date().toLocaleTimeString()}</p>
          </div>
          <span className="rounded-2xl border border-neon-amber/40 bg-neon-amber/15 px-6 py-3 text-sm font-bold text-neon-amber shadow-lg shadow-neon-amber/20 animate-glow">
            Admin Access
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-night-400">Overview of your Night Owl store</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total products"
          value={products.length}
          sub={`${categories.length} categories`}
          icon={Package}
          color="bg-neon-amber/20 text-neon-amber"
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10 hover:border-neon-amber/30 transition-all duration-300 hover:shadow-xl hover:shadow-neon-amber/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white text-lg">Products by category</h2>
            <span className="text-xs text-night-400 bg-night-800/50 px-3 py-1 rounded-full">{categories.length} total</span>
          </div>
          <div className="space-y-4">
            {topCategories.map((cat) => (
              <div key={cat.id} className="group">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-night-300 font-medium group-hover:text-white transition-colors">{cat.name}</span>
                  <span className="text-night-500 group-hover:text-neon-amber transition-colors">{cat.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-night-800 group-hover:bg-night-700 transition-colors">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-amber to-amber-600 transition-all duration-500 animate-shimmer bg-[length:200%_100%]"
                    style={{ width: `${(cat.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6 bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <h2 className="font-bold text-white text-lg mb-6">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to={adminPath('categories')}
              className="group flex items-center gap-4 rounded-xl border border-white/10 p-5 hover:border-neon-amber/40 hover:bg-night-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-amber/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-amber/15 text-neon-amber group-hover:bg-neon-amber/25 transition-colors">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white group-hover:text-neon-amber transition-colors">Manage categories</span>
                <p className="text-xs text-night-500 mt-1">Organize products</p>
              </div>
            </Link>
            <Link
              to={adminPath('banners')}
              className="group flex items-center gap-4 rounded-xl border border-white/10 p-5 hover:border-neon-amber/40 hover:bg-night-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-amber/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-amber/15 text-neon-amber group-hover:bg-neon-amber/25 transition-colors">
                <Image className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white group-hover:text-neon-amber transition-colors">Edit banners</span>
                <p className="text-xs text-night-500 mt-1">{banners.length} active</p>
              </div>
            </Link>
            <Link
              to={adminPath('orders')}
              className="group flex items-center gap-4 rounded-xl border border-white/10 p-5 hover:border-neon-amber/40 hover:bg-night-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-amber/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-amber/15 text-neon-amber group-hover:bg-neon-amber/25 transition-colors">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white group-hover:text-neon-amber transition-colors">View orders</span>
                <p className="text-xs text-night-500 mt-1">{orders.length} total</p>
              </div>
            </Link>
            <Link
              to={adminPath('reports')}
              className="group flex items-center gap-4 rounded-xl border border-white/10 p-5 hover:border-neon-amber/40 hover:bg-night-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-amber/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-amber/15 text-neon-amber group-hover:bg-neon-amber/25 transition-colors">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white group-hover:text-neon-amber transition-colors">View reports</span>
                <p className="text-xs text-night-500 mt-1">Analytics & insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="panel overflow-hidden bg-gradient-to-br from-night-900/80 to-night-800/40 border border-white/10">
          <div className="border-b border-white/10 px-6 py-5 bg-night-950/30">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-lg">Recent orders</h2>
              <Link to={adminPath('orders')} className="text-sm text-neon-amber hover:text-neon-amber/80 transition-colors">
                View all →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-night-950/60 text-xs uppercase tracking-wider text-night-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-night-300">{order.id}</td>
                      <td className="px-6 py-4 text-white font-semibold">Rs {order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-500/15 text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                          'bg-neon-amber/15 text-neon-amber'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-night-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
