import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  KeyRound,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';

export const AdminBuyersTab: React.FC = () => {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null);
  const [resetPwdResult, setResetPwdResult] = useState<string | null>(null);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/buyers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBuyers(data.buyers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/buyers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchBuyers();
        if (selectedBuyer?.id === id) {
          setSelectedBuyer({ ...selectedBuyer, status });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/buyers/${id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResetPwdResult(`Password successfully reset to: ${data.newPassword}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBuyer = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this buyer account?')) return;
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/buyers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSelectedBuyer(null);
        fetchBuyers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBuyers = buyers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      (b.companyName && b.companyName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Buyer Management Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage, inspect, and moderate registered apparel procurement buyers.</p>
        </div>
        <button
          onClick={fetchBuyers}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search buyers by name, email, or company..."
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
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">ACTIVE Users</option>
            <option value="INACTIVE">INACTIVE Users</option>
            <option value="SUSPENDED">SUSPENDED Users</option>
          </select>
        </div>
      </div>

      {resetPwdResult && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <span>{resetPwdResult}</span>
          <button onClick={() => setResetPwdResult(null)} className="text-emerald-400 hover:text-emerald-200 font-bold">✕</button>
        </div>
      )}

      {/* Buyers Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Buyer Info</th>
                <th className="px-5 py-3.5">Company & Industry</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Loading buyers directory...</td>
                </tr>
              ) : filteredBuyers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No buyers found matching criteria.</td>
                </tr>
              ) : (
                filteredBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={buyer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(buyer.name)}&background=1e293b&color=38bdf8`}
                          alt={buyer.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white">{buyer.name}</p>
                          <p className="text-[11px] text-slate-400">{buyer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-200">{buyer.companyName || 'N/A'}</p>
                      <p className="text-[11px] text-slate-500">{buyer.buyerProfile?.industry || 'Apparel Sourcing'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          buyer.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : buyer.status === 'SUSPENDED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {buyer.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(buyer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBuyer(buyer)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(buyer.id)}
                          className="p-1.5 bg-slate-800 hover:bg-amber-900/40 text-amber-300 rounded-lg transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {buyer.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleUpdateStatus(buyer.id, 'SUSPENDED')}
                            className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Suspend Buyer Account"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(buyer.id, 'ACTIVE')}
                            className="p-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 rounded-lg transition-colors cursor-pointer"
                            title="Re-activate Buyer Account"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBuyer(buyer.id)}
                          className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Buyer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buyer Detail Drawer/Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 relative text-slate-200 shadow-2xl">
            <button
              onClick={() => setSelectedBuyer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <img
                src={selectedBuyer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBuyer.name)}&background=1e293b&color=38bdf8`}
                alt={selectedBuyer.name}
                className="w-12 h-12 rounded-full border border-slate-700"
              />
              <div>
                <h3 className="text-base font-bold text-white">{selectedBuyer.name}</h3>
                <p className="text-xs text-slate-400">{selectedBuyer.email}</p>
                <p className="text-xs font-semibold text-blue-400 mt-0.5">{selectedBuyer.companyName}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Business Type</span>
                  <span className="font-semibold text-slate-200">{selectedBuyer.buyerProfile?.businessType || 'Apparel Brand'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Typical Order Volume</span>
                  <span className="font-semibold text-slate-200">{selectedBuyer.buyerProfile?.typicalOrderQuantity || '500 - 2,000 meters'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Budget Range</span>
                  <span className="font-semibold text-slate-200">{selectedBuyer.buyerProfile?.budgetRange || '$10,000 - $50,000 / mo'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Sustainability Focus</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedBuyer.buyerProfile?.sustainabilityFocus ? 'GOTS / OEKO-TEX Required' : 'Standard'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Account Status:</span>
                <span className="font-bold text-emerald-400 uppercase">{selectedBuyer.status}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleResetPassword(selectedBuyer.id)}
                className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset Password
              </button>
              <button
                onClick={() => setSelectedBuyer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
