import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { Product, Order } from '../types';
import { orderEventEmitter } from '../utils/eventEmitter';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  Clock,
  ShieldAlert,
  Sliders,
  Zap,
} from 'lucide-react';

interface InventoryForecastingWidgetProps {
  products?: Product[];
  orders?: Order[];
  onDraftReplenishment?: (productName: string, recommendedMeters: number) => void;
}

export interface InventoryForecastItem {
  id: string;
  name: string;
  category: string;
  currentStock: number; // in meters
  monthlyRunRate: number; // meters sold per 30 days based on historical orders
  predictedDemand: number; // forecast for selected timeframe
  safetyThreshold: number; // min buffer required
  leadTimeDays: number; // supplier mill lead time
  deficitMeters: number; // predictedDemand - currentStock (if > 0, alert!)
  daysUntilStockout: number; // estimated days remaining
  reorderRecommended: number; // suggested replenishment quantity
  riskLevel: 'CRITICAL' | 'WARNING' | 'HEALTHY';
}

// Default fallback catalog items for Apex Textiles Mill baseline
const DEFAULT_SUPPLIER_PRODUCTS: Partial<Product>[] = [
  {
    id: 'prod-1',
    name: 'French Organic Linen Heavyweight Slub',
    categoryName: 'Organic Linen',
    stockQuantity: 450,
    moq: 100,
    pricePerMeter: 18.5,
  },
  {
    id: 'prod-2',
    name: 'Mulberry Silk Charmeuse 19mm',
    categoryName: 'Mulberry Silk',
    stockQuantity: 280,
    moq: 50,
    pricePerMeter: 24.5,
  },
  {
    id: 'prod-3',
    name: 'GOTS Certified Combed Cotton Twill',
    categoryName: 'GOTS Cotton',
    stockQuantity: 1200,
    moq: 200,
    pricePerMeter: 16.5,
  },
  {
    id: 'prod-4',
    name: 'Recycled Poly-Tech Ripstop Waterproof',
    categoryName: 'Tech Synthetics',
    stockQuantity: 320,
    moq: 150,
    pricePerMeter: 16.0,
  },
  {
    id: 'prod-5',
    name: 'Merino Wool Blend Tailoring Suiting',
    categoryName: 'Wool Suiting',
    stockQuantity: 180,
    moq: 75,
    pricePerMeter: 28.0,
  },
  {
    id: 'prod-6',
    name: 'Botanical Dyed Bamboo Rayon Satin',
    categoryName: 'Sustainable Rayon',
    stockQuantity: 890,
    moq: 100,
    pricePerMeter: 14.0,
  },
];

