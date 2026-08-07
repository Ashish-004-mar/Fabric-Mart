import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Order } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Layers,
  Calendar,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
  Package,
} from 'lucide-react';

interface SpendingTrendsChartProps {
  orders: Order[];
}

export interface MonthlySpendData {
  month: string;
  monthShort: string;
  year: number;
  totalSpend: number;
  ordersCount: number;
  totalMeters: number;
  silkSpend: number;
  linenSpend: number;
  cottonSpend: number;
  syntheticSpend: number;
  woolSpend: number;
}

// 6 Months baseline dataset for Atelier Modern Fashions buyer history
const HISTORICAL_6_MONTH_BASELINE: MonthlySpendData[] = [
  {
    month: 'March 2026',
    monthShort: 'Mar',
    year: 2026,
    totalSpend: 4250.00,
    ordersCount: 2,
    totalMeters: 220,
    silkSpend: 1800,
    linenSpend: 1200,
    cottonSpend: 750,
    syntheticSpend: 500,
    woolSpend: 0,
  },
  {
    month: 'April 2026',
    monthShort: 'Apr',
    year: 2026,
    totalSpend: 5800.00,
    ordersCount: 3,
    totalMeters: 340,
    silkSpend: 2400,
    linenSpend: 1500,
    cottonSpend: 1100,
    syntheticSpend: 800,
    woolSpend: 0,
  },
  {
    month: 'May 2026',
    monthShort: 'May',
    year: 2026,
    totalSpend: 3900.00,
    ordersCount: 2,
    totalMeters: 190,
    silkSpend: 1200,
    linenSpend: 900,
    cottonSpend: 1000,
    syntheticSpend: 800,
    woolSpend: 0,
  },
  {
    month: 'June 2026',
    monthShort: 'Jun',
    year: 2026,
    totalSpend: 7450.00,
    ordersCount: 4,
    totalMeters: 480,
    silkSpend: 3100,
    linenSpend: 2100,
    cottonSpend: 1450,
    syntheticSpend: 800,
    woolSpend: 0,
  },
  {
    month: 'July 2026',
    monthShort: 'Jul',
    year: 2026,
    totalSpend: 4080.00, // Matches Order-102 from mock data
    ordersCount: 2,
    totalMeters: 260,
    silkSpend: 0,
    linenSpend: 0,
    cottonSpend: 0,
    syntheticSpend: 4080,
    woolSpend: 0,
  },
  {
    month: 'August 2026',
    monthShort: 'Aug',
    year: 2026,
    totalSpend: 3441.00, // Matches Order-101 from mock data
    ordersCount: 1,
    totalMeters: 150,
    silkSpend: 1225,
    linenSpend: 1850,
    cottonSpend: 366,
    syntheticSpend: 0,
    woolSpend: 0,
  },
];

