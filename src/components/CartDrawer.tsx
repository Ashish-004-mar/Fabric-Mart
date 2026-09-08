import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal } = useCart();

  if (!isCartOpen) return null;

  const estimatedShipping = subtotal > 0 ? 120 : 0;
  const estimatedTax = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + estimatedShipping + estimatedTax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Sample & Bulk Cart</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our fabric marketplace and add sample rolls or production yardage to your order.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex gap-4"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">Supplier: {item.product.supplierName}</p>
                      <p className="text-[10px] text-blue-600 font-medium">Color: {item.selectedColor}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {/* Meter Quantity Selector */}
                      <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900">
                        <input
                          type="number"
                          min={item.product.moq || 10}
                          step={10}
                          value={item.quantityMeters}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="w-16 px-2 py-0.5 text-xs text-center font-semibold text-slate-800 dark:text-white focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 pr-2">m</span>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          ${Number((item.unitPrice ?? 0) * (item.quantityMeters ?? 0)).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-slate-400">${item.unitPrice}/m</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Fabric Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">${Number(subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Est. Mill Freight (Freight/Rolls)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">${Number(estimatedShipping ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Est. Tax (8%)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">${Number(estimatedTax ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Estimated Total</span>
                  <span className="text-blue-600">${Number(grandTotal ?? 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected by Fabric Mart Escrow Guarantee & Quality Inspection.</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed to B2B Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
