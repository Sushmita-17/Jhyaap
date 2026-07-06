import { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Eye,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { useOrdersStore } from '@/store/ordersStore';
import { useCatalogStore } from '@/store/catalogStore';
import { AdminBillsModal } from '@/components/admin/AdminBillsModal';
import { useAdminBills, useAdminBillDetail } from '@/hooks/useAdminData';
import { useThemeStore } from '@/store/themeStore';

type Period = 'daily' | 'monthly' | 'yearly';

/* ── helpers ─────────────────────────────────────────── */

function randomSeed(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 11) % 2147483647;
    return (s % 1000) / 1000;
  };
}

function generateDemoData(period: Period) {
  const rand = randomSeed(42);

  if (period === 'daily') {
    const labels: string[] = [];
    const values: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      values.push(Math.round(8000 + rand() * 42000));
    }
    return { labels, values };
  }

  if (period === 'monthly') {
    const labels: string[] = [];
    const values: number[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      values.push(Math.round(120000 + rand() * 580000));
    }
    return { labels, values };
  }

  // yearly
  const labels: string[] = [];
  const values: number[] = [];
  const year = new Date().getFullYear();
  for (let i = 4; i >= 0; i--) {
    labels.push(String(year - i));
    values.push(Math.round(800000 + rand() * 4200000));
  }
  return { labels, values };
}

const DONUT_COLORS = [
  '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  '#14b8a6',
];

/* ── KPI Card ────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const up = change >= 0;
  const [animatedValue, setAnimatedValue] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = numericValue / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) {
        setAnimatedValue(numericValue);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [numericValue]);
  
  const displayValue = value.includes('Rs') ? `Rs ${animatedValue.toLocaleString()}` : animatedValue.toLocaleString();
  
  return (
    <div className={`panel p-3 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 hover:scale-[1.02] group relative overflow-hidden ${
      isLight 
        ? 'bg-white border-gray-200 hover:shadow-gray-100' 
        : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{label}</p>
          <p className={`mt-0.5 text-xl font-bold lg:text-2xl tracking-tight group-hover:text-[#C9A84C] transition-colors animate-fade-in ${isLight ? 'text-gray-900' : 'text-white'}`}>{displayValue}</p>
          <p className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-bold border rounded-full px-1.5 py-0.5 ${
            up 
              ? 'bg-green-500/15 text-green-400 border-green-500/20 shadow-lg shadow-green-500/10 animate-pulse-slow' 
              : 'bg-red-500/15 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10 animate-pulse-slow'
          }`}>
            {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
            {Math.abs(change)}% vs prev period
          </p>
        </div>
        <span className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-float`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

/* ── SVG Bar Chart ───────────────────────────────────── */

