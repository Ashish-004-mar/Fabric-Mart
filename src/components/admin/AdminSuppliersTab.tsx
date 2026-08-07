import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Edit2,
  Eye,
  FileCheck,
  MapPin,
  Award,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';

export const AdminSuppliersTab: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/suppliers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStatus = async (supplierId: string, status: string) => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/suppliers/${supplierId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchSuppliers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSupplierEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/suppliers/${editingSupplier.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingSupplier),
      });
      if (res.ok) {
        setEditingSupplier(null);
        fetchSuppliers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
      (s.country && s.country.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" /> Textile Mill & Supplier Moderation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review mill registrations, audit GOTS/OEKO-TEX certificates, and manage supplier listings.
          </p>
        </div>
        <button
          onClick={fetchSuppliers}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Directory
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by business name, contact, or country..."
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
            <option value="ALL">All Verification Statuses</option>
            <option value="VERIFIED">VERIFIED Mills</option>
            <option value="PENDING">PENDING Verification</option>
            <option value="REJECTED">REJECTED Applications</option>
            <option value="SUSPENDED">SUSPENDED Mills</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Supplier Mill</th>
                <th className="px-5 py-3.5">Location & Tax ID</th>
                <th className="px-5 py-3.5">Certifications</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading supplier list...</td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No suppliers found matching query.</td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.userId} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={supplier.logo || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=80'}
                          alt={supplier.businessName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {supplier.businessName}
                            {supplier.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
                          </p>
                          <p className="text-[11px] text-slate-400">{supplier.email || supplier.contactPerson}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {supplier.city ? `${supplier.city}, ${supplier.country}` : supplier.country}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">GST/Tax: {supplier.gstTaxId || 'PENDING-SUBMISSION'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(supplier.certifications || ['GOTS Certified', 'OEKO-TEX']).slice(0, 2).map((cert: string) => (
                          <span key={cert} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          supplier.status === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : supplier.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : supplier.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingSupplier({ ...supplier })}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Supplier Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {supplier.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleApproveStatus(supplier.userId, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve Mill
                          </button>
                        )}
                        {supplier.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleApproveStatus(supplier.userId, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-semibold text-[10px] rounded-lg transition-colors border border-rose-800 flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" /> Reject
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

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSupplierEdit}
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative text-slate-200 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setEditingSupplier(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" /> Edit Mill Details - {editingSupplier.businessName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Business Name</label>
                <input
                  type="text"
                  value={editingSupplier.businessName || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, businessName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editingSupplier.contactPerson || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingSupplier.phone || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={editingSupplier.city || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={editingSupplier.country || ''}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">GST / Tax Identification ID</label>
                <input
                  type="text"
                  value={editingSupplier.gstTaxId || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, gstTaxId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
