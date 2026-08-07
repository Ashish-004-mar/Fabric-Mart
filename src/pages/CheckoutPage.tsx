import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { orderEventEmitter } from '../utils/eventEmitter';
import { ShieldCheck, Truck, Check, ArrowRight, FileText, Building2, CreditCard, Clock, Download } from 'lucide-react';

export const CheckoutPage: React.FC<{ onOrderPlaced: (order: Order) => void }> = ({ onOrderPlaced }) => {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State initialized from current logged in user
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [contactPerson, setContactPerson] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [paymentMethod, setPaymentMethod] = useState<'escrow_card' | 'bank_wire' | 'b2b_terms'>('escrow_card');

  const estimatedShipping = subtotal > 0 ? 120 : 0;
  const estimatedTax = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + estimatedShipping + estimatedTax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user?.id,
          buyerName: user?.name || contactPerson,
          buyerEmail: user?.email,
          shippingAddress: {
            companyName: companyName || user?.companyName || 'My Fashion Brand',
            contactPerson: contactPerson || user?.name || 'Buyer',
            phone,
            addressLine1,
            city,
            state,
            postalCode,
            country,
          },
          items: cart,
          subtotal,
          shippingEstimate: estimatedShipping,
          taxAmount: estimatedTax,
        }),
      });
      const data = await res.json();
      if (data.order) {
        setPlacedOrder(data.order);
        orderEventEmitter.emitOrderCreated(data.order.id, data.order.orderNumber, contactPerson || user?.name || 'Buyer', grandTotal);
        clearCart();
        setStep(4);
      }
    } catch (err) {
      console.error('Error placing order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* TOP WIZARD STEPS */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs">1</span>
            <span className="hidden sm:inline">Shipping & Company</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs">2</span>
            <span className="hidden sm:inline">Review Order Items</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs">3</span>
            <span className="hidden sm:inline">Escrow Payment</span>
          </div>
        </div>

        {/* STEP 1: Shipping Address & Company Details */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              1. Delivery Address & Mill Shipping Instructions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Postal / Zip Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <span>Continue to Review Items</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Review Order Items */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              2. Review Selected Fabric Rolls & Quantities
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cart.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.product.name}</h4>
                      <p className="text-slate-500">{item.product.composition} • Color: {item.selectedColor}</p>
                      <p className="text-blue-600 font-semibold">{item.quantityMeters} meters @ ${item.unitPrice}/m</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    ${(item.unitPrice * item.quantityMeters).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Mill Air Freight Estimate:</span><span className="font-bold">${estimatedShipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Est. Tax (8%):</span><span className="font-bold">${estimatedTax.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm font-black text-blue-600 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Grand Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-6 rounded-xl text-xs">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 text-xs flex items-center justify-center gap-2 shadow-md">
                <span>Proceed to Escrow Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Escrow Payment Selection */}
        {step === 3 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              3. Secure B2B Escrow Payment Protection
            </h2>

            <div className="space-y-3 text-xs">
              <div
                onClick={() => setPaymentMethod('escrow_card')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'escrow_card' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input type="radio" checked={paymentMethod === 'escrow_card'} readOnly className="mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Escrow Credit Card / Debit</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Funds held in escrow until physical swatch or yardage is delivered and inspected.</p>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('bank_wire')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'bank_wire' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input type="radio" checked={paymentMethod === 'bank_wire'} readOnly className="mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Commercial Bank Wire Transfer (SWIFT / SEPA)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Recommended for high volume container orders over $10,000.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl hover:bg-blue-700 text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isSubmitting ? 'Processing Order...' : `Confirm Order & Deposit $${grandTotal.toFixed(2)} in Escrow`}</span>
            </button>
          </div>
        )}

        {/* STEP 4: Order Confirmation Screen */}
        {step === 4 && placedOrder && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Order Confirmed</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Order #{placedOrder.orderNumber} Submitted
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                Your order has been transmitted directly to the verified mills. The mill manager is reviewing inventory for cutting and dispatch.
              </p>
            </div>

            {/* B2B Invoice Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200">Fabric Mart Commercial Proforma Invoice</span>
                <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded text-[10px]">STATUS: PENDING MILL DISPATCH</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <p><strong>Grand Total:</strong> ${placedOrder.grandTotal.toFixed(2)}</p>
                <p><strong>Items Count:</strong> {placedOrder.items.length} SKUs</p>
                <p><strong>Delivery Address:</strong> {placedOrder.shippingAddress.addressLine1}, {placedOrder.shippingAddress.city}</p>
                <p><strong>Escrow Status:</strong> Funds Deposited</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onOrderPlaced(placedOrder)}
                className="bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 text-xs flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Track Order Timeline in Buyer Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
