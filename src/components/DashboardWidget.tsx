import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { Order, Product } from '../types';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Package,
  DollarSign,
  ShoppingBag,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface DashboardWidgetProps {
  orders?: Order[];
  products?: Product[];
}

export interface DailyVolumeData {
  date: string;
  dayShort: string;
  orderCount: number;
  meterVolume: number;
  revenue: number;
}

export interface CategorySalesData {
  category: string;
  totalMeters: number;
  revenue: number;
  orderCount: number;
  color: string;
}

// 14-Day Baseline Daily Order Volume Data for Apex Textiles Mill
const SEED_DAILY_VOLUME: DailyVolumeData[] = [
  { date: '2026-07-22', dayShort: 'Jul 22', orderCount: 3, meterVolume: 420, revenue: 6720 },
  { date: '2026-07-23', dayShort: 'Jul 23', orderCount: 2, meterVolume: 280, revenue: 4480 },
  { date: '2026-07-24', dayShort: 'Jul 24', orderCount: 5, meterVolume: 650, revenue: 10400 },
  { date: '2026-07-25', dayShort: 'Jul 25', orderCount: 4, meterVolume: 510, revenue: 8160 },
  { date: '2026-07-26', dayShort: 'Jul 26', orderCount: 1, meterVolume: 150, revenue: 2400 },
  { date: '2026-07-27', dayShort: 'Jul 27', orderCount: 6, meterVolume: 820, revenue: 13120 },
  { date: '2026-07-28', dayShort: 'Jul 28', orderCount: 4, meterVolume: 580, revenue: 9280 },
  { date: '2026-07-29', dayShort: 'Jul 29', orderCount: 7, meterVolume: 940, revenue: 15040 },
  { date: '2026-07-30', dayShort: 'Jul 30', orderCount: 3, meterVolume: 390, revenue: 6240 },
  { date: '2026-07-31', dayShort: 'Jul 31', orderCount: 5, meterVolume: 710, revenue: 11360 },
  { date: '2026-08-01', dayShort: 'Aug 01', orderCount: 8, meterVolume: 1120, revenue: 17920 },
  { date: '2026-08-02', dayShort: 'Aug 02', orderCount: 4, meterVolume: 600, revenue: 9600 },
  { date: '2026-08-03', dayShort: 'Aug 03', orderCount: 6, meterVolume: 880, revenue: 14080 },
  { date: '2026-08-04', dayShort: 'Aug 04', orderCount: 9, meterVolume: 1350, revenue: 21600 },
];

