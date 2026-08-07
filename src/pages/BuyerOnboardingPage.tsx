import React, { useState } from 'react';
import { Bot, Check, ArrowRight, Sparkles, Building, Layers, DollarSign } from 'lucide-react';

export const BuyerOnboardingPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState('Apparel Brand');
  const [categories, setCategories] = useState<string[]>(['Silk & Satins', 'Organic Linen']);
  const [typicalOrder, setTypicalOrder] = useState('100 - 500 meters');
  const [sustainabilityFocus, setSustainabilityFocus] = useState(true);

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Top Wizard Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">AI Buyer Onboarding</h2>
              <p className="text-[11px] text-slate-400">Step {step} of 3 • Customizing Sourcing Recommendations</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-6 h-2 rounded-full transition-all ${
                  s === step ? 'bg-blue-600 w-8' : s < step ? 'bg-blue-300' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Business Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              What best describes your business?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                'Apparel Brand / Label',
                'Independent Fashion Designer',
                'Garment Manufacturer / Factory',
                'Custom Tailor / Atelier',
                'Interior Decorator',
                'Textile Wholesaler',
              ].map((type) => (
                <div
                  key={type}
                  onClick={() => setBusinessType(type)}
                  className={`p-4 rounded-2xl border cursor-pointer font-bold transition-all ${
                    businessType === type
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 text-xs shadow-md mt-4"
            >
              <span>Next: Preferred Fabric Types</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Fabric Preferences */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Which textiles do you source most frequently?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                'Organic Linen',
                'Silk & Satins',
                'Cotton & Blends',
                'Technical Denim',
                'Performance Synthetics',
                'Luxury Wool',
                'Sustainable Recycled',
                'Upholstery Canvas',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`p-3 rounded-xl border font-semibold text-left transition-all ${
                    categories.includes(cat)
                      ? 'border-blue-600 bg-blue-600 text-white font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 text-xs shadow-md"
              >
                <span>Next: Order Scale</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Order Quantities & Finish */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Typical Order Volumes & Eco Focus
            </h3>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Typical Order Quantity per Fabric SKU:
              </label>
              <select
                value={typicalOrder}
                onChange={(e) => setTypicalOrder(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-slate-800 dark:text-white"
              >
                <option value="10 - 50 meters">Sample Rolls (10 - 50 meters)</option>
                <option value="100 - 500 meters">Small Batch Production (100 - 500 meters)</option>
                <option value="500 - 2,000 meters">Medium Industrial Run (500 - 2,000 meters)</option>
                <option value="2,000+ meters">Large Scale Container (2,000+ meters)</option>
              </select>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  Prioritize GOTS / Organic Textiles
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Filter search results automatically for verified low-carbon mills
                </p>
              </div>
              <input
                type="checkbox"
                checked={sustainabilityFocus}
                onChange={(e) => setSustainabilityFocus(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl text-xs"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 text-xs shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Complete Profile & Explore</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
