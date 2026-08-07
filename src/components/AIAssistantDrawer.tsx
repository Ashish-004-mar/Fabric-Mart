import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Bot, X, Send, Sparkles, Scale, RefreshCw, ArrowRight, ExternalLink, Store, User, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIChatMessage, Product } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { user, role } = useAuth();
  const isSeller = role === 'SUPPLIER';

  const [activeTab, setActiveTab] = useState<'chat' | 'compare'>('chat');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Comparison Tab States
  const [compareFabric1, setCompareFabric1] = useState('Luminous Charmeuse Silk');
  const [compareFabric2, setCompareFabric2] = useState('Organic Bamboo Silk Satin');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  const [expandedMsgIds, setExpandedMsgIds] = useState<Record<string, boolean>>({});

  const toggleExpandMsg = (id: string) => {
    setExpandedMsgIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const buyerWelcome = `Hello ${user?.name || 'Valued Buyer'}! I am your AI Sales Consultant.\n\nAsk me for fabric recommendations, comparisons, or help finding the best materials for your needs.`;

  const sellerWelcome = `Hello ${user?.name || 'Mill Partner'}! I am your Business & Inventory Assistant.\n\nI can help you generate product descriptions, SEO titles, and suggest tags to improve your listings.`;

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: isSeller ? sellerWelcome : buyerWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: `init-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: isSeller ? sellerWelcome : buyerWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [role, user?.name, isSeller, sellerWelcome, buyerWelcome]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || inputMessage;
    if (!query.trim()) return;

    const formattedQuery = isSeller ? `[Supplier/Seller Request] ${query}` : query;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: formattedQuery }),
      });
      const data = await res.json();

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: data.reply || data.text || 'I analyzed our Fabric Mart catalog for matches.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.suggestedProducts,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setExpandedMsgIds((prev) => ({ ...prev, [aiMsg.id]: true }));
    } catch (err) {
      console.error('AI chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunComparison = async () => {
    if (!compareFabric1 || !compareFabric2) return;
    setIsComparing(true);
    setComparisonResult(null);

    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fabric1Name: compareFabric1, fabric2Name: compareFabric2 }),
      });
      const data = await res.json();
      setComparisonResult(data);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const stripMarkdown = (str: string) => {
    if (!str) return '';
    return str
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^[\s-]*\*\s+/gm, '')
      .trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full animate-slideLeft">
      
      {/* Header - Pure Text Assistant (No Model Selection, No Role Toggle) */}
      <div className="p-4 bg-[#131b2e] text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-white">Fabric Mart Assistant</h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                Text-Based
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
              {isSeller ? (
                <>
                  <Store className="w-3 h-3 text-amber-400" />
                  <span>Business & Inventory Assistant</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-blue-400" />
                  <span>Senior Fabric Sales Consultant</span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sourcing Assistant</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('compare');
            if (!comparisonResult && !isComparing) handleRunComparison();
          }}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'compare'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Side-by-Side Specs</span>
        </button>
      </div>

      {/* TAB 1: Text Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id || `msg-${index}`}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="space-y-3">
                      <p className="text-sm">{msg.text}</p>
                      
                      {/* Suggested Fabric Cards */}
                      {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              Provided Products
                            </span>
                            <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded-full font-bold">
                              {msg.suggestedProducts.length} Items
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.suggestedProducts.map((prod) => (
                              <div
                                key={prod.id}
                                onClick={() => onSelectProduct && onSelectProduct(prod)}
                                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all group shadow-2xs"
                              >
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-[11px] text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                    {prod.name}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                    ${prod.pricePerMeter}/m • {prod.gsm} GSM
                                  </p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-medium text-white">{msg.text}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Analyzing textile database...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-1.5 text-[11px] hide-scrollbar">
            {isSeller ? (
              <>
                <button
                  onClick={() => handleSendMessage(undefined, 'Generate a premium description for Mulberry Silk Charmeuse.')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
                >
                  ✨ Premium Silk Desc
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'Suggest tags for Selvedge Denim.')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
                >
                  🏷️ Denim Tags
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'How should I price Organic Cotton?')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
                >
                  💰 Price Organic Cotton
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'Create an SEO-friendly title for Ripstop Nylon.')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
                >
                  🔍 SEO Nylon
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'Suggest inventory improvements.')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
                >
                  📦 Inventory Tips
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSendMessage(undefined, 'Which fabric is best for summer shirts?')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
                >
                  ☀️ Summer Shirts
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'Compare Egyptian Cotton and Pima Cotton.')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
                >
                  ⚖️ Cotton Compare
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'Suggest eco-friendly fabrics under ₹700.')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
                >
                  🌱 Eco-Friendly
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'What is the difference between Linen and Hemp?')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
                >
                  🤔 Linen vs Hemp
                </button>
                <button
                  onClick={() => handleSendMessage(undefined, 'Recommend upholstery fabrics with high durability.')}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
                >
                  🛋️ Upholstery
                </button>
              </>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder={isSeller ? "Ask about product descriptions, SEO, tags..." : "Ask for fabric recommendations, comparisons..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Side-by-Side Fabric Spec Comparison */}
      {activeTab === 'compare' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Technical Fabric Spec Comparison</span>
            </h4>
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              Select two fabrics from our catalog to compare GSM, composition, shrinkage, and eco-certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fabric A
              </label>
              <input
                type="text"
                value={compareFabric1}
                onChange={(e) => setCompareFabric1(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fabric B
              </label>
              <input
                type="text"
                value={compareFabric2}
                onChange={(e) => setCompareFabric2(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              onClick={handleRunComparison}
              disabled={isComparing}
              className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {isComparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Compare Fabrics Now</span>
            </button>
          </div>

          {comparisonResult && (
            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Specification Matrix
              </h5>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">Attribute</th>
                      <th className="p-2.5 text-blue-600 dark:text-blue-400">{comparisonResult.fabric1?.name || 'Fabric A'}</th>
                      <th className="p-2.5 text-emerald-600 dark:text-emerald-400">{comparisonResult.fabric2?.name || 'Fabric B'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <td className="p-2.5 font-semibold bg-slate-50/50 dark:bg-slate-900">Composition</td>
                      <td className="p-2.5">{comparisonResult.fabric1?.composition}</td>
                      <td className="p-2.5">{comparisonResult.fabric2?.composition}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold bg-slate-50/50 dark:bg-slate-900">GSM Weight</td>
                      <td className="p-2.5">{comparisonResult.fabric1?.gsm} GSM</td>
                      <td className="p-2.5">{comparisonResult.fabric2?.gsm} GSM</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold bg-slate-50/50 dark:bg-slate-900">Price/m</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">${comparisonResult.fabric1?.pricePerMeter}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">${comparisonResult.fabric2?.pricePerMeter}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold bg-slate-50/50 dark:bg-slate-900">Certifications</td>
                      <td className="p-2.5">{comparisonResult.fabric1?.certifications?.join(', ')}</td>
                      <td className="p-2.5">{comparisonResult.fabric2?.certifications?.join(', ')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {comparisonResult.verdict && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>AI Recommendation</span>
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">{stripMarkdown(comparisonResult.verdict)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
