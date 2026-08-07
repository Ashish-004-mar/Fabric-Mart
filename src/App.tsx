import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { FabricMartCopilotModal } from './components/FabricMartCopilotModal';
import { Agent3DCanvas } from './components/3dFabric/Agent3DCanvas';
import { FAQPage } from "./pages/FAQPage";
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { SupplierDashboardPage } from './pages/SupplierDashboardPage';
import { BuyerOnboardingPage } from './pages/BuyerOnboardingPage';
import { SupplierOnboardingPage } from './pages/SupplierOnboardingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { CartPage } from './pages/CartPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginView } from './components/admin/AdminLoginView';

import { Category, Product, SupplierProfile } from './types';
import { Headset, BotMessageSquare, Mic, Sparkles } from 'lucide-react';

function AppContent() {
  const { user, logout } = useAuth();

  const handleExitAdmin = () => {
    localStorage.removeItem('fabric_mart_admin_token');
    logout();
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);

  // Navigation / Selection State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Assistant & Voice Copilot States
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const handleOpenAIAssistant = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsCopilotOpen(false);
    setIsAIAssistantOpen((prev) => !prev);
  };

  const handleOpenCopilot = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAIAssistantOpen(false);
    setIsCopilotOpen((prev) => !prev);
  };

  const handleCloseAIAssistants = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAIAssistantOpen(false);
    setIsCopilotOpen(false);
  };

  const { toastMessage } = useCart();

  useEffect(() => {
    // Automatically close AI drawers when navigating between pages
    handleCloseAIAssistants();
  }, [currentTab]);

  useEffect(() => {
    const handleRequireAuth = () => {
      setCurrentTab('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('require-auth', handleRequireAuth);

    // Fetch categories and initial trending products
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => d.categories && setCategories(d.categories))
      .catch((e) => console.error(e));

    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => d.products && setTrendingProducts(d.products))
      .catch((e) => console.error(e));

    fetch('/api/suppliers/apex-textiles')
      .then((r) => r.json())
      .then((d) => d.supplier && setSuppliers([d.supplier]))
      .catch(() => {});

    return () => {
      window.removeEventListener('require-auth', handleRequireAuth);
    };
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    // Fetch full details + similar products
    fetch(`/api/products/${product.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product) setSelectedProduct(d.product);
        if (d.similarProducts) setSimilarProducts(d.similarProducts);
      })
      .catch(() => {});
    setCurrentTab('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateMarketplace = (query?: string, categoryId?: string) => {
    if (query !== undefined && query.trim() !== '') {
      setSearchQuery(query);
    } else {
      setSearchQuery('');
    }

    if (categoryId !== undefined && categoryId !== '') {
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategoryId('all');
    }

    setCurrentTab('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Real-Time Toast Notification System */}
      <ToastContainer />

      {/* Cart Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-40 bg-[#131b2e] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          handleCloseAIAssistants();
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openAIAssistant={handleOpenAIAssistant}
        openCopilot={handleOpenCopilot}
        isAIAssistantOpen={isAIAssistantOpen}
        isCopilotOpen={isCopilotOpen}
        closeAIAssistants={handleCloseAIAssistants}
        onSearch={(q) => {
          handleCloseAIAssistants();
          handleNavigateMarketplace(q);
        }}
      />

      {/* Dynamic View Body */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            categories={categories}
            trendingProducts={trendingProducts}
            suppliers={suppliers}
            onNavigateMarketplace={handleNavigateMarketplace}
            onSelectProduct={handleSelectProduct}
            onSelectSupplier={() => handleNavigateMarketplace()}
            openAIAssistant={handleOpenAIAssistant}
            openCopilot={handleOpenCopilot}
          />
        )}

        {currentTab === 'marketplace' && (
          <MarketplacePage
            categories={categories}
            initialSearchQuery={searchQuery}
            initialCategoryId={selectedCategoryId}
            onCategoryChange={(catId) => setSelectedCategoryId(catId)}
            onSearchChange={(q) => setSearchQuery(q)}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentTab === 'product-details' && selectedProduct && (
          <ProductDetailsPage
            product={selectedProduct}
            similarProducts={similarProducts}
            onSelectProduct={handleSelectProduct}
            onNavigateMarketplace={() => setCurrentTab('marketplace')}
            openAIAssistant={handleOpenAIAssistant}
          />
        )}

        {currentTab === 'buyer-dashboard' && (
          !user ? (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b1c30]">
              <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Buyer Sign-In Required</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Please sign in or register as an Apparel Buyer to view your active purchase orders, saved fabric swatches, and spending analytics.
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('auth')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl transition-colors shadow-md"
                  >
                    Sign In as Buyer
                  </button>
                  <button
                    onClick={() => setCurrentTab('marketplace')}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-xl transition-colors"
                  >
                    Browse Fabric Marketplace
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <BuyerDashboardPage
              onSelectProduct={handleSelectProduct}
              onNavigateMarketplace={() => setCurrentTab('marketplace')}
            />
          )
        )}

        {currentTab === 'supplier-dashboard' && (
          !user ? (
            <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b1c30]">
              <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Mill / Supplier Portal Sign-In</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Please sign in or register as a Textile Supplier / Mill Partner to manage your live fabric listings, stock inventory, and RFQs.
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setCurrentTab('auth')}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3.5 rounded-xl transition-colors shadow-md"
                  >
                    Sign In as Mill Partner
                  </button>
                  <button
                    onClick={() => setCurrentTab('marketplace')}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-3 rounded-xl transition-colors"
                  >
                    Browse Fabric Marketplace
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <SupplierDashboardPage />
          )
        )}

        {currentTab === 'onboarding-buyer' && (
          <BuyerOnboardingPage onComplete={() => setCurrentTab('marketplace')} />
        )}

        {currentTab === 'onboarding-supplier' && (
          <SupplierOnboardingPage onComplete={() => setCurrentTab('supplier-dashboard')} />
        )}

        {currentTab === 'cart' && (
          <CartPage
            onNavigateMarketplace={() => setCurrentTab('marketplace')}
            onProceedToCheckout={() => setCurrentTab('checkout')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage onOrderPlaced={() => setCurrentTab('buyer-dashboard')} />
        )}

        {currentTab === 'auth' && <AuthPage onComplete={() => setCurrentTab('marketplace')} />}

        {currentTab === 'admin-login' && (
          <AdminLoginView
            onSuccessLogin={() => setCurrentTab('admin')}
            onExitAdmin={handleExitAdmin}
          />
        )}

        {currentTab === 'admin' && (
          !localStorage.getItem('fabric_mart_admin_token') && user?.role !== 'ADMIN' ? (
            <AdminLoginView
              onSuccessLogin={() => setCurrentTab('admin')}
              onExitAdmin={handleExitAdmin}
            />
          ) : (
            <AdminLayout onExitAdmin={handleExitAdmin} />
          )
        )}
        
        {currentTab === 'faq' && <FAQPage />}
      </div>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => setCurrentTab(tab)}
        onNavigateMarketplace={handleNavigateMarketplace}
      />

      {/* Global Real-Time Toast Notifications Container */}
      <ToastContainer />

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setCurrentTab('checkout')} />

      {/* Global Persistent Wishlist Drawer */}
      <WishlistDrawer
        onSelectProduct={handleSelectProduct}
        onNavigateMarketplace={() => handleNavigateMarketplace()}
      />

      {/* Floating Buttons Container */}
      {!isCopilotOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-4 items-center pointer-events-auto">
          {/* Persistent Floating 3D Animated AI Agent Icon Button */}
          <button
            onClick={handleOpenCopilot}
            className="relative p-1 rounded-full shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-center cursor-pointer"
            title="Open 3D Voice Agent"
          >
            {/* Animated sound wave background rings */}
            <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '3s' }} />
            <span className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            
            <div className="relative z-10 flex items-center justify-center bg-slate-950 rounded-full p-1 border border-blue-500/40">
              <Agent3DCanvas state="idle" size="sm" />
              
              {/* Active status indicator dot */}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_10px_rgb(52,211,153,0.8)] animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* Fabric Mart Voice Copilot Modal */}
      <FabricMartCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onSelectProduct={(p) => {
          setIsCopilotOpen(false);
          handleSelectProduct(p);
        }}
        onNavigate={(tab, query) => {
          if (query !== undefined) {
            handleNavigateMarketplace(query);
          } else {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* Global AI Assistant Drawer (Text Only) */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onSelectProduct={(p) => {
          setIsAIAssistantOpen(false);
          handleSelectProduct(p);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