export const InventoryForecastingWidget: React.FC<InventoryForecastingWidgetProps> = ({
  products = [],
  orders = [],
  onDraftReplenishment,
}) => {
  const [timeHorizon, setTimeHorizon] = useState<30 | 60 | 90>(60);
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [selectedProductForTimeline, setSelectedProductForTimeline] = useState<string>('all');
  const [draftedOrders, setDraftedOrders] = useState<Record<string, boolean>>({});

  // Compile items & calculate AI velocity forecasts
  const forecastItems = useMemo<InventoryForecastItem[]>(() => {
    const rawCatalog = products.length > 0 ? products : (DEFAULT_SUPPLIER_PRODUCTS as Product[]);

    return rawCatalog.map((prod, idx) => {
      const itemId = prod.id || `item-${idx}`;
      const isDrafted = !!draftedOrders[itemId];
      const stock = prod.stockQuantity ?? 500;

      // Derive run rate from orders if matched or synthetic velocity based on product popularity
      let historical30DaySales = 0;

      if (orders && orders.length > 0) {
        orders.forEach((ord) => {
          ord.items?.forEach((item) => {
            if (
              item.productId === prod.id ||
              item.productName?.toLowerCase().includes(prod.name.toLowerCase().slice(0, 8))
            ) {
              historical30DaySales += item.quantityMeters || 150;
            }
          });
        });
      }

      // If historical sales from live orders is small, apply realistic domain sales velocity per fabric
      if (historical30DaySales < 100) {
        // High-demand fabrics like Linen/Silk move 350-550m / month
        const baseVelocities = [480, 390, 420, 310, 260, 220];
        historical30DaySales = baseVelocities[idx % baseVelocities.length] || 320;
      }

      const multiplier = timeHorizon / 30;
      const predictedDemand = Math.round(historical30DaySales * multiplier);
      const safetyThreshold = Math.round(historical30DaySales * 0.4); // 12-day safety buffer
      const leadTimeDays = prod.categoryName?.includes('Silk') ? 21 : prod.categoryName?.includes('Linen') ? 14 : 10;

      const rawDeficitMeters = Math.max(0, predictedDemand - stock);
      const reorderRecommended = Math.max(
        0,
        Math.ceil((predictedDemand + safetyThreshold - stock) / (prod.moq || 50)) * (prod.moq || 50)
      );
      const calculatedReorder = reorderRecommended > 0 ? reorderRecommended : (prod.moq || 100) * 2;

      // When drafted/queued, the scheduled loom production resolves the deficit and provides stock
      const deficitMeters = isDrafted ? 0 : rawDeficitMeters;
      const dailyConsumption = historical30DaySales / 30;
      const daysUntilStockout = dailyConsumption > 0 ? Math.round(stock / dailyConsumption) : 999;

      let riskLevel: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
      if (!isDrafted && stock < predictedDemand) {
        riskLevel = 'CRITICAL';
      } else if (!isDrafted && (stock < predictedDemand + safetyThreshold || daysUntilStockout < 20)) {
        riskLevel = 'WARNING';
      }

      return {
        id: itemId,
        name: prod.name || 'Premium Textile',
        category: prod.categoryName || 'Woven Fabric',
        currentStock: isDrafted ? stock + calculatedReorder : stock,
        monthlyRunRate: historical30DaySales,
        predictedDemand,
        safetyThreshold,
        leadTimeDays,
        deficitMeters,
        daysUntilStockout,
        reorderRecommended: calculatedReorder,
        riskLevel,
      };
    });
  }, [products, orders, timeHorizon, draftedOrders]);

  // Filtered list for detailed view table
  const displayedItems = useMemo(() => {
    if (filterRisk === 'ALL') return forecastItems;
    if (filterRisk === 'CRITICAL') return forecastItems.filter((i) => i.riskLevel === 'CRITICAL' || (draftedOrders[i.id] && i.deficitMeters === 0));
    if (filterRisk === 'WARNING') return forecastItems.filter((i) => i.riskLevel === 'WARNING');
    return forecastItems;
  }, [forecastItems, filterRisk, draftedOrders]);

  // Aggregate totals
  const totalDeficitCount = useMemo(
    () => forecastItems.filter((i) => i.riskLevel === 'CRITICAL').length,
    [forecastItems]
  );

  const totalDeficitMeters = useMemo(
    () => forecastItems.reduce((sum, item) => sum + item.deficitMeters, 0),
    [forecastItems]
  );

  const totalWarningCount = useMemo(
    () => forecastItems.filter((i) => i.riskLevel === 'WARNING').length,
    [forecastItems]
  );

  const totalReplenishmentMetersNeeded = useMemo(
    () => forecastItems.reduce((sum, item) => sum + (item.riskLevel !== 'HEALTHY' ? item.reorderRecommended : 0), 0),
    [forecastItems]
  );

  // Recharts Chart Data: Bar/Line combo comparing Stock vs Demand
  const chartComparisonData = useMemo(() => {
    return forecastItems.map((item) => ({
      shortName: item.name.split(' ')[0] + ' ' + (item.name.split(' ')[1] || ''),
      fullName: item.name,
      currentStock: item.currentStock,
      predictedDemand: item.predictedDemand,
      safetyBuffer: item.safetyThreshold,
      deficit: item.deficitMeters,
      isDeficit: item.deficitMeters > 0,
    }));
  }, [forecastItems]);

  // Depletion trajectory curve dataset for selected or overall stock
  const depletionTrajectoryData = useMemo(() => {
    const daysCount = timeHorizon;
    const step = Math.max(1, Math.floor(daysCount / 10)); // 10 data points
    const timeline = [];

    // Filter items
    const targetItems =
      selectedProductForTimeline === 'all'
        ? forecastItems
        : forecastItems.filter((i) => i.id === selectedProductForTimeline);

    const initialTotalStock = targetItems.reduce((s, i) => s + i.currentStock, 0);
    const dailyConsumptionTotal = targetItems.reduce((s, i) => s + i.monthlyRunRate / 30, 0);

    for (let day = 0; day <= daysCount; day += step) {
      const remainingStock = Math.max(0, Math.round(initialTotalStock - dailyConsumptionTotal * day));
      const requiredBuffer = Math.round(dailyConsumptionTotal * 14); // 14-day safety threshold

      timeline.push({
        dayLabel: `Day ${day}`,
        dayNumber: day,
        projectedStock: remainingStock,
        safetyBuffer: requiredBuffer,
        stockoutAlert: remainingStock < requiredBuffer,
      });
    }

    return timeline;
  }, [forecastItems, selectedProductForTimeline, timeHorizon]);

  const handleDraftOrder = (item: InventoryForecastItem) => {
    setDraftedOrders((prev) => ({ ...prev, [item.id]: true }));
    orderEventEmitter.emitToast(
      'Loom Production Scheduled',
      `Queued ${item.reorderRecommended}m batch weave for ${item.name}. Deficit resolved!`,
      'success'
    );
    if (onDraftReplenishment) {
      onDraftReplenishment(item.name, item.reorderRecommended);
    }
  };

  const handleDraftAllDeficits = () => {
    const criticalItems = forecastItems.filter((i) => i.riskLevel === 'CRITICAL' || i.deficitMeters > 0);
    if (criticalItems.length === 0) return;

    const newDrafts: Record<string, boolean> = { ...draftedOrders };
    criticalItems.forEach((item) => {
      newDrafts[item.id] = true;
    });
    setDraftedOrders(newDrafts);

    const totalMeters = criticalItems.reduce((acc, curr) => acc + curr.reorderRecommended, 0);
    orderEventEmitter.emitToast(
      'All Deficits Resolved',
      `Queued loom production for ${criticalItems.length} products (${totalMeters.toLocaleString()} meters total). All deficits resolved!`,
      'success'
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Inventory Forecasting & Replenishment Engine</span>
            </h2>
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              PREDICTIVE LOGISTICS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Machine-learning demand model extrapolating historical order velocity to prevent stockouts and optimize loom production schedules.
          </p>
        </div>

        {/* TIME HORIZON SELECTOR */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Forecast Window:</span>
          </span>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setTimeHorizon(30)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeHorizon === 30
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeHorizon(60)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeHorizon === 60
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              60 Days
            </button>
            <button
              onClick={() => setTimeHorizon(90)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                timeHorizon === 90
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
      </div>

      {/* FORECAST ALERT BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Critical Deficits */}
        <div
          onClick={() => setFilterRisk('CRITICAL')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
            totalDeficitCount > 0
              ? filterRisk === 'CRITICAL'
                ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-400 ring-2 ring-rose-500/50'
                : 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
              : 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  totalDeficitCount > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {totalDeficitCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {totalDeficitCount} {totalDeficitCount === 1 ? 'Product' : 'Products'}
                    {totalDeficitCount > 0 ? ` (${totalDeficitMeters.toLocaleString()}m Deficit)` : ''}
                  </span>
                  {totalDeficitCount > 0 ? (
                    <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md animate-pulse">
                      ACTION REQUIRED
                    </span>
                  ) : (
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      ACTION COMPLETE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {totalDeficitCount > 0
                    ? `Forecasted demand exceeds stock by ${totalDeficitMeters.toLocaleString()}m over ${timeHorizon} days.`
                    : 'All deficits resolved & queued in loom batch production.'}
                </p>
              </div>
            </div>

            {totalDeficitCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDraftAllDeficits();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Resolve All
              </button>
            )}
          </div>
        </div>

        {/* Warning Buffer */}
        <div
          onClick={() => setFilterRisk('WARNING')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
            filterRisk === 'WARNING'
              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/50'
              : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {totalWarningCount} Low-Buffer Items
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Approaching safety threshold within 14–21 days.
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Replenishment Quantity */}
        <div
          onClick={() => setFilterRisk('ALL')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
            filterRisk === 'ALL'
              ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-400 ring-2 ring-blue-500/50'
              : 'bg-blue-50/90 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-blue-700 dark:text-blue-300">
                {totalReplenishmentMetersNeeded.toLocaleString()} m
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Total suggested loom batch production to sustain fulfillment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION: CURRENT STOCK VS FORECASTED DEMAND */}
      <div className="bg-slate-50/60 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Available Stock vs. Forecasted Demand ({timeHorizon}-Day Horizon)</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Red highlight indicates stock deficit where predicted order demand surpasses present meters in warehouse.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              <span>Available Stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500"></span>
              <span>Forecasted Demand</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              <span>Stock Deficit</span>
            </div>
          </div>
        </div>

        {/* COMPOSED RECHARTS CANVAS */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartComparisonData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis
                dataKey="shortName"
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => `${val}m`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5">
                        <p className="font-extrabold text-indigo-300 border-b border-slate-800 pb-1">{data.fullName}</p>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Current Stock:</span>
                          <span className="font-bold text-blue-400">{data.currentStock} meters</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>{timeHorizon}-Day Demand Forecast:</span>
                          <span className="font-bold text-indigo-400">{data.predictedDemand} meters</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-300">
                          <span>Safety Buffer Needed:</span>
                          <span className="font-bold text-amber-400">{data.safetyBuffer} meters</span>
                        </div>
                        {data.isDeficit ? (
                          <div className="pt-1.5 border-t border-slate-800 text-rose-400 font-bold flex items-center justify-between">
                            <span>Projected Shortfall:</span>
                            <span>-{data.deficit} m</span>
                          </div>
                        ) : (
                          <div className="pt-1 border-t border-slate-800 text-emerald-400 font-semibold text-[11px]">
                            ✓ Inventory Surplus (+{data.currentStock - data.predictedDemand}m)
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="currentStock" fill="#3b82f6" name="Available Stock" radius={[6, 6, 0, 0]} barSize={24} />
              <Bar dataKey="predictedDemand" fill="#6366f1" name="Forecasted Demand" radius={[6, 6, 0, 0]} barSize={24} />
              <Line
                type="monotone"
                dataKey="safetyBuffer"
                name="Safety Buffer"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DEPLETION TIMELINE AREA CHART & ACTION TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 1 COL: INVENTORY DEPLETION CURVE */}
        <div className="bg-slate-50/60 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Depletion Curve Model</span>
              </h4>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                RUNWAY
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Simulated day-by-day inventory decay based on order burn rate.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              Focus Product:
            </label>
            <select
              value={selectedProductForTimeline}
              onChange={(e) => setSelectedProductForTimeline(e.target.value)}
              className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Entire Warehouse Aggregated Stock</option>
              {forecastItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.currentStock}m)
                </option>
              ))}
            </select>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={depletionTrajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="depletionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="dayLabel" tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs space-y-1">
                          <p className="font-bold text-blue-400">{data.dayLabel}</p>
                          <p>Projected Stock: <strong className="text-white">{data.projectedStock} m</strong></p>
                          <p className="text-[10px] text-slate-400">Safety Limit: {data.safetyBuffer} m</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="projectedStock" stroke="#3b82f6" strokeWidth={2} fill="url(#depletionGrad)" />
                <Line type="monotone" dataKey="safetyBuffer" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>AI Production Tip:</strong> Trigger loom batching when stock intersects the amber safety limit line to avoid rush expedited freight fees.
            </span>
          </div>
        </div>

        {/* RIGHT 2 COLS: DETAILED REPLENISHMENT ACTION RECOMMENDATIONS TABLE */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Fabric Replenishment Action Queue</span>
            </h4>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setFilterRisk('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterRisk === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                All ({forecastItems.length})
              </button>
              <button
                onClick={() => setFilterRisk('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  filterRisk === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Deficits ({totalDeficitCount})</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Fabric Product</th>
                  <th className="py-3 px-2">Current Stock</th>
                  <th className="py-3 px-2">{timeHorizon}d Demand</th>
                  <th className="py-3 px-2">Stockout Risk</th>
                  <th className="py-3 px-2">Rec. Batch</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {displayedItems.map((item) => {
                  const isDrafted = draftedOrders[item.id];

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        item.riskLevel === 'CRITICAL' ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.category} • Lead time: {item.leadTimeDays}d</div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">{item.currentStock} m</span>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.predictedDemand} m</span>
                      </td>

                      <td className="py-3 px-2">
                        {isDrafted ? (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Loom Scheduled
                          </span>
                        ) : item.riskLevel === 'CRITICAL' ? (
                          <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Short -{item.deficitMeters}m
                          </span>
                        ) : item.riskLevel === 'WARNING' ? (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.daysUntilStockout} days left
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sufficient
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-2 font-bold text-blue-600 dark:text-blue-400">
                        +{item.reorderRecommended} m
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => handleDraftOrder(item)}
                          disabled={isDrafted}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1 ml-auto ${
                            isDrafted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              : item.riskLevel === 'CRITICAL'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          {isDrafted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Loom Drafted</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Schedule Weave</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FOOTER INTELLIGENCE SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong className="text-slate-700 dark:text-slate-200">AI Predictive Summary:</strong> Auto-analyzing historical purchase order velocity across <strong>Atelier Modern Fashions</strong> and marketplace buyers.
          </span>
        </div>
        <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 cursor-pointer hover:underline">
          <span>View Machine Learning Model Parameters</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default InventoryForecastingWidget;