function BarChartSVG({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const max = Math.max(...values, 1);
  const chartW = 700;
  const chartH = 150;
  const padL = 50;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const barGap = 4;
  const barW = Math.max(8, (innerW - barGap * (labels.length + 1)) / labels.length);

  const gridLines = 5;
  const gridVals = Array.from({ length: gridLines + 1 }, (_, i) => Math.round((max / gridLines) * i));

  const formatVal = (v: number) => {
    if (v >= 1000000) return `Rs ${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `Rs ${(v / 1000).toFixed(0)}K`;
    return `Rs ${v}`;
  };

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#D4B06C" />
          <stop offset="100%" stopColor="#A68B3D" />
        </linearGradient>
        <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C46E" />
          <stop offset="50%" stopColor="#E5B45E" />
          <stop offset="100%" stopColor="#D4A44E" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {gridVals.map((gv, i) => {
        const y = padT + innerH - (gv / max) * innerH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
              {formatVal(gv)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {values.map((v, i) => {
        const barH = (v / max) * innerH;
        const x = padL + barGap + i * (barW + barGap);
        const y = padT + innerH - barH;
        const isHovered = hoveredIdx === i;

        return (
          <g
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={isHovered ? 'url(#barGradHover)' : 'url(#barGrad)'}
              opacity={hoveredIdx !== null && !isHovered ? 0.4 : 1}
              filter={isHovered ? 'url(#strongGlow)' : undefined}
              style={{ transition: 'opacity 0.2s, y 0.3s, height 0.3s' }}
            />

            {/* X-axis label */}
            <text
              x={x + barW / 2}
              y={chartH - padB + 16}
              textAnchor="middle"
              fill={isHovered ? '#C9A84C' : '#94a3b8'}
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight={isHovered ? 700 : 400}
            >
              {labels[i]}
            </text>

            {/* Tooltip */}
            {isHovered && (
              <g>
                <rect
                  x={x + barW / 2 - 40}
                  y={y - 30}
                  width={80}
                  height={22}
                  rx={6}
                  fill="#0A0A0A"
                  stroke="#C9A84C"
                  strokeWidth="1"
                  filter="url(#glow)"
                />
                <text
                  x={x + barW / 2}
                  y={y - 15}
                  textAnchor="middle"
                  fill="#C9A84C"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {formatVal(v)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── SVG Donut Chart ─────────────────────────────────── */

function DonutChartSVG({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const cx = 70;
  const cy = 70;
  const r = 55;
  const strokeW = 18;

  let cumAngle = -90;

  const arcs = segments.map((seg, i) => {
    const pct = seg.value / total;
    const angle = pct * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const largeArc = angle > 180 ? 1 : 0;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

    return { ...seg, path, pct, i };
  });

  return (
    <div className="flex flex-col items-center gap-3 lg:flex-row lg:gap-4">
      <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0 w-full max-w-[140px] h-auto">
        {arcs.map((arc) => (
          <path
            key={arc.i}
            d={arc.path}
            fill="none"
            stroke={arc.color}
            strokeWidth={hoveredIdx === arc.i ? strokeW + 6 : strokeW}
            strokeLinecap="round"
            opacity={hoveredIdx !== null && hoveredIdx !== arc.i ? 0.3 : 1}
            onMouseEnter={() => setHoveredIdx(arc.i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: 'pointer', transition: 'stroke-width 0.2s, opacity 0.2s' }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Inter, sans-serif">
          Total Sales
        </text>
      </svg>

      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2 text-sm lg:grid-cols-1">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
              hoveredIdx === i ? 'bg-white/5' : ''
            }`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ background: seg.color }} />
            <span className="flex-1 truncate text-night-300">{seg.label}</span>
            <span className="font-semibold text-white">{seg.value}</span>
            <span className="text-xs text-night-500">({((seg.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Reports Page ───────────────────────────────── */

export default function AdminReportsPage() {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  const [period, setPeriod] = useState<Period>('daily');
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [billsModal, setBillsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { bills: billsData, loading: billsLoading } = useAdminBills(1, 20);
  const { bill: selectedBill, loading: billLoading, error: billError } = useAdminBillDetail(selectedBillId);

  const orders = useOrdersStore((s) => s.orders);
  const categories = useCatalogStore((s) => s.getCategories());
  const products = useCatalogStore((s) => s.products);

  const barData = useMemo(() => generateDemoData(period), [period]);

  const handleViewBill = (billId: string) => {
    setSelectedBillId(billId);
    setBillsModal(true);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const itemsSold = orders.reduce((s, o) => s + o.items.reduce((a, it) => a + it.quantity, 0), 0);

  // demo data for category breakdown donut
  const catSegments = useMemo(() => {
    const rand = randomSeed(77);
    return categories.slice(0, 10).map((cat, i) => ({
      label: cat.name,
      value: cat.count + Math.round(rand() * 40),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [categories]);

  // demo data for payment method donut
  const paymentSegments = [
    { label: 'Cash on Delivery', value: 58, color: '#f59e0b' },
    { label: 'eSewa', value: 27, color: '#10b981' },
    { label: 'Khalti', value: 15, color: '#8b5cf6' },
  ];

  // demo data for order status donut
  const statusSegments = [
    { label: 'Delivered', value: 142, color: '#22c55e' },
    { label: 'Out for Delivery', value: 18, color: '#3b82f6' },
    { label: 'Preparing', value: 12, color: '#f59e0b' },
    { label: 'Placed', value: 8, color: '#94a3b8' },
    { label: 'Cancelled', value: 5, color: '#ef4444' },
  ];

  // Best sellers table data
  const bestSellers = useMemo(() => {
    const rand = randomSeed(99);
    return products.slice(0, 8).map((p) => ({
      name: p.name,
      category: p.category,
      unitsSold: Math.round(20 + rand() * 180),
      revenue: Math.round(5000 + rand() * 95000),
    }));
  }, [products]);

  const handleExportCSV = () => {
    const rows = [
      ['Period', 'Label', 'Revenue (Rs)'],
      ...barData.labels.map((l, i) => [period, l, String(barData.values[i])]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jhyaap_report_${period}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periods: { key: Period; label: string; icon: React.ElementType }[] = [
    { key: 'daily', label: 'Daily', icon: Calendar },
    { key: 'monthly', label: 'Monthly', icon: BarChart3 },
    { key: 'yearly', label: 'Yearly', icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* Header */}
      <div className={`panel flex flex-wrap items-center justify-between gap-6 border-[#C9A84C]/30 bg-gradient-to-r from-[#C9A84C]/15 via-[#C9A84C]/5 to-transparent p-4 shadow-2xl shadow-[#C9A84C]/20 animate-gradient-x bg-[length:200%_200%] backdrop-blur-xl relative overflow-hidden ${
        isLight ? 'border-gray-200' : ''
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
        <div className="relative">
          <h1 className={`font-display text-2xl font-bold md:text-3xl tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
            isLight 
              ? 'text-gray-900 from-gray-900 to-gray-700' 
              : 'text-white from-white to-white/80'
          }`}>Reports & Analytics</h1>
          <p className={`mt-1 text-xs ${isLight ? 'text-gray-600' : 'text-[#888888]'}`}>
            Comprehensive sales insights and billing for Jhyaap Station
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="relative inline-flex items-center gap-2 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/15 px-4 py-2 text-xs font-bold text-[#C9A84C] transition-all hover:bg-[#C9A84C]/25 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:scale-105"
        >
          <Download className="h-3 w-3" />
          Export CSV
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Net Revenue"
          value={`Rs ${totalRevenue > 0 ? totalRevenue.toLocaleString() : '1,248,500'}`}
          change={12.4}
          icon={DollarSign}
          color="bg-[#C9A84C]/20 text-[#C9A84C]"
        />
        <KpiCard
          label="Total Orders"
          value={totalOrders > 0 ? String(totalOrders) : '185'}
          change={8.2}
          icon={ShoppingCart}
          color="bg-sky-500/20 text-sky-400"
        />
        <KpiCard
          label="Avg Order Value"
          value={`Rs ${avgOrderValue > 0 ? avgOrderValue.toLocaleString() : '6,749'}`}
          change={3.1}
          icon={TrendingUp}
          color="bg-green-500/20 text-green-400"
        />
        <KpiCard
          label="Items Sold"
          value={itemsSold > 0 ? String(itemsSold) : '462'}
          change={-2.3}
          icon={Package}
          color="bg-purple-500/20 text-purple-400"
        />
      </div>

      {/* Period Selector */}
      <div className={`flex items-center gap-3 p-1 backdrop-blur-sm rounded-xl border w-fit shadow-lg ${
        isLight 
          ? 'bg-gray-100 border-gray-200' 
          : 'bg-[#1A1A1A]/80 border-white/10'
      }`}>
        {periods.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
              period === key
                ? 'bg-[#C9A84C]/20 text-[#C9A84C] shadow-lg shadow-[#C9A84C]/20'
                : `${isLight ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-900' : 'text-[#888888] hover:bg-white/5 hover:text-white'} hover:shadow-md`
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className={`panel p-3 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200 hover:shadow-gray-100' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className="relative mb-3 flex items-center justify-between">
          <div>
            <h2 className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Revenue Overview</h2>
            <p className={`text-[10px] mt-0.5 ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>
              {period === 'daily' ? 'Last 7 days' : period === 'monthly' ? 'Last 6 months' : 'Last 5 years'}
            </p>
          </div>
          <span className="rounded-full bg-[#C9A84C]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] border border-[#C9A84C]/30 shadow-lg shadow-[#C9A84C]/20 animate-pulse-slow">
            {period}
          </span>
        </div>
        <BarChartSVG labels={barData.labels} values={barData.values} />
      </div>

      {/* Donut Charts Row */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className={`panel p-3 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200 hover:shadow-gray-100' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <h2 className={`relative mb-3 text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Sales by Category</h2>
          <DonutChartSVG segments={catSegments} />
        </div>

        <div className={`panel p-3 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200 hover:shadow-gray-100' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <h2 className={`relative mb-3 text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Payment Methods</h2>
          <DonutChartSVG segments={paymentSegments} />
        </div>

        <div className={`panel p-3 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
          isLight 
            ? 'bg-white border-gray-200 hover:shadow-gray-100' 
            : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <h2 className={`relative mb-3 text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Order Status</h2>
          <DonutChartSVG segments={statusSegments} />
        </div>
      </div>

      {/* Best Sellers Table */}
      <div className={`panel overflow-hidden backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200 hover:shadow-gray-100' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className={`relative border-b px-3 py-2 ${
          isLight 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-white/10 bg-[#0A0A0A]/30'
        }`}>
          <h2 className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Best Selling Products</h2>
          <p className={`mt-0.5 text-[10px] ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>Top performers by units sold</p>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead className={`text-[10px] uppercase tracking-wider ${
              isLight 
                ? 'bg-gray-50 text-gray-500' 
                : 'bg-[#0A0A0A]/60 text-[#888888]'
            }`}>
              <tr>
                <th className="px-3 py-1.5 font-semibold">#</th>
                <th className="px-3 py-1.5 font-semibold">Product</th>
                <th className="px-3 py-1.5 font-semibold">Category</th>
                <th className="px-3 py-1.5 font-semibold text-right">Units Sold</th>
                <th className="px-3 py-1.5 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isLight ? 'divide-gray-200' : 'divide-white/5'
            }`}>
              {bestSellers
                .sort((a, b) => b.unitsSold - a.unitsSold)
                .map((item, i) => (
                  <tr key={i} className={`hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group ${
                    isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.05]'
                  }`}>
                    <td className={`px-3 py-1.5 font-medium group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>{i + 1}</td>
                    <td className={`px-3 py-1.5 font-semibold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.name}</td>
                    <td className="px-3 py-1.5 capitalize text-[#C9A84C] font-medium">{item.category}</td>
                    <td className={`px-3 py-1.5 text-right group-hover:text-white transition-colors ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-[#888888]'}`}>{item.unitsSold}</td>
                    <td className={`px-3 py-1.5 text-right font-bold group-hover:text-[#C9A84C] transition-colors ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      Rs {item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Heatmap / Hourly */}
      <div className={`panel p-3 backdrop-blur-xl border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden ${
        isLight 
          ? 'bg-white border-gray-200 hover:shadow-gray-100' 
          : 'bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <h2 className={`relative mb-1 text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Peak Order Hours</h2>
        <p className={`relative mb-2 text-[10px] ${isLight ? 'text-gray-500' : 'text-[#888888]'}`}>When customers order most frequently</p>
        <div className="relative grid grid-cols-12 gap-0.5">
          {Array.from({ length: 24 }, (_, h) => {
            const rand = randomSeed(h * 7 + 3);
            const intensity = rand();
            const orders = Math.round(intensity * 28);
            return (
              <div key={h} className="group relative">
                <div
                  className="flex aspect-square items-center justify-center rounded text-[7px] font-semibold transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#C9A84C]/30"
                  style={{
                    background: `rgba(201, 168, 76, ${0.08 + intensity * 0.55})`,
                    color: intensity > 0.5 ? '#fef3c7' : '#92400e',
                  }}
                >
                  {h}h
                </div>
                <div className="pointer-events-none absolute -top-5 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-[#0A0A0A] backdrop-blur-sm px-1 py-0.5 text-[7px] font-semibold text-[#C9A84C] shadow-lg ring-1 ring-[#C9A84C]/30 group-hover:block animate-fade-in">
                  {orders} orders
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bills Section */}
      <div className="panel overflow-hidden bg-gradient-to-br from-[#1A1A1A]/80 to-[#0F0F0F]/80 backdrop-blur-xl border border-white/10 hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#C9A84C]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
        <div className="relative border-b border-white/10 px-3 py-2 bg-[#0A0A0A]/30 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <FileText className="h-3 w-3 text-[#C9A84C] animate-pulse-slow" />
              Recent Bills
            </h2>
            <p className="mt-0.5 text-[10px] text-[#888888]">Latest invoices and transactions</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative border-b border-white/10 px-3 py-2 bg-[#1A1A1A]/50">
          <div className="flex items-center gap-2 bg-[#0A0A0A]/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/5 hover:border-[#C9A84C]/30 focus-within:border-[#C9A84C]/50 focus-within:shadow-lg focus-within:shadow-[#C9A84C]/20 transition-all duration-300">
            <Search className="h-2.5 w-2.5 text-[#888888]" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-[10px] text-white placeholder-[#888888] outline-none"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="relative overflow-x-auto">
          {billsLoading ? (
            <div className="flex items-center justify-center h-20 text-[#888888]">
              <p>Loading bills...</p>
            </div>
          ) : billsData.filter(bill =>
            bill.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.customer_phone.includes(searchTerm)
          ).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-[#888888]">
              <FileText className="h-5 w-5 mb-2 opacity-50" />
              <p className="text-[10px]">No bills found</p>
            </div>
          ) : (
            <table className="w-full text-left text-[10px]">
              <thead className="bg-[#0A0A0A]/60 text-[10px] uppercase tracking-wider text-[#888888] sticky top-0">
                <tr>
                  <th className="px-3 py-1.5 font-semibold">Order #</th>
                  <th className="px-3 py-1.5 font-semibold">Customer</th>
                  <th className="px-3 py-1.5 font-semibold">Method</th>
                  <th className="px-3 py-1.5 font-semibold text-right">Amount</th>
                  <th className="px-3 py-1.5 font-semibold">Status</th>
                  <th className="px-3 py-1.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {billsData
                  .filter(bill =>
                    bill.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    bill.customer_phone.includes(searchTerm)
                  )
                  .slice(0, 10)
                  .map((bill, index) => (
                    <tr key={bill.id} className="hover:bg-white/[0.05] hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all duration-300 group" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-3 py-1.5 font-mono text-[#C9A84C] font-semibold group-hover:text-[#C9A84C]/80 transition-colors">{bill.order_number}</td>
                      <td className="px-3 py-1.5 text-white">
                        <div>
                          <p className="font-semibold group-hover:text-[#C9A84C] transition-colors">{bill.customer_name}</p>
                          <p className="text-[10px] text-[#888888] group-hover:text-[#666666] transition-colors">{bill.customer_phone}</p>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 capitalize text-[#888888] group-hover:text-white transition-colors">{bill.payment_method}</td>
                      <td className="px-3 py-1.5 text-right font-bold text-white group-hover:text-[#C9A84C] transition-colors">Rs {bill.total_amount.toLocaleString()}</td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          bill.order_status === 'delivered'
                            ? 'bg-green-500/15 text-green-400 border-green-500/20 shadow-lg shadow-green-500/10'
                            : bill.order_status === 'cancelled'
                            ? 'bg-red-500/15 text-red-400 border-red-500/20 shadow-lg shadow-red-500/10'
                            : 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/20 shadow-lg shadow-[#C9A84C]/10'
                        }`}>
                          {bill.order_status}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          onClick={() => handleViewBill(bill.id)}
                          className="inline-flex items-center gap-1 text-[#C9A84C] hover:text-[#C9A84C]/80 transition-colors font-semibold text-[10px] hover:underline hover:scale-105 inline-block"
                        >
                          <Eye className="h-2.5 w-2.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bills Modal */}
      <AdminBillsModal bill={selectedBill} isOpen={billsModal} onClose={() => setBillsModal(false)} />
    </div>
  );
}