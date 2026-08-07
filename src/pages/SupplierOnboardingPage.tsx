import React, { useState } from 'react';
import { Factory, Check, ArrowRight, ShieldCheck, FileText, Globe } from 'lucide-react';

export const SupplierOnboardingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [businessName, setBusinessName] = useState('Apex Textiles Ltd.');
  const [country, setCountry] = useState('Portugal');
  const [taxId, setTaxId] = useState('PT987654321');
  const [certifications, setCertifications] = useState<string[]>(['GOTS Organic', 'OEKO-TEX 100']);
  const [moqDefault, setMoqDefault] = useState(50);

  const toggleCert = (c: string) => {
    setCertifications((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Supplier Verification Hub</h2>
            <p className="text-xs text-slate-400">Onboard your mill to access 10,000+ global fashion buyers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Registered Mill / Business Name
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Country / Region</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tax / GST / VAT ID</label>
              <input
                type="text"
                required
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Audited Lab & Environmental Certifications:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['GOTS Organic', 'OEKO-TEX 100', 'GRS Recycled Standard', 'Masters of Linen', 'FairTrade', 'Bluesign'].map((cert) => (
                <button
                  type="button"
                  key={cert}
                  onClick={() => toggleCert(cert)}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    certifications.includes(cert)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cert}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Minimum Order Quantity (Meters)
            </label>
            <input
              type="number"
              value={moqDefault}
              onChange={(e) => setMoqDefault(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-md text-sm mt-4 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Complete Mill Onboarding & Open Portal</span>
          </button>
        </form>
      </div>
    </div>
  );
};
