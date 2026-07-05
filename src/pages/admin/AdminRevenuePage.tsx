import { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AdminBackButton from '@/components/admin/AdminBackButton';
import { useThemeStore } from '@/store/themeStore';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  id: string;
  name: string;
  brand: string;
  sales: number;
  revenue: number;
}

const mockRevenueData: RevenueData[] = [
  { date: '2026-06-28', revenue: 45000, orders: 45, customers: 38 },
  { date: '2026-06-29', revenue: 52000, orders: 52, customers: 45 },
  { date: '2026-06-30', revenue: 48000, orders: 48, customers: 42 },
  { date: '2026-07-01', revenue: 61000, orders: 61, customers: 55 },
  { date: '2026-07-02', revenue: 55000, orders: 55, customers: 48 },
  { date: '2026-07-03', revenue: 67000, orders: 67, customers: 60 },
];

const mockTopProducts: TopProduct[] = [
  { id: '1', name: 'Johnnie Walker Black Label', brand: 'Johnnie Walker', sales: 45, revenue: 225000 },
  { id: '2', name: 'Chivas Regal 12', brand: 'Chivas', sales: 38, revenue: 190000 },
  { id: '3', name: 'Jack Daniels Old No. 7', brand: 'Jack Daniels', sales: 32, revenue: 160000 },
  { id: '4', name: 'Absolut Vodka', brand: 'Absolut', sales: 28, revenue: 140000 },
  { id: '5', name: 'Captain Morgan Spiced', brand: 'Captain Morgan', sales: 25, revenue: 125000 },
];

export default function AdminRevenuePage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const totalRevenue = mockRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = mockRevenueData.reduce((sum, d) => sum + d.orders, 0);
  const totalCustomers = mockRevenueData.reduce((sum, d) => sum + d.customers, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const previousRevenue = totalRevenue * 0.85;
  const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
      <AdminBackButton />
      
      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-6 shadow-xl shadow-[#C9A84C]/10 ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div>
          <h1 className={`font-display text-3xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>Revenue Analytics</h1>
          <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Track sales performance and revenue trends</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className={`rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-[#C9A84C]/50 ${
              isLight 
                ? 'border-gray-300 bg-gray-50 text-gray-900' 
                : 'border-white/10 bg-[#0A0A0A]/50 text-white'
            }`}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors border-none cursor-pointer ${
            isLight 
              ? 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100' 
              : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
          }`}>
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className={`panel rounded-2xl border p-6 ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-[#0D0D0D]/50 border-white/10'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/20 text-[#C9A84C]">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {revenueGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Total Revenue</p>
          <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {totalRevenue.toLocaleString()}</p>
        </div>

        <div className={`panel rounded-2xl border p-6 ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-[#0D0D0D]/50 border-white/10'
        }`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 mb-4">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Total Orders</p>
          <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalOrders}</p>
        </div>

        <div className={`panel rounded-2xl border p-6 ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-[#0D0D0D]/50 border-white/10'
        }`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-4">
            <Users className="h-6 w-6" />
          </div>
          <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Total Customers</p>
          <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalCustomers}</p>
        </div>

        <div className={`panel rounded-2xl border p-6 ${
          isLight 
            ? 'bg-white border-gray-200' 
            : 'bg-[#0D0D0D]/50 border-white/10'
        }`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400 mb-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Avg Order Value</p>
          <p className={`text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {avgOrderValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={`panel rounded-2xl border p-6 ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-[#0D0D0D]/50 border-white/10'
      }`}>
        <h2 className={`text-lg font-semibold mb-6 ${isLight ? 'text-gray-900' : 'text-white'}`}>Revenue Trend</h2>
        <div className="h-64 flex items-end gap-4">
          {mockRevenueData.map((data) => {
            const maxHeight = Math.max(...mockRevenueData.map((d) => d.revenue));
            const height = (data.revenue / maxHeight) * 100;
            return (
              <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-[#C9A84C]/50 to-[#C9A84C] transition-all hover:from-[#C9A84C]/70 hover:to-[#C9A84C] cursor-pointer" style={{ height: `${height}%` }}>
                  <div className={`opacity-0 hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap ${
                    isLight ? 'bg-gray-800 text-white' : 'bg-[#0A0A0A] text-white'
                  }`}>
                    Rs {data.revenue.toLocaleString()}
                  </div>
                </div>
                <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className={`panel rounded-2xl border overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-[#0D0D0D]/50 border-white/10'
      }`}>
        <div className={`p-6 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Top Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${
              isLight 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-white/10 bg-[#0A0A0A]/50'
            }`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Product</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Brand</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Sales</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Revenue</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isLight ? 'divide-gray-200' : 'divide-white/5'
            }`}>
              {mockTopProducts.map((product, index) => (
                <tr key={product.id} className={`transition-colors ${
                  isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                }`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{product.name}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{product.brand}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{product.sales}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className={`panel rounded-2xl border overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200' 
          : 'bg-[#0D0D0D]/50 border-white/10'
      }`}>
        <div className={`p-6 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Daily Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${
              isLight 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-white/10 bg-[#0A0A0A]/50'
            }`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Date</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Revenue</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Orders</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Customers</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Avg Order</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isLight ? 'divide-gray-200' : 'divide-white/5'
            }`}>
              {mockRevenueData.map((data) => (
                <tr key={data.date} className={`transition-colors ${
                  isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                }`}>
                  <td className={`px-6 py-4 text-sm flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    <Calendar className={`h-4 w-4 ${isLight ? 'text-gray-400' : 'text-gray-400'}`} />
                    {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className={`px-6 py-4 text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>Rs {data.revenue.toLocaleString()}</td>
                  <td className={`px-6 py-4 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{data.orders}</td>
                  <td className={`px-6 py-4 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{data.customers}</td>
                  <td className={`px-6 py-4 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Rs {(data.revenue / data.orders).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
