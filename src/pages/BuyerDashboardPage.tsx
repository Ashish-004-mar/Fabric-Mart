import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Order, Product } from '../types';
import { orderEventEmitter, OrderStatusChangedEvent, OrderCreatedEvent } from '../utils/eventEmitter';
import { SpendingTrendsChart } from '../components/SpendingTrendsChart';
import { ShipmentTrackingTimeline } from '../components/ShipmentTrackingTimeline';
import { ShoppingBag, Clock, CheckCircle2, Heart, ShieldCheck, ExternalLink, ChevronRight, Truck, PackageCheck, AlertCircle, Scissors, TrendingUp, RotateCcw, ShoppingCart, Check, Package, Layers } from 'lucide-react';

export const BuyerDashboardPage: React.FC<{
  onSelectProduct: (p: Product) => void;
  onNavigateMarketplace: () => void;
}> = ({ onSelectProduct, onNavigateMarketplace }) => {
  const { user, updateUser, deleteAccount } = useAuth();
  const { wishlist } = useWishlist();
  const { reorderItems } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'wishlist' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  // Settings & Avatar State
  const [brandName, setBrandName] = useState(user?.companyName || '');
  const [userName, setUserName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const presetLogos = [
    { label: 'Sarah Jenkins', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
    { label: 'Elena Rostova', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
    { label: 'Carlos Mendez', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
    { label: 'Marcus Vance', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300' },
    { label: 'Aisha Patel', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300' },
  ];

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      updateUser({ avatar: result });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: userName,
      companyName: brandName,
      avatar: avatarPreview || user?.avatar,
    });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleReorder = async (ord: Order) => {
    setReorderingOrderId(ord.id);
    await reorderItems(
      ord.items.map((item) => ({
        productId: item.productId,
        quantityMeters: item.quantityMeters,
        selectedColor: item.selectedColor,
        productName: item.productName,
      }))
    );
    setReorderingOrderId(null);
  };

  const fetchOrders = () => {
    if (!user) return;
    const url = `/api/orders/my?userId=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((err) => console.error('Error fetching buyer orders:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();

    // Real-time listener for order status changes via mock event emitter
    const unsubStatus = orderEventEmitter.on<OrderStatusChangedEvent>('orderStatusChanged', (event) => {
      setOrders((prevOrders) =>
        prevOrders.map((ord) => {
          if (ord.id === event.orderId || ord.orderNumber === event.orderNumber) {
            const updatedHistory = [
              ...(ord.statusHistory || []),
              {
                status: event.newStatus,
                timestamp: new Date().toISOString(),
                note: event.note || `Supplier updated status to ${event.newStatus}.`,
              },
            ];
            const updatedOrd = { ...ord, status: event.newStatus, statusHistory: updatedHistory };
            if (selectedOrder && (selectedOrder.id === ord.id || selectedOrder.orderNumber === ord.orderNumber)) {
              setSelectedOrder(updatedOrd);
            }
            return updatedOrd;
          }
          return ord;
        })
      );
    });

    const unsubCreated = orderEventEmitter.on<OrderCreatedEvent>('orderCreated', () => {
      fetchOrders();
    });

    return () => {
      unsubStatus();
      unsubCreated();
    };
  }, [selectedOrder]);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => ['Pending', 'Confirmed', 'Preparing', 'Ready for Dispatch'].includes(o.status)).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* DASHBOARD HEADER */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatar ||
                (user
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=38bdf8&bold=true&size=300`
                  : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150')
              }
              alt={user?.name || 'Guest'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Guest User'}
                </h1>
                <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/80 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  BUYER PORTAL
                </span>
                {user ? (
                  <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    AUTHENTICATED
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-600 dark:bg-amber-950/80 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    GUEST MODE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.companyName || 'Atelier Modern Fashions'} • {user?.email || 'guest@fabricmart.com'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateMarketplace}
            className="bg-[#131b2e] dark:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
          >
            Explore Fabric Marketplace
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold">Total Orders Placed</span>
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalOrdersCount}</p>
            <p className="text-[10px] text-slate-400">Active B2B sample & bulk orders</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold">Pending Mill Processing</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingOrdersCount}</p>
            <p className="text-[10px] text-slate-400">Currently cutting or in transit</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold">Completed Orders</span>
              <PackageCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedOrdersCount}</p>
            <p className="text-[10px] text-slate-400">Delivered & quality verified</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-xs font-semibold">Saved Fabrics Wishlist</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{wishlist.length}</p>
            <p className="text-[10px] text-slate-400">Saved for upcoming collection</p>
          </div>
        </div>

        {/* SPENDING TRENDS VISUALIZATION CHART */}
        <SpendingTrendsChart orders={orders} />

        {/* TABS HEADER */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            My Orders & Tracking ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Spending Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Saved Fabrics ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Logo & Brand Settings
          </button>
        </div>

        {/* TAB 2: FULL ANALYTICS VIEW IF SELECTED */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl border border-blue-800/50 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-blue-500/30 text-blue-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-400/30 uppercase tracking-wider">
                    Executive Financial Overview
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">6-Month Fabric Procurement Intelligence</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Detailed spending telemetry for Atelier Modern Fashions. Spend allocations are dynamically updated in real-time as purchase orders are placed and confirmed with verified textile mills.
                  </p>
                </div>
              </div>
            </div>
            <SpendingTrendsChart orders={orders} />
          </div>
        )}

        {/* TAB 1: ORDERS LIST & TIMELINE */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {isLoading ? (
              <p className="text-xs text-slate-500">Loading orders history...</p>
            ) : orders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No orders placed yet</h3>
                <p className="text-xs text-slate-500 mt-1">Browse our fabric catalog to place sample or production orders.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* FEATURED INTERACTIVE SHIPMENT TRACKING TIMELINE */}
                {(() => {
                  const activeTrackingOrder =
                    orders.find((o) => o.id === activeTrackingOrderId) ||
                    orders.find((o) => o.status !== 'Completed' && o.status !== 'Rejected') ||
                    orders[0];

                  if (!activeTrackingOrder) return null;

                  return (
                    <div className="space-y-3">
                      {/* Order Switcher Header if multiple orders exist */}
                      {orders.length > 1 && (
                        <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 ml-1 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            Select Order to Track:
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                            {orders.map((ord) => {
                              const isSelected = ord.id === activeTrackingOrder.id;
                              return (
                                <button
                                  key={ord.id}
                                  onClick={() => setActiveTrackingOrderId(ord.id)}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white shadow-xs'
                                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {ord.orderNumber} ({ord.status})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <ShipmentTrackingTimeline order={activeTrackingOrder} />
                    </div>
                  );
                })()}

                {/* ORDERS LIST */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pt-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    All Purchase Orders ({orders.length})
                  </h3>

                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                        <div>
                          <span className="text-xs font-extrabold text-blue-600">{ord.orderNumber}</span>
                          <p className="text-[11px] text-slate-400">Placed on {new Date(ord.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              ord.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : ord.status === 'Preparing'
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}
                          >
                            Status: {ord.status}
                          </span>
                          <button
                            onClick={() => {
                              setActiveTrackingOrderId(ord.id);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Timeline</span>
                          </button>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-2">
                        {ord.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-3">
                              <img src={item.productImage} alt="" className="w-10 h-10 rounded object-cover" />
                              <div>
                                <h5 className="font-bold text-slate-900 dark:text-white">{item.productName}</h5>
                                <p className="text-[10px] text-slate-500">Supplier: {item.supplierName} • Color: {item.selectedColor}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.quantityMeters}m @ ${item.pricePerMeter}/m (${item.totalPrice.toFixed(2)})
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Compact Progress Bar Inside Card */}
                      <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                        <ShipmentTrackingTimeline order={ord} isCompact={true} />
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                        <span className="text-slate-500">Shipping to: {ord.shippingAddress.companyName}, {ord.shippingAddress.city}</span>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            Grand Total: <span className="text-blue-600">${ord.grandTotal.toFixed(2)}</span>
                          </span>

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            View Logs
                          </button>

                          {ord.status === 'Completed' && (
                            <button
                              onClick={() => handleReorder(ord)}
                              disabled={reorderingOrderId === ord.id}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${reorderingOrderId === ord.id ? 'animate-spin' : ''}`} />
                              <span>{reorderingOrderId === ord.id ? 'Adding to Cart...' : 'Reorder Fabrics'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BRAND LOGO & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-8">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Brand Identity & Buyer Profile Settings
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Customize your profile avatar, company logo, and contact info linked to your server database record.
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
                    Profile Management Restricted to Logged-in Users
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300">
                    Updating contact information, uploading custom logos, and deleting accounts are functional exclusively for authenticated buyers. Please sign in or register an account to customize your profile.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveProfileSettings} className="space-y-6">
              {/* Logo / Avatar Upload & Presets Area */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Buyer Profile Avatar / Brand Logo
                </label>

                <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <img
                    src={
                      avatarPreview ||
                      user?.avatar ||
                      (user
                        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=38bdf8&bold=true&size=300`
                        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300')
                    }
                    alt="Brand Logo"
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
                      <span>Upload Custom Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!user}
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Upload custom file or pick from human-like portrait avatars below.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Or select a curated portrait avatar:
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {presetLogos.map((pl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!user}
                        onClick={() => {
                          if (!user) return;
                          setAvatarPreview(pl.url);
                          updateUser({ avatar: pl.url });
                        }}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-xs font-medium transition-all ${
                          avatarPreview === pl.url
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold'
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

              {/* Name & Company Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Buyer Representative Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!user}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand / Company Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!user}
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Atelier Modern Fashions"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    ✓ Profile updated in SQLite Database!
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
                  Save Profile Settings
                </button>
              </div>
            </form>

            {/* DANGER ZONE: ACCOUNT DELETION */}
            <div className="pt-6 border-t border-red-200 dark:border-red-900/40 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Delete Account & Data</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Permanently delete your account and associated records from the database.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!user}
                  onClick={() => user && setShowDeleteConfirm(true)}
                  className={`font-bold text-xs px-4 py-2.5 rounded-xl transition-all ${
                    user
                      ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  Delete Account
                </button>
              </div>

              {showDeleteConfirm && user && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-2xl space-y-3">
                  <p className="text-xs font-bold text-red-700 dark:text-red-300">
                    Are you sure? This action will permanently remove your account from SQLite Database.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={isDeletingAccount}
                      onClick={async () => {
                        setIsDeletingAccount(true);
                        await deleteAccount();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      {isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
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
        {activeTab === 'wishlist' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">No saved fabrics in your wishlist.</p>
              </div>
            ) : (
              wishlist.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
                >
                  <img src={prod.images[0]} alt="" className="w-full h-36 rounded-xl object-cover" />
                  <h4
                    onClick={() => onSelectProduct(prod)}
                    className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                  >
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-slate-500">{prod.composition} • {prod.gsm} GSM</p>
                  <p className="text-xs font-bold text-blue-600">${prod.pricePerMeter}/m</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* STATUS TIMELINE MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Status Timeline: {selectedOrder.orderNumber}
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-4 text-xs">
                {selectedOrder.statusHistory.map((sh, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                      ✓
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">{sh.status}</h5>
                      <p className="text-[10px] text-slate-400">{new Date(sh.timestamp).toLocaleString()}</p>
                      {sh.note && <p className="text-slate-600 dark:text-slate-300 mt-1">{sh.note}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {selectedOrder.status === 'Completed' && (
                  <button
                    onClick={() => {
                      handleReorder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    disabled={reorderingOrderId === selectedOrder.id}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <RotateCcw className={`w-4 h-4 ${reorderingOrderId === selectedOrder.id ? 'animate-spin' : ''}`} />
                    <span>Reorder All Fabrics From This Order</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Close Tracking Modal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
