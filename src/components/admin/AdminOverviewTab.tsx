import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AdminOverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Fabric Mart Admin Analytics...</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Marketplace Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time metric telemetry for Fabric Mart B2B wholesale fabric trade platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{stats.pendingProducts} Pending Products</span>
          </button>
          <button
            onClick={() => onNavigateTab('suppliers')}
            className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-xl border border-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>{stats.pendingSuppliersCount} Supplier Verification</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Buyers */}
        <div
          onClick={() => onNavigateTab('buyers')}
          className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Buyers</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{stats.totalBuyers}</span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
              +14% <TrendingUp className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified apparel procurement houses</p>
        </div>

        {/* Total Suppliers */}
        <div
          onClick={() => onNavigateTab('suppliers')}
          className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suppliers / Mills</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{stats.totalSuppliers}</span>
            <span className="text-[11px] font-semibold text-amber-400">{stats.pendingSuppliersCount} pending</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Certified global textile manufacturing mills</p>
        </div>

        {/* Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog Products</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{stats.totalProducts}</span>
            <span className="text-[11px] font-bold text-emerald-400">{stats.activeProducts} active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{stats.lowStockProductsCount} items low on stock</p>
        </div>

        {/* Gross Revenue */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Trade Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">${stats.totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] font-bold text-emerald-400">{stats.totalOrders} total orders</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Completed wholesale fabric shipments</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Orders & Revenue Trend */}
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Monthly Revenue & Wholesale Orders
              </h3>
              <p className="text-xs text-slate-400">Order volume and gross sales trajectory</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              +28% YOY Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Fabric Category Breakdown</h3>
            <p className="text-xs text-slate-400">Market share across cotton, silk, linen, etc.</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {stats.categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {stats.categoryDistribution.slice(0, 4).map((cat: any, idx: number) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-300 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> Recent System & Moderation Log
          </h3>
          <span className="text-xs text-slate-500">Live Audit Trail</span>
        </div>

        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((log: any) => (
            <div key={log.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-3 text-xs">
              <div className="mt-0.5">
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : log.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{log.title}</span>
                  <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-400 mt-0.5">{log.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