// Baseline Category Distribution for Apex Textiles Mill
const SEED_CATEGORY_SALES: CategorySalesData[] = [
  { category: 'Organic Linen', totalMeters: 3850, revenue: 71225, orderCount: 24, color: '#3b82f6' },
  { category: 'Mulberry Silk', totalMeters: 2640, revenue: 64680, orderCount: 18, color: '#8b5cf6' },
  { category: 'GOTS Cotton', totalMeters: 2100, revenue: 34650, orderCount: 15, color: '#10b981' },
  { category: 'Tech Synthetics', totalMeters: 1450, revenue: 23200, orderCount: 11, color: '#f59e0b' },
  { category: 'Wool Suiting', totalMeters: 980, revenue: 27440, orderCount: 8, color: '#ec4899' },
  { category: 'Jacquard / Brocade', totalMeters: 620, revenue: 19840, orderCount: 5, color: '#06b6d4' },
];

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ orders = [], products = [] }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('14d');
  const [lineMetric, setLineMetric] = useState<'volume' | 'orders' | 'revenue'>('volume');

  // Daily Order Volume dynamic calculation
  const dailyVolumeData = useMemo(() => {
    let data = SEED_DAILY_VOLUME.map((item) => ({ ...item }));

    // Filter time window
    if (timeRange === '7d') {
      data = data.slice(-7);
    }

    // Merge recent orders from prop if available
    if (orders && orders.length > 0) {
      orders.forEach((ord) => {
        if (!ord.createdAt) return;
        const orderDateStr = ord.createdAt.split('T')[0];
        const matchingDay = data.find((d) => d.date === orderDateStr);

        if (matchingDay) {
          const totalMeters = ord.items?.reduce((sum, item) => sum + (item.quantityMeters || 0), 0) || 100;
          matchingDay.orderCount += 1;
          matchingDay.meterVolume += totalMeters;
          matchingDay.revenue += ord.grandTotal || 0;
        }
      }      );
    }

    return data;
  }, [orders, timeRange]);

  // Category Sales Data computation
  const categorySalesData = useMemo(() => {
    const categoryMap: Record<string, CategorySalesData> = {};

    SEED_CATEGORY_SALES.forEach((c) => {
      categoryMap[c.category] = { ...c };
    });

    // Merge product catalog info or active orders if provided
    if (products && products.length > 0) {
      products.forEach((p) => {
        const catName = p.categoryName || 'Woven Fabrics';
        if (categoryMap[catName]) {
          categoryMap[catName].totalMeters += Math.floor(p.stockQuantity * 0.1);
        }
      });
    }

    return Object.values(categoryMap).sort((a, b) => b.totalMeters - a.totalMeters);
  }, [products]);

  // Aggregate stats
  const totalPeriodMeters = useMemo(
    () => dailyVolumeData.reduce((sum, d) => sum + d.meterVolume, 0),
    [dailyVolumeData]
  );

  const totalPeriodOrders = useMemo(
    () => dailyVolumeData.reduce((sum, d) => sum + d.orderCount, 0),
    [dailyVolumeData]
  );

  const totalPeriodRevenue = useMemo(
    () => dailyVolumeData.reduce((sum, d) => sum + d.revenue, 0),
    [dailyVolumeData]
  );

  const topCategoryName = categorySalesData[0]?.category || 'Organic Linen';

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Mill Sourcing & Order Analytics Hub</span>
            </h2>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              SUPPLIER INTEL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking of daily buyer order volume trajectory and top-performing fabric product categories.
          </p>
        </div>

        {/* TIME RANGE & METRIC SELECTOR */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === '14d'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Last 14 Days
            </button>
          </div>

          {/* Metric toggle for line chart */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setLineMetric('volume')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                lineMetric === 'volume'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Fabric Volume (m)</span>
            </button>
            <button
              onClick={() => setLineMetric('orders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                lineMetric === 'orders'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders (#)</span>
            </button>
            <button
              onClick={() => setLineMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                lineMetric === 'revenue'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Revenue ($)</span>
            </button>
          </div>
        </div>
      </div>

      {/* STAT SUMMARY HIGHLIGHTS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Volume Shipped</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {totalPeriodMeters.toLocaleString()} m
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+18.4% vs previous window</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Orders Executed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {totalPeriodOrders} POs
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Avg. 4.8 orders / day</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Gross Sourcing Revenue</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPeriodRevenue)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Avg price: $16.00/m</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Top Demand Category</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-black text-purple-600 dark:text-purple-400 truncate">
              {topCategoryName}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Highest re-order rate</span>
        </div>
      </div>

      {/* TWO CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* CHART 1: LINE CHART - DAILY ORDER VOLUME */}
        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Daily Order Volume Trend</span>
              </h3>
              <p className="text-[11px] text-slate-500">Order count and fabric quantity per day</p>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md">
              LINE CHART
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyVolumeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="dayShort" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => (lineMetric === 'revenue' ? `$${val / 1000}k` : val)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyVolumeData;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-blue-400">{data.date}</p>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Meter Volume:</span>
                            <span className="font-bold text-white">{data.meterVolume} m</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Order Count:</span>
                            <span className="font-bold text-emerald-400">{data.orderCount} POs</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Revenue:</span>
                            <span className="font-bold text-indigo-300">{formatCurrency(data.revenue)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={
                    lineMetric === 'volume' ? 'meterVolume' : lineMetric === 'orders' ? 'orderCount' : 'revenue'
                  }
                  stroke={lineMetric === 'volume' ? '#3b82f6' : lineMetric === 'orders' ? '#10b981' : '#8b5cf6'}
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: BAR CHART - TOP SELLING FABRIC CATEGORIES */}
        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Top-Selling Fabric Categories</span>
              </h3>
              <p className="text-[11px] text-slate-500">Meters sold by textile material breakdown</p>
            </div>
            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md">
              BAR CHART
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categorySalesData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis type="number" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  width={90}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CategorySalesData;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-purple-400">{data.category}</p>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Meters Sold:</span>
                            <span className="font-bold text-white">{data.totalMeters.toLocaleString()} m</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Category Revenue:</span>
                            <span className="font-bold text-emerald-400">{formatCurrency(data.revenue)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Buyer Purchase Orders:</span>
                            <span className="font-bold text-blue-300">{data.orderCount} POs</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalMeters" radius={[0, 8, 8, 0]}>
                  {categorySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FOOTER INSIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong className="text-slate-700 dark:text-slate-200">Supplier Intelligence:</strong> Organic Linen and Mulberry Silk account for <strong>68% of total gross order volume</strong> this month.
          </span>
        </div>
        <div className="flex items-center gap-2 text-blue-600 font-bold hover:underline cursor-pointer">
          <span>Export Analytics Report</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default DashboardWidget;
