import React, { useState } from 'react';
import { Search, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Award, Heart, ShoppingBag, Eye, Box, Move3d } from 'lucide-react';
import { motion } from 'motion/react';
import { Category, Product, SupplierProfile } from '../types';
import { FABRIC_TAXONOMY } from '../data/taxonomyData';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { TextileTrendsSection } from '../components/TextileTrendsSection';
import { Hero3DCanvas } from '../components/3dFabric/Hero3DCanvas';
import { Fabric3DModal } from '../components/3dFabric/Fabric3DModal';

interface LandingPageProps {
  categories: Category[];
  trendingProducts: Product[];
  suppliers: SupplierProfile[];
  onNavigateMarketplace: (searchQuery?: string, categoryId?: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectSupplier: (supplier: SupplierProfile) => void;
  openAIAssistant: () => void;
  openCopilot?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  categories,
  trendingProducts,
  suppliers,
  onNavigateMarketplace,
  onSelectProduct,
  onSelectSupplier,
  openAIAssistant,
  openCopilot,
}) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [selected3DProduct, setSelected3DProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateMarketplace(heroSearch);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 font-sans">
      {/* 3D Fabric Modal */}
      {selected3DProduct && (
        <Fabric3DModal
          product={selected3DProduct}
          isOpen={!!selected3DProduct}
          onClose={() => setSelected3DProduct(null)}
        />
      )}

      {/* HERO SECTION WITH REAL-TIME 3D CANVAS */}
      <section className="relative bg-[#0b1c30] text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero Left Content Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>3D ANIMATED REAL FABRIC MARKETPLACE</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Discover, Source & Inspect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">Real Fabrics in 3D</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Experience authentic textile textures, weave density, and drape physics in real-time 3D. Connect directly with verified mills, request swatches, and place bulk orders with B2B escrow guarantee.
            </p>

            {/* Hero AI Search Input */}
            <div className="max-w-xl pt-2">
              <form onSubmit={handleHeroSubmit} className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search: '100% organic cotton canvas', 'Silk Charmeuse'..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none px-2 py-2"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Tag Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Popular Queries:</span>
                {[
                  'Silk Charmeuse',
                  'Organic Linen',
                  'Performance Mesh',
                  'Raw Selvedge Denim',
                  'Recycled Poly',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onNavigateMarketplace(tag)}
                    className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Right Column: Interactive 3D Real Fabric Canvas (5 cols) */}
          <div className="lg:col-span-5">
            <Hero3DCanvas onExploreClick={() => onNavigateMarketplace()} />
          </div>

        </div>

        {/* Key Metrics Banner */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 mt-12 border-t border-slate-800/80 text-left">
          <div>
            <p className="text-2xl font-bold text-white">100+</p>
            <p className="text-xs text-slate-400">Verified Mill Partners</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">66 Subcategories</p>
            <p className="text-xs text-slate-400">Draped in Real 3D</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">48 Hours</p>
            <p className="text-xs text-slate-400">Global Swatch Express</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-xs text-slate-400">B2B Escrow Guarantee</p>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Browse Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Explore Fabrics by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigateMarketplace()}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => {
            const taxonomyMatch = FABRIC_TAXONOMY.find((t) => t.id === cat.id || t.slug === cat.slug);
            const subcats = taxonomyMatch?.subcategories.slice(0, 3) || [];

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => onNavigateMarketplace(undefined, cat.id)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 overflow-hidden relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md font-semibold">
                      {cat.fabricCount} Fabrics
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                {/* Interactive Subcategory Quick Filter Pills */}
                {subcats.length > 0 && (
                  <div className="p-2.5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-1 flex flex-wrap gap-1">
                    {subcats.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateMarketplace(sub.name, cat.id);
                        }}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md transition-colors"
                        title={`Explore ${sub.name}`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TRENDING FABRICS SPOTLIGHT */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                High Demand SKUs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Trending Sustainable & Performance Textiles
              </h2>
            </div>
            <button
              onClick={() => onNavigateMarketplace()}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All Textiles</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 4).map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xl transition-all flex flex-col group"
              >
                {/* Product Image & Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                    {prod.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-900/80 backdrop-blur-xs text-white font-bold text-[10px] px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => toggleWishlist(prod)}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-xs text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${isInWishlist(prod.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </button>
                </div>

                {/* Product Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>{prod.categoryName}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {prod.stockQuantity}m Stock
                      </span>
                    </div>
                    <h3
                      onClick={() => onSelectProduct(prod)}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
                    >
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {prod.composition} • {prod.gsm} GSM • Width {prod.widthCm}cm
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                        ${Number(prod.pricePerMeter ?? 0).toFixed(2)}
                        <span className="text-[10px] font-normal text-slate-400">/m</span>
                      </p>
                      <p className="text-[10px] text-slate-400">MOQ: {prod.moq}m</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelected3DProduct(prod)}
                        className="px-2 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Open Interactive 3D Real Fabric View"
                      >
                        <Box className="w-3.5 h-3.5" />
                        <span>3D View</span>
                      </button>
                      <button
                        onClick={() => onSelectProduct(prod)}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
                        title="View Product Specs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addToCart(prod)}
                        className="bg-[#131b2e] dark:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP VERIFIED MILLS SPOTLIGHT */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Verified Manufacturers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Source Directly from Global Heritage Mills
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Every mill on Fabric Mart is audited for labor compliance, GOTS/OEKO-TEX certifications, and technical yarn testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suppliers.map((supp) => (
            <div
              key={supp.userId}
              onClick={() => onSelectSupplier(supp)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={supp.logo}
                      alt={supp.businessName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{supp.businessName}</span>
                        <ShieldCheck className="w-4 h-4 text-blue-600 fill-blue-100" />
                      </h3>
                      <p className="text-[11px] text-slate-500">{supp.city}, {supp.country}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                    ★ {supp.rating}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {supp.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {supp.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded-md"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{supp.totalProductsCount}+ Fabrics Active</span>
                <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:underline">
                  <span>Visit Mill Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEXTILE TRENDS & INDUSTRY INSIGHTS SECTION */}
      <TextileTrendsSection onSelectProduct={onSelectProduct} />

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500 mt-2">Everything you need to know about sourcing and selling on Fabric Mart.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { q: 'How do I track my order?', a: 'You can easily track your order by interacting with our FM Voice Agent. Simply click the floating Voice Agent icon and say "Where is my order?" or navigate to the Order History section in your Buyer Dashboard.' },
              { q: 'What is the minimum order quantity (MOQ)?', a: 'MOQs vary by supplier and fabric type. Each product page clearly lists the MOQ set by the mill. You can also filter search results by your desired MOQ.' },
              { q: 'Are the fabrics certified for sustainability?', a: 'Yes! Many of our suppliers provide certified sustainable textiles (GOTS, OEKO-TEX, etc.). You can filter your search to show only certified eco-friendly materials.' },
              { q: 'Can I request fabric swatches before a bulk order?', a: 'Absolutely. On the product details page, buyers can request a sample swatch for review. Suppliers typically ship samples within 2-3 business days.' }
            ].map((faq, index) => (
              <div key={index} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI ASSISTANT BANNER */}
      <section className="py-12 bg-[#131b2e] text-white my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fabric Mart B2B Sourcing Text Assistant</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Unsure about GSM or composition specs for your next line?</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Our AI Sales Consultant queries live mill stock to find exact yarn matches, shrinkage rates, and eco-scores instantly.
            </p>
          </div>
          <button
            onClick={openAIAssistant}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shrink-0 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>Launch Fabric Mart Text Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
