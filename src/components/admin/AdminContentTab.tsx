import React, { useEffect, useState } from 'react';
import { FileText, Image, HelpCircle, Save, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminContentTab: React.FC = () => {
  const [content, setContent] = useState<any>({
    banners: [
      {
        id: 'banner-1',
        headline: 'Direct Textile Sourcing from Verified Global Mills',
        subheadline: 'Browse over 10,000+ certified sustainable fabrics with low MOQs and instant sample swatches.',
        ctaText: 'Explore Marketplace',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
        active: true,
      }
    ],
    faqs: [
      { id: 'faq-1', question: 'What is the minimum order quantity (MOQ) on Fabric Mart?', answer: 'MOQs are set directly by supplier mills and typically range from 50 meters to 300 meters depending on production specs.', category: 'Sourcing' },
      { id: 'faq-2', question: 'How do fabric sample swatches work?', answer: 'Apparel buyers can request physical swatch header books directly from mill pages with express DHL/FedEx delivery.', category: 'Samples' }
    ],
    aboutContent: 'Fabric Mart connects premier textile mills with global fashion houses and apparel manufacturers through direct transparent digital trade.',
    contactEmail: 'support@fabricmart.com',
    contactPhone: '+1 (800) 555-FABRIC',
    supportHours: 'Mon-Fri 08:00 - 20:00 EST',
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/content', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(content),
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
            <FileText className="w-5 h-5 text-indigo-400" /> CMS & Storefront Copy Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Customize homepage hero banners, FAQ answers, and marketplace support copy.</p>
        </div>
        <button
          onClick={fetchContent}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Content
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CMS content updated successfully!
        </div>
      )}

      <form onSubmit={handleSaveContent} className="space-y-6">
        {/* Banner Section */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Image className="w-4 h-4 text-blue-400" /> Storefront Hero Banner Settings
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Banner Headline</label>
              <input
                type="text"
                value={content.banners?.[0]?.headline || ''}
                onChange={(e) => {
                  const banners = [...content.banners];
                  banners[0] = { ...banners[0], headline: e.target.value };
                  setContent({ ...content, banners });
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Banner Subheadline</label>
              <textarea
                rows={2}
                value={content.banners?.[0]?.subheadline || ''}
                onChange={(e) => {
                  const banners = [...content.banners];
                  banners[0] = { ...banners[0], subheadline: e.target.value };
                  setContent({ ...content, banners });
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Banner Background Image URL</label>
              <input
                type="text"
                value={content.banners?.[0]?.imageUrl || ''}
                onChange={(e) => {
                  const banners = [...content.banners];
                  banners[0] = { ...banners[0], imageUrl: e.target.value };
                  setContent({ ...content, banners });
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Support & Contact Info */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <HelpCircle className="w-4 h-4 text-emerald-400" /> Platform Contact & Support Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Support Email</label>
              <input
                type="email"
                value={content.contactEmail || ''}
                onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Support Phone</label>
              <input
                type="text"
                value={content.contactPhone || ''}
                onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operating Hours</label>
              <input
                type="text"
                value={content.supportHours || ''}
                onChange={(e) => setContent({ ...content, supportHours: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Storefront CMS Content
          </button>
        </div>
      </form>
    </div>
  );
};
