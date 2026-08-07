import React, { useEffect, useState } from 'react';
import { Settings, ShieldAlert, DollarSign, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    marketplaceName: 'Fabric Mart',
    tagline: 'B2B Wholesale Fabric Marketplace',
    currencySymbol: '$ USD',
    taxRatePercent: 8.5,
    defaultShippingRate: 150,
    maintenanceMode: false,
    requireSupplierApproval: true,
    requireProductApproval: true,
    jwtExpiryHours: 24,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
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
            <Settings className="w-5 h-5 text-blue-400" /> System Configuration & Security Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1">Global marketplace settings, tax rates, currency parameters, and maintenance modes.</p>
        </div>
        <button
          onClick={fetchSettings}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Settings
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> System settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Marketplace Platform Title</label>
            <input
              type="text"
              value={settings.marketplaceName || ''}
              onChange={(e) => setSettings({ ...settings, marketplaceName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tagline / Mission Copy</label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Marketplace Default Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRatePercent || 8.5}
              onChange={(e) => setSettings({ ...settings, taxRatePercent: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Default Freight Shipping Estimate ($)</label>
            <input
              type="number"
              value={settings.defaultShippingRate || 150}
              onChange={(e) => setSettings({ ...settings, defaultShippingRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Security & Maintenance Mode */}
        <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
          <h4 className="font-bold text-white text-sm">Security & Onboarding Controls</h4>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.requireSupplierApproval)}
                onChange={(e) => setSettings({ ...settings, requireSupplierApproval: e.target.checked })}
                className="w-4 h-4 rounded-md accent-blue-600"
              />
              <span className="font-semibold text-slate-200">Require Manual Admin Approval for New Supplier Mills</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.requireProductApproval)}
                onChange={(e) => setSettings({ ...settings, requireProductApproval: e.target.checked })}
                className="w-4 h-4 rounded-md accent-blue-600"
              />
              <span className="font-semibold text-slate-200">Require Manual Moderation for New Fabric Products</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.maintenanceMode)}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded-md accent-rose-600"
              />
              <span className="font-semibold text-rose-400">Enable Platform Maintenance Lock Mode</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
