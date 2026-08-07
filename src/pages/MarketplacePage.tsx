import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal, Heart, ShoppingBag, Eye, X, ChevronLeft, ChevronRight, Check, Barcode, Tag, RotateCcw, Mic, MicOff, TrendingUp, Sparkles, Box } from 'lucide-react';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { TextileTrendsSection } from '../components/TextileTrendsSection';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { VoiceInputVisualizer } from '../components/VoiceInputVisualizer';
import { Fabric3DModal } from '../components/3dFabric/Fabric3DModal';

interface MarketplacePageProps {
  categories: Category[];
  initialSearchQuery?: string;
  initialCategoryId?: string;
  onCategoryChange?: (categoryId: string) => void;
  onSearchChange?: (searchQuery: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  categories,
  initialSearchQuery = '',
  initialCategoryId = '',
  onCategoryChange,
  onSearchChange,
  onSelectProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [skuQuery, setSkuQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [selectedFabricType, setSelectedFabricType] = useState('all');
  const [gsmMin, setGsmMin] = useState<string>('');
  const [gsmMax, setGsmMax] = useState<string>('');
  const [isSustainableOnly, setIsSustainableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<'catalog' | 'trends'>('catalog');
  const [selected3DProduct, setSelected3DProduct] = useState<Product | null>(null);

  // Voice Search Hook
  const {
    isListening: isVoiceSearching,
    transcript,
    volumeLevel,
    errorMsg,
    stopListening: stopVoiceSearch,
    toggleListening: toggleVoiceSearch,
  } = useVoiceInput({
    onTranscript: (text) => setSearchQuery(text),
  });

  // Active Card Color Swatch State
  const [activeCardColors, setActiveCardColors] = useState<Record<string, { name: string; hex: string }>>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync props initialSearchQuery and initialCategoryId when they change from parent App
  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategoryId);
  }, [initialCategoryId]);

