import React, { useState, useEffect } from 'react';
import { TrendingUp, Cpu, Sparkles, ShieldCheck, ArrowRight, RefreshCw, FileText, CheckCircle, Zap } from 'lucide-react';
import { Product } from '../types';

interface TextileTrendsSectionProps {
  onSelectProduct: (product: Product) => void;
}

const TREND_TOPICS = [
  'Circular Recycled Fibers & Waterless Dyeing',
  'Bio-Based Leather & Mycelium Fibers',
  'GOTS 3.0 Organic Cotton & Regenerative Agriculture',
];

export const TextileTrendsSection: React.FC<TextileTrendsSectionProps> = ({ onSelectProduct }) => {
  const [activeTopic, setActiveTopic] = useState(TREND_TOPICS[0]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTrendReport = async (topicName: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName }),
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to fetch textile trends report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendReport(activeTopic);
  }, [activeTopic]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>2026 TEXTILE INTELLIGENCE & INNOVATIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Industry Insights & Material Trends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Live AI summarization of global textile innovation reports, fiber chemistry breakthroughs, and circular sourcing benchmarks powered by Hugging Face open source models.
          </p>
        </div>

        {/* Hugging Face API Powered Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 self-start md:self-auto shrink-0">
          <Cpu className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold">Hugging Face AI Summarizer</span>
        </div>
      </div>

      {/* Topic Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TREND_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => setActiveTopic(topic)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTopic === topic
                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTopic === topic ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{topic}</span>
          </button>
        ))}
      </div>

      {/* Main Report Card */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs z-10 flex items-center justify-center gap-3 text-slate-700 dark:text-slate-200 font-semibold text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span>Summarizing latest industry report via Hugging Face AI...</span>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Source: {report.source}</span>
                    <span>•</span>
                    <span>{report.timestamp}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchTrendReport(activeTopic)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                title="Re-run AI summarization"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh AI Report</span>
              </button>
            </div>

            {/* Executive Summary Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Executive Summary Takeaway
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {report.summary}
              </p>
            </div>

            {/* Key Innovations Grid */}
            {report.keyInnovations && report.keyInnovations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Technical Breakthroughs & Spec Highlights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.keyInnovations.map((item: string, idx: number) => {
                    const [head, body] = item.split(': ');
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{head}</span>
                        </div>
                        {body && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-6">{body}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Market & Procurement Impact */}
            {report.marketImpact && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    B2B Sourcing & Pricing Forecast
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {report.marketImpact}
                  </p>
                </div>
              </div>
            )}

            {/* Matching Showroom Fabrics */}
            {report.relatedFabrics && report.relatedFabrics.length > 0 && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recommended Showroom Fabrics Matching This Trend
                  </h4>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    In Stock & Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {report.relatedFabrics.map((prod: Product) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="group p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {prod.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate">
                            {prod.composition} • {prod.gsm} GSM
                          </p>
                          <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                            ${prod.pricePerMeter}/m
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
