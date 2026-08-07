import React, { useEffect, useState } from 'react';
import { Bell, Send, Users, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const AdminNotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetAudience: 'ALL' as 'ALL' | 'BUYER' | 'SUPPLIER',
    priority: 'normal',
  });
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;

    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSentSuccess(true);
        setForm({ title: '', message: '', targetAudience: 'ALL', priority: 'normal' });
        setTimeout(() => setSentSuccess(false), 3000);
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" /> Marketplace Announcement Broadcast Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">Send platform notifications directly to buyers, supplier mills, or system-wide.</p>
        </div>
      </div>

      {sentSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Broadcast notification sent to marketplace users!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Broadcast Form */}
        <form onSubmit={handleSendNotification} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Send className="w-4 h-4 text-blue-400" /> Compose New Announcement
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Q2 Sustainable Fabric Trade Fair Schedule"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Platform Users</option>
                  <option value="BUYER">Apparel Buyers Only</option>
                  <option value="SUPPLIER">Textile Mills / Suppliers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal Information</option>
                  <option value="high">High Priority Alert</option>
                  <option value="urgent">Urgent System Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Message Content *</label>
              <textarea
                rows={4}
                required
                placeholder="Type the detailed broadcast text..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Broadcast Announcement
            </button>
          </div>
        </form>

        {/* Broadcast History */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-slate-400" /> Broadcast History Log
            </h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-slate-500 text-center">Loading broadcasts...</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center">No announcements broadcasted yet.</p>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.title}</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-semibold uppercase">
                      {item.targetAudience}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">{item.message}</p>
                  <p className="text-[10px] text-slate-500 pt-1">
                    Sent by {item.sentBy} on {new Date(item.sentAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
