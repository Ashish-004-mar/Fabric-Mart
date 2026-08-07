import React, { useEffect, useState } from 'react';
import { Bot, Key, Sparkles, MessageSquare, Terminal, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminAISettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    enabled: true,
    huggingFaceApiKey: '',
    selectedModel: 'FabricMart-LLM-v2',
    temperature: 0.7,
    maxTokens: 1024,
    voiceEnabled: true,
    groundingWithCatalog: true,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAISettingsAndLogs();
  }, []);

  const fetchAISettingsAndLogs = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const [resSet, resLogs] = await Promise.all([
        fetch('/api/admin/ai/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/ai/logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resSet.ok) {
        const dataSet = await resSet.json();
        setSettings(dataSet);
      }
      if (resLogs.ok) {
        const dataLogs = await resLogs.json();
        setLogs(dataLogs.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/ai/settings', {
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
            <Bot className="w-5 h-5 text-blue-400" /> AI Assistant & Copilot Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage Hugging Face model keys, prompt grounding, and voice synthesis rules.</p>
        </div>
        <button
          onClick={fetchAISettingsAndLogs}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Configuration updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="w-4 h-4 text-amber-400" /> API Credentials & Model Specs
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hugging Face API Access Key</label>
              <input
                type="password"
                placeholder="hf_..."
                value={settings.huggingFaceApiKey || ''}
                onChange={(e) => setSettings({ ...settings, huggingFaceApiKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Selected Text-Generation LLM Model</label>
              <select
                value={settings.selectedModel || 'FabricMart-LLM-v2'}
                onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="FabricMart-LLM-v2">FabricMart-LLM-v2 (Fine-tuned Textile Specialist)</option>
                <option value="mistralai/Mistral-7B-Instruct-v0.2">mistralai/Mistral-7B-Instruct-v0.2</option>
                <option value="meta-llama/Llama-3-8b-Instruct">meta-llama/Llama-3-8b-Instruct</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Temperature ({settings.temperature})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.temperature || 0.7}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Tokens ({settings.maxTokens})</label>
                <input
                  type="number"
                  value={settings.maxTokens || 1024}
                  onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-900">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.voiceEnabled)}
                  onChange={(e) => setSettings({ ...settings, voiceEnabled: e.target.checked })}
                  className="w-4 h-4 rounded-md accent-blue-600"
                />
                <span className="font-semibold text-slate-200">Enable Text-to-Speech Voice Responses</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings.groundingWithCatalog)}
                  onChange={(e) => setSettings({ ...settings, groundingWithCatalog: e.target.checked })}
                  className="w-4 h-4 rounded-md accent-blue-600"
                />
                <span className="font-semibold text-slate-200">Ground Assistant Responses with SQLite Catalog Data</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save AI Configuration
            </button>
          </div>
        </form>

        {/* AI Conversation Query Logs */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-emerald-400" /> AI Query Inspection Logs
            </h3>
            <p className="text-xs text-slate-400 mt-2">Recent buyer & supplier prompts parsed by Fabric Mart Copilot.</p>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">No AI logs recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-blue-400 uppercase">{log.userRole || 'BUYER'}</span>
                    <span className="font-mono">{log.executionTimeMs}ms latency</span>
                  </div>
                  <p className="font-semibold text-slate-200">"{log.userQuery}"</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{log.aiResponse}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