  const fetchProducts = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (skuQuery) params.append('sku', skuQuery.trim());
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedFabricType && selectedFabricType !== 'all') params.append('fabricType', selectedFabricType);
    if (gsmMin) params.append('gsmMin', gsmMin);
    if (gsmMax) params.append('gsmMax', gsmMax);
    if (isSustainableOnly) params.append('sustainable', 'true');
    if (sortBy) params.append('sort', sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((err) => console.error('Error fetching products:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedFabricType, isSustainableOnly, sortBy, skuQuery, gsmMin, gsmMax]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSkuQuery('');
    setSelectedCategory('all');
    setSelectedFabricType('all');
    setGsmMin('');
    setGsmMax('');
    setIsSustainableOnly(false);
    setSortBy('popularity');
    if (onCategoryChange) onCategoryChange('all');
    if (onSearchChange) onSearchChange('');
  };

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Pagination calculation
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasActiveFilters = Boolean(
    searchQuery ||
      skuQuery ||
      (selectedCategory && selectedCategory !== 'all') ||
      (selectedFabricType && selectedFabricType !== 'all') ||
      gsmMin ||
      gsmMax ||
      isSustainableOnly
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* 3D Fabric Modal */}
      {selected3DProduct && (
        <Fabric3DModal
          product={selected3DProduct}
          isOpen={!!selected3DProduct}
          onClose={() => setSelected3DProduct(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP BAR / PAGE TITLE & VIEW SWITCHER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => setActiveMarketplaceTab('catalog')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    activeMarketplaceTab === 'catalog'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Fabric Catalog</span>
                </button>
                <button
                  onClick={() => setActiveMarketplaceTab('trends')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    activeMarketplaceTab === 'trends'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                  <span>Textile Trends</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded-full font-mono">
                    AI Summary
                  </span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {activeMarketplaceTab === 'catalog' ? 'Discover & Source Fabrics' : '2026 Global Textile Trends & Material Insights'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeMarketplaceTab === 'catalog' ? (
                <>Showing <span className="font-bold text-slate-800 dark:text-slate-200">{products.length}</span> verified textile listings</>
              ) : (
                <>Hugging Face AI summarized industry reports, fiber chemistry breakthroughs & circular sourcing forecasts</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input with Voice Search Option */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isVoiceSearching ? "Listening... Speak fabric name..." : "Search by keyword, SKU, or mill..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-10 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 w-52 sm:w-64 transition-all ${
                  isVoiceSearching ? 'border-rose-500 ring-2 ring-rose-400/40 bg-rose-50/10' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${
                  isVoiceSearching
                    ? 'bg-rose-600 text-white shadow-lg ring-4 ring-rose-400/50 animate-pulse'
                    : 'text-slate-400 hover:text-blue-600'
                }`}
                title={isVoiceSearching ? "Stop Voice Search" : "Voice Search Products"}
              >
                {isVoiceSearching && (
                  <span className="absolute -inset-1 rounded-full bg-rose-500 opacity-75 animate-ping pointer-events-none"></span>
                )}
                {isVoiceSearching ? (
                  <MicOff className="w-3.5 h-3.5 text-white relative z-10" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            </form>

            {activeMarketplaceTab === 'catalog' && (
              <>
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="popularity">Sort by Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>

                {/* Grid / List View Toggle */}
                <div className="hidden sm:flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Filter Toggle Button */}
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="md:hidden bg-slate-200 dark:bg-slate-800 p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Voice Search Visualizer Indicator */}
        <VoiceInputVisualizer
          isListening={isVoiceSearching}
          volumeLevel={volumeLevel}
          transcript={transcript || searchQuery}
          errorMsg={errorMsg}
          onStop={stopVoiceSearch}
          onSelectPreset={(preset) => {
            setSearchQuery(preset);
            stopVoiceSearch();
          }}
          title="Voice Search Catalog"
        />

        {/* CONDITIONALLY RENDER TRENDS VIEW OR CATALOG GRID */}
        {activeMarketplaceTab === 'trends' ? (
          <div className="animate-fadeIn">
            <TextileTrendsSection onSelectProduct={onSelectProduct} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* CATEGORY FILTER PILLS BAR */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  if (onCategoryChange) onCategoryChange('all');
                  if (onSearchChange) onSearchChange('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  (selectedCategory === 'all' || !selectedCategory) && !searchQuery
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                All Fabrics
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                    if (onCategoryChange) onCategoryChange(cat.id);
                    if (onSearchChange) onSearchChange('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* MAIN LAYOUT: SIDEBAR + PRODUCT LIST */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden md:block space-y-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filter Fabrics</span>
              </h3>
              <button
                onClick={clearFilters}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Filter 1: Product SKU Search */}
            <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-blue-600" />
                  <span>Product SKU</span>
                </span>
                {skuQuery && (
                  <button
                    onClick={() => setSkuQuery('')}
                    className="text-[10px] text-rose-500 font-semibold hover:underline"
                  >
                    Clear
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. LCS-2024-99, HWC..."
                  value={skuQuery}
                  onChange={(e) => setSkuQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {skuQuery ? (
                  <button
                    onClick={() => setSkuQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Tag className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400">Locate textiles by exact manufacturer identifier.</p>
              
              {/* Preset SKU Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {['LCS', 'HWC', '2024'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSkuQuery(chip)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-all ${
                      skuQuery.toLowerCase() === chip.toLowerCase()
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    #{chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 2: Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategory(val);
                  if (onCategoryChange) onCategoryChange(val);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Fabric Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Fabric Material / Type
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                {['All', 'Cotton', 'Silk', 'Linen', 'Denim', 'Wool', 'Polyester', 'Synthetic'].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    <input
                      type="radio"
                      name="fabricType"
                      checked={selectedFabricType.toLowerCase() === type.toLowerCase()}
                      onChange={() => setSelectedFabricType(type === 'All' ? 'all' : type)}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 4: Weight (GSM Range) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Fabric Weight (GSM)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Min GSM</span>
                  <input
                    type="number"
                    placeholder="80"
                    value={gsmMin}
                    onChange={(e) => setGsmMin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Max GSM</span>
                  <input
                    type="number"
                    placeholder="450"
                    value={gsmMax}
                    onChange={(e) => setGsmMax(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              <button
                onClick={fetchProducts}
                className="w-full mt-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-1.5 rounded-lg text-xs hover:bg-slate-200"
              >
                Apply GSM Filter
              </button>
            </div>

            {/* Filter 5: Sustainable & Organic Checkbox */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isSustainableOnly}
                  onChange={(e) => setIsSustainableOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Organic & GOTS Certified Only</span>
              </label>
            </div>
          </aside>

          {/* PRODUCT RESULTS CONTENT */}
          <main className="md:col-span-3 space-y-6">
            {/* Active Filters Tag Bar */}
            {hasActiveFilters && (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold text-[11px] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Active Filters:
                </span>
                
                {skuQuery && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 font-medium">
                    <Barcode className="w-3.5 h-3.5" />
                    <span>SKU: {skuQuery}</span>
                    <button onClick={() => setSkuQuery('')} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCategory && selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                    <span>Category: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedFabricType && selectedFabricType !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                    <span>Material: {selectedFabricType}</span>
                    <button onClick={() => setSelectedFabricType('all')} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {isSustainableOnly && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 font-medium">
                    <span>Organic Only</span>
                    <button onClick={() => setIsSustainableOnly(false)} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearFilters}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-[11px] ml-auto flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>
            )}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3 animate-pulse border border-slate-200 dark:border-slate-800">
                    <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">No matching fabrics found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing your GSM filters or search query to browse available textile listings.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xl transition-all flex flex-col group"
                  >
                    {/* Thumbnail with Hover Secondary View */}
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onSelectProduct(prod)}>
                      <img
                        src={prod.galleryImages?.[0]?.thumbnailUrl || prod.images[0]}
                        alt={prod.galleryImages?.[0]?.altText || prod.name}
                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                        loading="lazy"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop&q=80';
                        }}
                      />
                      {/* Secondary Folded/Macro Angle Preview on Hover */}
                      <img
                        src={prod.galleryImages?.[1]?.thumbnailUrl || prod.images[1] || prod.images[0]}
                        alt={`${prod.name} secondary view`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      {/* Color Blend Overlay when swatch clicked */}
                      {activeCardColors[prod.id] && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-colors duration-500 mix-blend-color opacity-50"
                          style={{ backgroundColor: activeCardColors[prod.id].hex }}
                        />
                      )}

                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
                        {prod.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => toggleWishlist(prod)}
                        className="absolute top-2.5 right-2.5 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-xs text-slate-600 hover:text-red-500 transition-colors z-10"
                      >
                        <Heart
                          className={`w-4 h-4 ${isInWishlist(prod.id) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span
                            className={`font-mono transition-all ${
                              skuQuery && prod.sku.toLowerCase().includes(skuQuery.toLowerCase())
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-800'
                                : ''
                            }`}
                          >
                            SKU: {prod.sku}
                          </span>
                          <span className="text-blue-600 font-semibold">{prod.supplierName}</span>
                        </div>
                        <h3
                          onClick={() => onSelectProduct(prod)}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
                        >
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {prod.composition} • {prod.gsm} GSM • {prod.widthCm}cm
                        </p>

                        {/* Interactive Color Swatch Dots */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {prod.colors.map((col, idx) => {
                            const isSelected = activeCardColors[prod.id]?.name === col.name;
                            return (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCardColors(prev => ({ ...prev, [prod.id]: col }));
                                }}
                                style={{ backgroundColor: col.hex }}
                                className={`w-4 h-4 rounded-full border transition-all ${
                                  isSelected
                                    ? 'ring-2 ring-blue-600 dark:ring-blue-400 scale-125 z-10'
                                    : 'border-slate-300 dark:border-slate-700 hover:scale-110'
                                }`}
                                title={`Click to preview ${col.name} colorway`}
                              />
                            );
                          })}
                          {activeCardColors[prod.id] && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 ml-1">
                              {activeCardColors[prod.id].name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                            ${prod.pricePerMeter.toFixed(2)}
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
                            <span>3D</span>
                          </button>
                          <button
                            onClick={() => onSelectProduct(prod)}
                            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg"
                            title="Inspect Technical Specs"
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
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-4">
                {paginatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                            {prod.categoryName}
                          </span>
                          <span
                            className={`text-[10px] font-mono transition-all ${
                              skuQuery && prod.sku.toLowerCase().includes(skuQuery.toLowerCase())
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-800'
                                : 'text-slate-400'
                            }`}
                          >
                            SKU: {prod.sku}
                          </span>
                        </div>
                        <h3
                          onClick={() => onSelectProduct(prod)}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer"
                        >
                          {prod.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {prod.composition} | {prod.gsm} GSM | Width {prod.widthCm}cm
                        </p>
                        <p className="text-[11px] text-slate-400">Supplier: {prod.supplierName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className="text-base font-extrabold text-blue-600">${prod.pricePerMeter}/m</p>
                        <p className="text-[10px] text-slate-400">MOQ: {prod.moq}m</p>
                      </div>
                      <button
                        onClick={() => addToCart(prod)}
                        className="bg-[#131b2e] dark:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-slate-500 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
        </div>
        )}

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 h-full p-5 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Filter Fabrics</span>
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SKU Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-blue-600" />
                    <span>Product SKU</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. LCS-2024-99..."
                    value={skuQuery}
                    onChange={(e) => setSkuQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-800 dark:text-slate-200"
                  />
                  {skuQuery && (
                    <button
                      onClick={() => setSkuQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabric Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Fabric Type
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
                  {['All', 'Cotton', 'Silk', 'Linen', 'Denim', 'Wool', 'Polyester', 'Synthetic'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mobileFabricType"
                        checked={selectedFabricType.toLowerCase() === type.toLowerCase()}
                        onChange={() => setSelectedFabricType(type === 'All' ? 'all' : type)}
                        className="text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sustainable */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={isSustainableOnly}
                  onChange={(e) => setIsSustainableOnly(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Organic & GOTS Certified Only</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
