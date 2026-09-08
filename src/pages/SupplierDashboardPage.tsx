import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, OrderStatus, SupplierProfile } from '../types';
import { StarRating } from '../components/StarRating';
import { orderEventEmitter, OrderStatusChangedEvent, OrderCreatedEvent } from '../utils/eventEmitter';
import { DashboardWidget } from '../components/DashboardWidget';
import { InventoryForecastingWidget } from '../components/InventoryForecastingWidget';
import { Plus, Search, Filter, Download, Edit3, Trash2, ShieldCheck, Factory, Box, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, BarChart2, Scissors, Truck, PackageCheck, Zap, TrendingUp, Sparkles, Star, Award, MessageSquare, CheckCircle, ThumbsUp } from 'lucide-react';

export const SupplierDashboardPage: React.FC = () => {
  const { user, updateUser, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'analytics' | 'forecasting' | 'ratings' | 'settings'>('inventory');
  const [inventoryView, setInventoryView] = useState<'cards' | 'table'>('cards');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'ALL'>('ALL');
  const [orderQueueFilter, setOrderQueueFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  // Brand Logo & Avatar State
  const [millName, setMillName] = useState(user?.companyName || 'Luxury Silk & Textile Mills');
  const [repName, setRepName] = useState(user?.name || 'Supplier Admin');
  const [logoPreview, setLogoPreview] = useState(user?.avatar || '');
  const [supplierSaveSuccess, setSupplierSaveSuccess] = useState(false);
  const [showSupplierDeleteConfirm, setShowSupplierDeleteConfirm] = useState(false);
  const [isDeletingSupplierAccount, setIsDeletingSupplierAccount] = useState(false);

  const presetMillLogos = [
    { label: 'Carlos Mendez', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
    { label: 'Rajesh Kumar', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' },
    { label: 'Min-Jae Park', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300' },
    { label: 'David Sterling', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300' },
    { label: 'Sophia Lin', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      updateUser({ avatar: result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSupplierSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: repName,
      companyName: millName,
      avatar: logoPreview || user?.avatar,
    });
    setSupplierSaveSuccess(true);
    setTimeout(() => setSupplierSaveSuccess(false), 3000);
  };

  // Add/Edit Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryName, setCategoryName] = useState('Woven Fabrics');
  const [composition, setComposition] = useState('100% GOTS Organic Cotton');
  const [gsm, setGsm] = useState(200);
  const [widthCm, setWidthCm] = useState(150);
  const [pricePerMeter, setPricePerMeter] = useState(16.5);
  const [stockQuantity, setStockQuantity] = useState(1500);
  const [moq, setMoq] = useState(50);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80');

  const fetchSupplierData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/supplier/products').then((r) => r.json()),
      fetch('/api/supplier/orders').then((r) => r.json()),
      fetch('/api/suppliers/profile').then((r) => r.json()),
    ])
      .then(([pData, oData, profData]) => {
        if (pData.products) setProducts(pData.products);
        if (oData.orders) setOrders(oData.orders);
        if (profData.profile) setSupplierProfile(profData.profile);
      })
      .catch((err) => console.error('Error fetching supplier hub data:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSupplierData();

    const unsubStatus = orderEventEmitter.on<OrderStatusChangedEvent>('orderStatusChanged', (event) => {
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord.id === event.orderId || ord.orderNumber === event.orderNumber
            ? { ...ord, status: event.newStatus }
            : ord
        )
      );
    });

    const unsubCreated = orderEventEmitter.on<OrderCreatedEvent>('orderCreated', () => {
      fetchSupplierData();
    });

    return () => {
      unsubStatus();
      unsubCreated();
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setComposition('100% Organic Linen');
    setGsm(180);
    setPricePerMeter(18.5);
    setStockQuantity(2000);
    setMoq(50);
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setComposition(p.composition);
    setGsm(p.gsm);
    setPricePerMeter(p.pricePerMeter);
    setStockQuantity(p.stockQuantity);
    setMoq(p.moq);
    setImageUrl(p.images[0] || '');
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      sku,
      categoryName,
      composition,
      gsm: Number(gsm),
      widthCm: Number(widthCm),
      pricePerMeter: Number(pricePerMeter),
      stockQuantity: Number(stockQuantity),
      moq: Number(moq),
      images: [imageUrl],
      supplierName: user?.companyName || 'Apex Textiles Ltd.',
    };

    if (editingProduct) {
      await fetch(`/api/supplier/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/supplier/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setModalOpen(false);
    fetchSupplierData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this fabric listing?')) {
      await fetch(`/api/supplier/products/${id}`, { method: 'DELETE' });
      fetchSupplierData();
    }
  };

  const handleRestockProduct = async (prod: Product, restockMeters: number) => {
    const newStock = prod.stockQuantity + restockMeters;
    await fetch(`/api/supplier/products/${prod.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prod, stockQuantity: newStock }),
    });
    fetchSupplierData();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    const oldStatus = existingOrder ? existingOrder.status : 'Pending';

    try {
      await fetch(`/api/supplier/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: `Supplier changed status from '${oldStatus}' to '${newStatus}'.` }),
      });

      // Emit real-time event via mock event emitter
      orderEventEmitter.emitOrderStatusChange(
        orderId,
        existingOrder?.orderNumber || `ORD-${orderId}`,
        oldStatus,
        newStatus,
        existingOrder?.buyerName || 'Buyer',
        `Mill manager updated processing queue to ${newStatus}.`
      );

      fetchSupplierData();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Stats Calculations
  const totalProducts = products.length;
  const activeListings = products.filter((p) => p.stockQuantity > 0).length;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 300).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER & PORTAL IDENTIFICATION */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold">
              <Factory className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {user?.companyName || supplierProfile?.businessName || 'Apex Textiles Ltd.'}
                </h1>
                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED MILL
                </span>
                {supplierProfile && (
                  <span className="bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{Number(supplierProfile.rating ?? 4.9).toFixed(1)} / 5.0</span>
                    <span className="text-slate-400 font-normal">({supplierProfile.reviewsCount || 142} audits)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Supplier Hub Portal • {supplierProfile ? `${supplierProfile.city}, ${supplierProfile.country}` : 'Porto, Portugal'}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Fabric Listing</span>
          </button>
        </div>

        {/* STAT CARDS MATCHING SCREENSHOT #3 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-slate-500">Total Products</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalProducts}</p>
              <span className="text-[10px] font-bold text-emerald-600">+12% mo</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-slate-500">Active Listings</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{activeListings}</p>
              <span className="text-[10px] font-bold text-emerald-600">+5% mo</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-amber-600">Low Stock Warning</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-amber-600">{lowStockCount}</p>
              <span className="text-[10px] text-slate-400">Action Req</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-red-500">Out of Stock</p>
            <p className="text-2xl font-black text-red-600">{outOfStockCount}</p>
          </div>
        </div>

        {/* SUPPLIER ANALYTICS WIDGET - RECHARTS DAILY VOLUME & CATEGORY BREAKDOWN */}
        <DashboardWidget orders={orders} products={products} />

        {/* TAB HEADERS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'inventory' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent'
            }`}
          >
            Inventory Management ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('forecasting')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'forecasting' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-indigo-900 dark:text-indigo-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Inventory Forecasting</span>
            <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">NEW</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent'
            }`}
          >
            <span>Buyer Orders Queue</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-extrabold ${
              orders.filter((o) => o.status !== 'Completed' && o.status !== 'Rejected').length > 0
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {orders.filter((o) => o.status !== 'Completed' && o.status !== 'Rejected').length} Active
            </span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Demand Analytics & Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ratings' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Reputation & Buyer Ratings</span>
            <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.2 rounded-full font-extrabold">
              {Number(supplierProfile?.rating ?? 4.9).toFixed(1)} ★
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent'
            }`}
          >
            <span>Mill Logo & Settings</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
            {/* View & Search Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search fabric title or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs w-full text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Cards vs Table Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setInventoryView('cards')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      inventoryView === 'cards'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Product Cards ({filteredProducts.length})
                  </button>
                  <button
                    onClick={() => setInventoryView('table')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      inventoryView === 'table'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Table View
                  </button>
                </div>

                <button
                  onClick={handleOpenAddModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>List New Fabric</span>
                </button>
              </div>
            </div>

            {/* PRODUCT CARDS VIEW (WITH LOW STOCK INDICATORS) */}
            {inventoryView === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const isLowStock = prod.stockQuantity > 0 && prod.stockQuantity < 500;
                  const isOutOfStock = prod.stockQuantity === 0;

                  return (
                    <div
                      key={prod.id}
                      className={`relative bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-2xs space-y-4 transition-all ${
                        isOutOfStock
                          ? 'border-red-400/80 bg-red-50/20 dark:bg-red-950/10'
                          : isLowStock
                          ? 'border-amber-400/90 ring-1 ring-amber-400/30 bg-amber-50/20 dark:bg-amber-950/10'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* LOW-STOCK BADGE INDICATOR */}
                      {isOutOfStock ? (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>OUT OF STOCK</span>
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 animate-bounce" />
                          <span>LOW STOCK: {prod.stockQuantity}m LEFT</span>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {prod.stockQuantity}m In Stock
                        </div>
                      )}

                      <div className="flex gap-4">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="space-y-1 overflow-hidden pr-16">
                          <span className="text-[10px] font-mono font-semibold text-slate-400">{prod.sku}</span>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{prod.name}</h4>
                          <p className="text-[10px] text-slate-500">{prod.composition}</p>
                          <p className="text-xs font-black text-blue-600">${Number(prod.pricePerMeter ?? 0).toFixed(2)}/m</p>
                        </div>
                      </div>

                      {/* Stock Level Visual Bar */}
                      <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500">Mill Inventory Meterage:</span>
                          <span className={isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600 font-black' : 'text-emerald-600'}>
                            {prod.stockQuantity} meters
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, (prod.stockQuantity / 2500) * 100)}%` }}
                            className={`h-full transition-all ${
                              isOutOfStock ? 'bg-red-600' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Restock & Edit Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleRestockProduct(prod, 500)}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold py-1.5 px-2.5 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restock +500m</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                          title="Edit Listing"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 bg-slate-100 dark:bg-slate-800 rounded-xl"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
                <table className="w-full text-left divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3.5">PRODUCT</th>
                      <th className="p-3.5">SKU</th>
                      <th className="p-3.5">CATEGORY</th>
                      <th className="p-3.5">STOCK LEVEL</th>
                      <th className="p-3.5">PRICE / M</th>
                      <th className="p-3.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img src={prod.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <h5 className="font-bold text-slate-900 dark:text-white">{prod.name}</h5>
                              <p className="text-[10px] text-slate-500">{prod.composition} • {prod.gsm} GSM</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">{prod.sku}</td>
                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{prod.categoryName}</td>
                        <td className="p-3.5">
                          <div className="space-y-1 w-36">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{prod.stockQuantity}m</span>
                              <span className={prod.stockQuantity < 500 ? 'text-amber-500 font-extrabold' : 'text-emerald-500'}>
                                {prod.stockQuantity < 500 ? '⚠️ Low Stock' : 'OK'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, (prod.stockQuantity / 3000) * 100)}%` }}
                                className={`h-full ${prod.stockQuantity < 500 ? 'bg-amber-500' : 'bg-blue-600'}`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-extrabold text-blue-600">${Number(prod.pricePerMeter ?? 0).toFixed(2)}/m</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleRestockProduct(prod, 500)}
                            className="px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200"
                          >
                            +500m
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-lg"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 bg-slate-100 dark:bg-slate-800 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INCOMING BUYER ORDERS */}
        {activeTab === 'orders' && (() => {
          const activeOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Rejected');
          const completedOrders = orders.filter((o) => o.status === 'Completed');
          const displayedOrders =
            orderQueueFilter === 'ACTIVE'
              ? activeOrders
              : orderQueueFilter === 'COMPLETED'
              ? completedOrders
              : orders;

          return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Buyer Order Queue</span>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">REAL-TIME SYNC</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage active order status or review completed order history.</p>
                </div>

                {/* Queue Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setOrderQueueFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      orderQueueFilter === 'ACTIVE'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Active Queue ({activeOrders.length})
                  </button>
                  <button
                    onClick={() => setOrderQueueFilter('COMPLETED')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      orderQueueFilter === 'COMPLETED'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Delivered ({completedOrders.length})
                  </button>
                  <button
                    onClick={() => setOrderQueueFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      orderQueueFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    All Orders ({orders.length})
                  </button>
                </div>
              </div>

              {displayedOrders.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <PackageCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {orderQueueFilter === 'ACTIVE'
                      ? 'No Active Orders in Queue'
                      : orderQueueFilter === 'COMPLETED'
                      ? 'No Delivered Orders Yet'
                      : 'No Orders Found'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {orderQueueFilter === 'ACTIVE'
                      ? 'All incoming orders have been fulfilled and delivered to buyers.'
                      : 'Delivered orders will appear here once marked as completed.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedOrders.map((ord) => (
                    <div key={ord.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center font-bold gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-extrabold text-sm">Order #{ord.orderNumber}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-800 dark:text-slate-200">{ord.buyerName}</span>
                          <span className="text-slate-400">({ord.shippingAddress.companyName})</span>
                        </div>
                        <span className="text-emerald-600 font-extrabold text-sm">${Number(ord.grandTotal ?? 0).toFixed(2)}</span>
                      </div>

                      <div className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold mb-1 text-[11px] text-slate-400">ORDERED ITEMS:</p>
                        <div className="space-y-1">
                          {ord.items.map((i) => (
                            <div key={i.id} className="flex justify-between">
                              <span>{i.productName} ({i.selectedColor})</span>
                              <span className="font-mono font-bold">{i.quantityMeters}m @ ${i.pricePerMeter}/m</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Current Status:</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            ord.status === 'Preparing'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : ord.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                        {/* Quick State Transition Actions */}
                        <div className="flex flex-wrap gap-2">
                          {ord.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all flex items-center gap-1 shadow-xs"
                            >
                              <Scissors className="w-3.5 h-3.5" />
                              <span>Start Preparing (Cutting)</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Confirmed')}
                            className={`font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all ${
                              ord.status === 'Confirmed' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            Confirmed
                          </button>

                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')}
                            className={`font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all flex items-center gap-1 ${
                              ord.status === 'Preparing' ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-600 hover:text-white'
                            }`}
                          >
                            <Scissors className="w-3 h-3" />
                            <span>Preparing</span>
                          </button>

                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Ready for Dispatch')}
                            className={`font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all ${
                              ord.status === 'Ready for Dispatch' ? 'bg-cyan-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-cyan-600 hover:text-white'
                            }`}
                          >
                            QC Ready
                          </button>

                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Shipped')}
                            className={`font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all flex items-center gap-1 ${
                              ord.status === 'Shipped' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            <Truck className="w-3 h-3" />
                            <span>Shipped</span>
                          </button>

                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'Completed')}
                            className={`font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all flex items-center gap-1 ${
                              ord.status === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white'
                            }`}
                          >
                            <PackageCheck className="w-3 h-3" />
                            <span>Completed</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 2: AI INVENTORY FORECASTING */}
        {activeTab === 'forecasting' && (
          <div className="space-y-6">
            <InventoryForecastingWidget
              products={products}
              orders={orders}
              onDraftReplenishment={(productName, qty) => {
                alert(`Loom batch production draft generated for ${productName}: ${qty} meters queued in loom scheduling system.`);
              }}
            />
          </div>
        )}

        {/* TAB 3: DEMAND ANALYTICS & TRENDS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-3xl border border-blue-800/50 shadow-xl space-y-3">
              <span className="bg-blue-500/30 text-blue-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-400/30 uppercase tracking-wider">
                Mill Executive Sourcing Intelligence
              </span>
              <h3 className="text-lg font-bold text-white mt-2">Daily Sourcing Velocity & Category Breakdown</h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Comprehensive analytics for Apex Textiles Ltd. The line chart tracks daily order processing volume, and the bar chart breaks down demand across Organic Linen, Mulberry Silk, GOTS Cotton, and Technical Synthetics.
              </p>
            </div>
            <DashboardWidget orders={orders} products={products} />
            
            {/* Embedded Inventory Forecast in Analytics Tab */}
            <InventoryForecastingWidget
              products={products}
              orders={orders}
              onDraftReplenishment={(productName, qty) => {
                alert(`Loom batch production draft generated for ${productName}: ${qty} meters queued in loom scheduling system.`);
              }}
            />
          </div>
        )}

        {/* TAB 5: SUPPLIER REPUTATION & BUYER RATINGS */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Mill Reputation & Buyer Audits
                    </h2>
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Top 1% Tier Mill
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Real-time buyer satisfaction ratings, batch quality audits, and mill reliability compliance performance.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Mill Trust Badge</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      GOTS & OEKO-TEX Certified
                    </span>
                  </div>
                  <Award className="w-8 h-8 text-amber-500" />
                </div>
              </div>

              {/* Grid: Rating Score + Breakdown + KPI Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Score & Distribution Card */}
                <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <span className="text-4xl font-black text-slate-900 dark:text-white block">
                        {Number(supplierProfile?.rating ?? 4.9).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Score / 5.0</span>
                    </div>

                    <div className="space-y-1">
                      <StarRating
                        rating={supplierProfile?.rating || 4.9}
                        size="lg"
                      />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {supplierProfile?.reviewsCount || 142} Verified Buyer Audits
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 inline" /> 99.1% Positive Buyer Feedback
                      </p>
                    </div>
                  </div>

                  {/* Rating Breakdown Bars */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                    <p className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Star Rating Distribution
                    </p>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const bd = supplierProfile?.ratingBreakdown || { 5: 128, 4: 11, 3: 2, 2: 1, 1: 0 };
                      const count = bd[star as 1 | 2 | 3 | 4 | 5] || 0;
                      const total = supplierProfile?.reviewsCount || 142;
                      const pct = Math.round((count / (total || 1)) * 100);

                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-8 font-bold text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-0.5">
                            {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          </span>
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="bg-amber-400 h-full rounded-full transition-all duration-500"
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-[11px] text-slate-500">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reliability KPI Grid */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Mill Operational Reliability Metrics</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">On-Time Dispatch</span>
                        <Truck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {supplierProfile?.reliabilityMetrics?.onTimeShipmentRate || 98.8}%
                      </p>
                      <p className="text-[10px] text-slate-400">Target: &gt;98.0% (Passing)</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Lab Quality Compliance</span>
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {supplierProfile?.reliabilityMetrics?.qualityPassRate || 99.4}%
                      </p>
                      <p className="text-[10px] text-slate-400">Zero Defect Batch Standard</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Fulfillment Rate</span>
                        <Box className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {supplierProfile?.reliabilityMetrics?.orderFulfillmentRate || 99.9}%
                      </p>
                      <p className="text-[10px] text-slate-400">Zero Stockout Cancellations</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Avg Response Time</span>
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {supplierProfile?.reliabilityMetrics?.avgResponseTimeHours || 1.5} hrs
                      </p>
                      <p className="text-[10px] text-slate-400">Direct Mill Support Desk</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Fabric Mart Reliability Insight:</p>
                      <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5">
                        Your mill maintains an exceptional 4.9★ rating score across 142 audits. High quality compliance on GOTS Silk and Cotton builds strong reorder conversion from premium buyers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Buyer Reviews Feed */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Buyer Feedback & Audit Log</span>
                  </h3>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px] pr-1">Filter Stars:</span>
                    {(['ALL', 5, 4, 3] as const).map((starVal) => (
                      <button
                        key={String(starVal)}
                        onClick={() => setReviewFilterRating(starVal)}
                        className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                          reviewFilterRating === starVal
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {starVal === 'ALL' ? 'All Reviews' : `${starVal} ★`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {(supplierProfile?.recentReviews || [])
                    .filter((r) => reviewFilterRating === 'ALL' || r.rating === reviewFilterRating)
                    .map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {rev.buyerName}
                            </span>
                            <span className="text-slate-400 font-medium">
                              • {rev.buyerCompany}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                Verified Buyer Order
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{rev.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <StarRating rating={rev.rating} size="sm" />
                          {rev.productName && (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                              Fabric Ordered: {rev.productName}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MILL LOGO & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Supplier Mill Logo & Branding Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your textile mill's official logo or brand mark. This will be displayed on product listings, buyer sample dispatches, and verification badges.
                  </p>
                </div>
                {user ? (
                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Active Session
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/80 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                    Guest Mode
                  </span>
                )}
              </div>
            </div>

            {!user && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">
                    Mill Settings Restricted to Logged-in Suppliers
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300">
                    Updating mill details, customizing representative avatars, and deleting mill accounts are functional exclusively for authenticated suppliers. Please sign in or register to manage mill settings.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSupplierSettings} className="space-y-6">
              {/* Mill Logo Upload Area */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Textile Mill / Enterprise Logo
                </label>
                <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <img
                    src={
                      logoPreview ||
                      user?.avatar ||
                      (user
                        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=38bdf8&bold=true&size=300`
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300')
                    }
                    alt="Mill Logo"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md shrink-0"
                  />
                  <div className="space-y-2 flex-1">
                    <label
                      className={`inline-block text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs ${
                        user
                          ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                          : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span>Upload Official Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!user}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Upload high-res PNG or JPEG (Recommended 400x400px).
                    </p>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Or select a verified mill manager avatar:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {presetMillLogos.map((pl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!user}
                        onClick={() => {
                          if (!user) return;
                          setLogoPreview(pl.url);
                          updateUser({ avatar: pl.url });
                        }}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-xs font-medium transition-all ${
                          logoPreview === pl.url
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-600 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        } ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'}`}
                      >
                        <img src={pl.url} alt="" className="w-7 h-7 rounded-lg object-cover" />
                        <span>{pl.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mill Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mill Manager / Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!user}
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="e.g. Carlos Mendez"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mill / Enterprise Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!user}
                    value={millName}
                    onChange={(e) => setMillName(e.target.value)}
                    placeholder="e.g. Luxury Silk & Textile Mills"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {supplierSaveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    ✓ Mill profile updated in SQLite Database!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!user}
                  className={`ml-auto font-bold text-xs px-6 py-3 rounded-xl transition-colors shadow-md ${
                    user
                      ? 'bg-[#131b2e] dark:bg-blue-600 text-white hover:bg-slate-800 cursor-pointer'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  Save Mill Settings
                </button>
              </div>
            </form>

            {/* DANGER ZONE: ACCOUNT DELETION */}
            <div className="pt-6 border-t border-red-200 dark:border-red-900/40 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Delete Supplier Mill Account</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Permanently delete your mill account, fabric catalog, and profile from the database.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!user}
                  onClick={() => user && setShowSupplierDeleteConfirm(true)}
                  className={`font-bold text-xs px-4 py-2.5 rounded-xl transition-all ${
                    user
                      ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  Delete Account
                </button>
              </div>

              {showSupplierDeleteConfirm && user && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-red-700 dark:text-red-300">
                    Are you sure? This will remove your mill profile and catalog from SQLite Database.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={isDeletingSupplierAccount}
                      onClick={async () => {
                        setIsDeletingSupplierAccount(true);
                        await deleteAccount();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      {isDeletingSupplierAccount ? 'Deleting...' : 'Yes, Delete Mill Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSupplierDeleteConfirm(false)}
                      className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingProduct ? 'Edit Fabric SKU' : 'Add New Fabric Listing'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Fabric Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">SKU Code</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Price per Meter ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pricePerMeter}
                      onChange={(e) => setPricePerMeter(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Composition Description</label>
                  <input
                    type="text"
                    required
                    value={composition}
                    onChange={(e) => setComposition(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold mb-1">GSM Weight</label>
                    <input
                      type="number"
                      required
                      value={gsm}
                      onChange={(e) => setGsm(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Available Stock (m)</label>
                    <input
                      type="number"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">MOQ (m)</label>
                    <input
                      type="number"
                      required
                      value={moq}
                      onChange={(e) => setMoq(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Fabric Photography Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 mt-2"
                >
                  Save Fabric SKU to Catalog
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
