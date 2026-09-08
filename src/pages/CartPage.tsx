import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Truck,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  RefreshCw,
  CreditCard,
  FileText,
} from 'lucide-react';

interface CartPageProps {
  onNavigateMarketplace: () => void;
  onProceedToCheckout: () => void;
  onSelectProduct?: (product: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onNavigateMarketplace,
  onProceedToCheckout,
  onSelectProduct,
}) => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, totalItemsCount } = useCart();
  const { user } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMsg, setPromoMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Freight & Tax Calculation
  const estimatedShipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 120) : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const estimatedTax = taxableSubtotal * 0.08;
  const grandTotal = taxableSubtotal + estimatedShipping + estimatedTax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'FABRIC10' || clean === 'FIRST10') {
      setDiscountPercent(10);
      setPromoMsg({ text: '10% B2B Wholesale Coupon Applied!', success: true });
    } else if (clean === 'FREESHIP' || clean === 'SPRING2026') {
      setDiscountPercent(15);
      setPromoMsg({ text: '15% Seasonal Partner Discount Applied!', success: true });
    } else {
      setPromoMsg({ text: 'Invalid promo code. Try FABRIC10 or FREESHIP', success: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <button
                onClick={onNavigateMarketplace}
                className="hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                Marketplace
              </button>
              <span>/</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">Shopping Cart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>B2B Fabric Sourcing Cart</span>
              {totalItemsCount > 0 && (
                <span className="text-sm font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                  {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review your sample swatches and wholesale roll quantities before initiating escrow checkout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateMarketplace}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </button>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            )}
          </div>
        </div>

        {/* EMPTY CART STATE */}
        {cart.length === 0 ? (
          <div className="bg-white dark:bg-[#132338] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-2xl mx-auto shadow-sm my-12">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/80 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400 shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Your B2B Sourcing Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
              Explore our verified textile mill catalog featuring GOTS-certified organic cottons, mulberry silks, recycled denims, and technical blends.
            </p>
            <button
              onClick={onNavigateMarketplace}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Fabric Marketplace</span>
            </button>
          </div>
        ) : (
          /* CART WITH ITEMS GRID */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2-Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#132338] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Selected Fabrics & Mill Orders</span>
                  <span>{cart.length} Line {cart.length === 1 ? 'Item' : 'Items'}</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-6 divide-y-0">
                  {cart.map((item) => {
                    const product = item.product;
                    const itemTotal = item.unitPrice * item.quantityMeters;
                    const moq = product?.moq || 50;
                    const isMoqMet = item.quantityMeters >= moq;

                    return (
                      <div
                        key={item.id}
                        className="pt-6 first:pt-0 flex flex-col sm:flex-row gap-5 group transition-all"
                      >
                        {/* Fabric Thumbnail Image */}
                        <div
                          onClick={() => product && onSelectProduct && onSelectProduct(product)}
                          className="w-full sm:w-32 h-32 sm:h-32 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 cursor-pointer relative border border-slate-200/80 dark:border-slate-700/60"
                        >
                          <img
                            src={product?.images?.[0] || 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300'}
                            alt={product?.name || 'Fabric Item'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {item.selectedColor || 'Natural'}
                          </div>
                        </div>

                        {/* Item Details & Controls */}
                        <div className="flex-1 flex flex-col justify-between space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <button
                                onClick={() => product && onSelectProduct && onSelectProduct(product)}
                                className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors"
                              >
                                {product?.name || 'High Quality Textile'}
                              </button>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                  {product?.supplierName || 'Apex Textile Mills'}
                                </span>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                  GSM: {product?.gsm || 220}
                                </span>
                              </div>
                            </div>

                            {/* Item Price */}
                            <div className="text-right shrink-0">
                              <span className="text-lg font-extrabold text-slate-900 dark:text-white block">
                                ${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                ${item.unitPrice}/m
                              </span>
                            </div>
                          </div>

                          {/* Specification Pills */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                              <Layers className="w-3 h-3 text-blue-500" />
                              {product?.composition || '100% Cotton'}
                            </span>

                            {isMoqMet ? (
                              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-lg font-bold text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Wholesale MOQ Met ({moq}m)
                              </span>
                            ) : (
                              <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-lg font-bold text-[11px] flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-500" />
                                Below Mill MOQ ({moq}m)
                              </span>
                            )}
                          </div>

                          {/* Bottom Row: Quantity Controls & Delete */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Quantity:
                              </span>
                              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(10, item.quantityMeters - 25))}
                                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantityMeters}
                                  onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-16 text-center text-xs font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
                                />
                                <span className="text-[11px] font-bold text-slate-400 pr-2">m</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantityMeters + 25)}
                                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold flex items-center gap-1 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guarantees Banner */}
              <div className="bg-gradient-to-r from-blue-900/90 to-[#0b1c30] rounded-2xl p-5 text-white shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-blue-600/30 border border-blue-400/30 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Fabric Mart B2B Escrow & Inspection Guarantee</h4>
                    <p className="text-xs text-blue-200/80 mt-0.5">
                      Funds remain locked in escrow until fabric inspection passes GSM and Lab-Dip specs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1-Column: Order Summary Panel */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#132338] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-5 sticky top-24">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  Order Summary
                </h3>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    B2B Promo Code / Partner Voucher
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. FABRIC10"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMsg && (
                    <p className={`text-[11px] font-bold ${promoMsg.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                      {promoMsg.text}
                    </p>
                  )}
                </form>

                {/* Calculation Rows */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Fabric Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Wholesale Discount ({discountPercent}%)</span>
                      <span>-${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      Est. Freight Shipping
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {estimatedShipping === 0 ? 'FREE' : `$${Number(estimatedShipping ?? 0).toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Est. Sales Tax & Customs (8%)</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${estimatedTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                        Estimated Total
                      </span>
                      <span className="text-[10px] text-slate-400">Includes Escrow Protection</span>
                    </div>
                    <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Primary Checkout CTA */}
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to B2B Escrow Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Accepted Payment Terms */}
                <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    Accepts Bank Wire (T/T), L/C, Escrow Card & Net 30 Terms
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