const CATEGORY_COLORS = {
  silk: '#8b5cf6',      // Purple
  linen: '#3b82f6',     // Blue
  cotton: '#10b981',    // Emerald
  synthetic: '#f59e0b', // Amber
  wool: '#ec4899',      // Pink
};

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ orders }) => {
  const [viewMetric, setViewMetric] = useState<'spend' | 'volume' | 'orders'>('spend');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'category'>('area');

  // Dynamically blend recent placed orders into the 6-month timeline
  const trendData = useMemo(() => {
    // Check if the current order set is for the demo user (contains order-101 or order-102)
    const isDemoAccount = orders.some((o) => o.id === 'order-101' || o.id === 'order-102');

    if (isDemoAccount) {
      const dataMap: Record<string, MonthlySpendData> = {};
      HISTORICAL_6_MONTH_BASELINE.forEach((item) => {
        dataMap[item.monthShort] = { ...item };
      });

      orders.forEach((ord) => {
        if (!ord.createdAt) return;
        const date = new Date(ord.createdAt);
        const monthShort = date.toLocaleString('default', { month: 'short' });

        if (dataMap[monthShort] && ord.id !== 'order-101' && ord.id !== 'order-102') {
          const orderTotal = ord.grandTotal || ord.subtotal || 0;
          let totalMetersInOrder = 0;
          ord.items?.forEach((item) => {
            totalMetersInOrder += item.quantityMeters || 0;
          });

          dataMap[monthShort].totalSpend += orderTotal;
          dataMap[monthShort].ordersCount += 1;
          dataMap[monthShort].totalMeters += totalMetersInOrder;
          dataMap[monthShort].cottonSpend += orderTotal * 0.4;
          dataMap[monthShort].linenSpend += orderTotal * 0.6;
        }
      });

      return Object.values(dataMap);
    }

    // For new registered users (e.g. Raghav), build timeline dynamically from THEIR actual orders
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const dataMap: Record<string, MonthlySpendData> = {};
    months.forEach((m) => {
      dataMap[m] = {
        month: `${m} 2026`,
        monthShort: m,
        year: 2026,
        totalSpend: 0,
        ordersCount: 0,
        totalMeters: 0,
        silkSpend: 0,
        linenSpend: 0,
        cottonSpend: 0,
        syntheticSpend: 0,
        woolSpend: 0,
      };
    });

    orders.forEach((ord) => {
      if (!ord.createdAt) return;
      const date = new Date(ord.createdAt);
      const monthShort = date.toLocaleString('default', { month: 'short' });
      const targetMonth = dataMap[monthShort] ? monthShort : 'Aug';

      const orderTotal = ord.grandTotal || ord.subtotal || 0;
      let totalMetersInOrder = 0;
      ord.items?.forEach((item) => {
        totalMetersInOrder += item.quantityMeters || 0;
      });

      dataMap[targetMonth].totalSpend += orderTotal;
      dataMap[targetMonth].ordersCount += 1;
      dataMap[targetMonth].totalMeters += totalMetersInOrder;
      dataMap[targetMonth].cottonSpend += orderTotal * 0.5;
      dataMap[targetMonth].linenSpend += orderTotal * 0.5;
    });

    return Object.values(dataMap);
  }, [orders]);

  // Calculated Stats
  const total6MonthSpend = useMemo(
    () => trendData.reduce((sum, item) => sum + item.totalSpend, 0),
    [trendData]
  );

  const avgMonthlySpend = total6MonthSpend / (trendData.length || 1);

  const totalOrdersCount = useMemo(
    () => trendData.reduce((sum, item) => sum + item.ordersCount, 0),
    [trendData]
  );

  const totalMetersPurchased = useMemo(
    () => trendData.reduce((sum, item) => sum + item.totalMeters, 0),
    [trendData]
  );

  const momGrowth = useMemo(() => {
    if (trendData.length < 2) return 0;
    const lastMonth = trendData[trendData.length - 1].totalSpend;
    const prevMonth = trendData[trendData.length - 2].totalSpend;
    if (prevMonth === 0) return 100;
    return ((lastMonth - prevMonth) / prevMonth) * 100;
  }, [trendData]);

  // Aggregate Category distribution for Pie chart
  const categoryData = useMemo(() => {
    const totals = {
      Silk: 0,
      Linen: 0,
      Cotton: 0,
      Synthetic: 0,
      Wool: 0,
    };

    trendData.forEach((item) => {
      totals.Silk += item.silkSpend;
      totals.Linen += item.linenSpend;
      totals.Cotton += item.cottonSpend;
      totals.Synthetic += item.syntheticSpend;
      totals.Wool += item.woolSpend;
    });

    return [
      { name: 'Silk & Charmeuse', value: totals.Silk, color: CATEGORY_COLORS.silk },
      { name: 'Organic Linen', value: totals.Linen, color: CATEGORY_COLORS.linen },
      { name: 'Cotton & Slub', value: totals.Cotton, color: CATEGORY_COLORS.cotton },
      { name: 'Tech Synthetics', value: totals.Synthetic, color: CATEGORY_COLORS.synthetic },
      { name: 'Wool & Suiting', value: totals.Wool, color: CATEGORY_COLORS.wool },
    ].filter((cat) => cat.value > 0);
  }, [trendData]);

  // Formatters
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Sourcing & Spending Analytics</span>
            </h2>
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              LAST 6 MONTHS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track fabric procurement expenditure, order volume, and category allocation across mills.
          </p>
        </div>

        {/* CONTROLS TOGGLE BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Metric Selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMetric('spend')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                viewMetric === 'spend'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Spend ($)</span>
            </button>
            <button
              onClick={() => setViewMetric('volume')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                viewMetric === 'volume'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Meters (m)</span>
            </button>
            <button
              onClick={() => setViewMetric('orders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                viewMetric === 'orders'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders (#)</span>
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setChartType('area')}
              title="Gradient Area Trend"
              className={`p-1.5 rounded-lg font-bold transition-all ${
                chartType === 'area'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart Breakdown"
              className={`p-1.5 rounded-lg font-bold transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('category')}
              title="Category Distribution Donut"
              className={`p-1.5 rounded-lg font-bold transition-all ${
                chartType === 'category'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SUMMARY METRICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">6-Month Total Spend</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(total6MonthSpend)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold mt-1 text-slate-500">
            <span>Across 6 active sourcing cycles</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Avg. Monthly Spend</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(avgMonthlySpend)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Budget target: $5,000 / mo</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Recent MoM Trajectory</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-xl font-black ${momGrowth < 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
              {momGrowth.toFixed(1)}%
            </span>
            {momGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-blue-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Comparing Aug to Jul spend</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Fabric Sourced</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {totalMetersPurchased.toLocaleString()} m
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{totalOrdersCount} POs processed</span>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION CANVAS */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'category' ? (
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const percent = ((Number(data.value) / total6MonthSpend) * 100).toFixed(1);
                    return (
                      <div className="bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
                          <span className="font-bold">{data.name}</span>
                        </div>
                        <div className="text-slate-300">
                          Total Spend: <span className="font-bold text-white">{formatCurrency(Number(data.value))}</span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Share of 6-Month Budget: <span className="font-bold text-emerald-400">{percent}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{value}</span>}
              />
            </PieChart>
          ) : chartType === 'bar' ? (
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="monthShort" tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) =>
                  viewMetric === 'spend' ? `$${val / 1000}k` : viewMetric === 'volume' ? `${val}m` : val
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MonthlySpendData;
                    return (
                      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5">
                        <p className="font-bold text-blue-400 border-b border-slate-800 pb-1">{item.month}</p>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Total Spend:</span>
                          <span className="font-bold text-white">{formatCurrency(item.totalSpend)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Orders Count:</span>
                          <span className="font-bold text-white">{item.ordersCount} POs</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Fabric Volume:</span>
                          <span className="font-bold text-indigo-400">{item.totalMeters} meters</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey={
                  viewMetric === 'spend' ? 'totalSpend' : viewMetric === 'volume' ? 'totalMeters' : 'ordersCount'
                }
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          ) : (
            // Default AREA CHART with smooth gradient fill
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="monthShort" tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) =>
                  viewMetric === 'spend' ? `$${val / 1000}k` : viewMetric === 'volume' ? `${val}m` : val
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MonthlySpendData;
                    return (
                      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-2">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5">
                          <span className="font-extrabold text-blue-400">{item.month}</span>
                          <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-mono">
                            {item.ordersCount} {item.ordersCount === 1 ? 'Order' : 'Orders'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Sourcing Expenditure:</span>
                            <span className="font-bold text-white">{formatCurrency(item.totalSpend)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Volume Purchased:</span>
                            <span className="font-bold text-indigo-300">{item.totalMeters} meters</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-2">
                            <span>Silk: ${item.silkSpend}</span>
                            <span>Linen: ${item.linenSpend}</span>
                            <span>Cotton: ${item.cottonSpend}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={
                  viewMetric === 'spend' ? 'totalSpend' : viewMetric === 'volume' ? 'totalMeters' : 'ordersCount'
                }
                stroke={viewMetric === 'spend' ? '#3b82f6' : viewMetric === 'volume' ? '#6366f1' : '#10b981'}
                strokeWidth={3}
                fillOpacity={1}
                fill={
                  viewMetric === 'spend'
                    ? 'url(#spendGradient)'
                    : viewMetric === 'volume'
                    ? 'url(#volumeGradient)'
                    : 'url(#ordersGradient)'
                }
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* FOOTER LEGEND & INSIGHTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong className="text-slate-700 dark:text-slate-200">AI Purchasing Insight:</strong> Peak fabric expenditure occurred in <strong>June 2026 ($7,450)</strong> due to seasonal autumn collection sampling.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Silk & Charmeuse</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Linen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Cotton</span>
          </div>
        </div>
      </div>
    </div>
  );
};
