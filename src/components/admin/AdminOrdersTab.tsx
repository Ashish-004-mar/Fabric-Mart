import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  XCircle,
  Truck,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  RefreshCw,
} from 'lucide-react';

export const AdminOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, note: `Status updated by admin to ${status}` }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !cancelReason) return;

    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancelReason('');
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" /> Marketplace Orders & Fulfillment
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit transactions, manage order disputes, and track mill shipments.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders by order #, buyer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="Pending">Pending Orders</option>
            <option value="Confirmed">Confirmed Orders</option>
            <option value="Preparing">Preparing Mill Shipment</option>
            <option value="Shipped">In Transit (Shipped)</option>
            <option value="Completed">Completed Orders</option>
            <option value="Cancelled">Cancelled Orders</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Buyer House</th>
                <th className="px-5 py-3.5">Items / Fabric</th>
                <th className="px-5 py-3.5">Grand Total</th>
                <th className="px-5 py-3.5">Fulfillment Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading marketplace orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white font-mono">{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-200">{order.buyerName}</p>
                      <p className="text-[11px] text-slate-400">{order.buyerEmail}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-300 font-medium">
                        {order.items?.[0]?.productName || 'Wholesale Fabric Batch'}
                        {order.items?.length > 1 && ` (+${order.items.length - 1} more)`}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {order.items?.reduce((acc: number, item: any) => acc + (item.quantityMeters || 0), 0)} total meters
                      </p>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400 text-sm">
                      ${order.grandTotal?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Completed' || order.status === 'Shipped'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {order.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancelModal(true);
                            }}
                            className="p-1.5 bg-rose-950/50 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Order with Dispute Reason"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && !showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative text-slate-200 shadow-2xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Order #{selectedOrder.orderNumber}</span>
              <span className="text-xs font-bold text-emerald-400 uppercase">{selectedOrder.status}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Buyer Details</span>
                <span className="font-semibold text-slate-200">{selectedOrder.buyerName} ({selectedOrder.buyerEmail})</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Purchased Fabric Items</span>
                <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">{item.quantityMeters} meters @ ${item.unitPrice}/m</p>
                      </div>
                      <span className="font-semibold text-emerald-400">${(item.quantityMeters * item.unitPrice).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="text-emerald-400">${selectedOrder.grandTotal?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCancelOrder}
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 relative text-slate-200 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Cancel Order #{selectedOrder.orderNumber}
            </h3>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Reason for Cancellation / Dispute Resolution *</label>
              <textarea
                rows={3}
                required
                placeholder="Specify reason (e.g., Mill out of stock, Fraud prevention, Buyer requested cancellation)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Confirm Order Cancellation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
