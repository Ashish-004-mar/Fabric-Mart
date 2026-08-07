import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { VoiceInputVisualizer } from './VoiceInputVisualizer';
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  Bot,
  User,
  LogOut,
  ChevronDown,
  Home,
  Store,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sliders,
  Mic,
  MicOff,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAIAssistant: () => void;
  openCopilot?: () => void;
  onSearch?: (query: string) => void;
  isAIAssistantOpen?: boolean;
  isCopilotOpen?: boolean;
  closeAIAssistants?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAIAssistant,
  openCopilot,
  onSearch,
  isAIAssistantOpen = false,
  isCopilotOpen = false,
  closeAIAssistants,
}) => {
  const { user, role, switchRole, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItemCount = cart.length;
  const isAdmin = user?.role === 'ADMIN' || Boolean(localStorage.getItem('fabric_mart_admin_token'));

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle ESC key press to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Voice Search Hook for Navbar
  const {
    isListening: isVoiceSearching,
    transcript,
    volumeLevel,
    errorMsg,
    stopListening: stopVoiceSearch,
    toggleListening: toggleVoiceSearch,
  } = useVoiceInput({
    onTranscript: (text) => {
      setSearchQuery(text);
      if (onSearch && text) {
        onSearch(text);
        setCurrentTab('marketplace');
      }
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeAIAssistants?.();
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
    setCurrentTab('marketplace');
    setMobileMenuOpen(false);
  };

  const handleNavClick = (tabName: string) => {
    closeAIAssistants?.();
    setCurrentTab(tabName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/90 dark:bg-[#0b1c30]/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handleNavClick('home')}
              className="font-bold text-xl text-[#0b1c30] dark:text-white flex items-center gap-2 tracking-tight hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#131b2e] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                F
              </div>
              <span>Fabric Mart</span>
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleNavClick('marketplace')}
                className={`font-medium text-sm transition-colors pb-1 border-b-2 cursor-pointer ${
                  currentTab === 'marketplace'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600'
                }`}
              >
                Marketplace
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    handleNavClick('auth');
                  } else {
                    handleNavClick(user.role === 'SUPPLIER' ? 'supplier-dashboard' : 'buyer-dashboard');
                  }
                }}
                className={`font-medium text-sm transition-colors pb-1 border-b-2 cursor-pointer ${
                  currentTab.includes('dashboard')
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600'
                }`}
              >
                {user?.role === 'SUPPLIER' ? 'Supplier Hub' : 'Dashboard'}
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`font-medium text-sm transition-colors flex items-center gap-1 pb-1 border-b-2 cursor-pointer ${
                    currentTab === 'admin' || currentTab === 'admin-login'
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600'
                  }`}
                  title="Admin Control Panel"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>
          </div>

          {/* Search Bar & Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {currentTab !== 'home' && currentTab !== 'marketplace' && currentTab !== 'auth' && (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isVoiceSearching ? "Listening..." : "Search fabrics, suppliers..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 w-60 transition-all"
                />
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${
                    isVoiceSearching
                      ? 'bg-rose-600 text-white ring-4 ring-rose-400/50 animate-pulse'
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
                {isVoiceSearching && (
                  <div className="absolute top-12 right-0 z-50 w-80">
                    <VoiceInputVisualizer
                      isListening={isVoiceSearching}
                      volumeLevel={volumeLevel}
                      transcript={transcript || searchQuery}
                      errorMsg={errorMsg}
                      onStop={stopVoiceSearch}
                      onSelectPreset={(preset) => {
                        setSearchQuery(preset);
                        if (onSearch) onSearch(preset);
                        setCurrentTab('marketplace');
                        stopVoiceSearch();
                      }}
                      title="Voice Search Products"
                    />
                  </div>
                )}
              </form>
            )}

            {/* Wishlist Icon Button */}
            <button
              onClick={() => {
                closeAIAssistants?.();
                setIsWishlistOpen(true);
              }}
              className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Saved Fabric Wishlist"
              aria-label="View Saved Fabric Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {wishlist.length > 99 ? '99+' : wishlist.length}
                </span>
              )}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => {
                closeAIAssistants?.();
                openAIAssistant();
              }}
              className="relative px-5 py-2 flex items-center justify-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 border border-blue-200/60 dark:border-blue-800/60 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 group cursor-pointer"
              title="Fabric Genius (AI Sales Consultant)"
              aria-label="Open Fabric Genius"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-sm bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-wide">
                  Fabric Genius
                </span>
              </div>
            </button>

            {/* Cart Icon Button */}
            {role === 'BUYER' && (
              <button
                onClick={() => handleNavClick('cart')}
                className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
                  currentTab === 'cart'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Shopping Cart Page"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=38bdf8&bold=true&size=300`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                      <p className="text-[10px] text-blue-600 font-medium mt-0.5">{user.companyName}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleNavClick(role === 'SUPPLIER' ? 'supplier-dashboard' : 'buyer-dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      Dashboard & Profile
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        Admin Control Panel
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleNavClick(role === 'SUPPLIER' ? 'onboarding-supplier' : 'onboarding-buyer');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      Onboarding Wizard
                    </button>

                    

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          closeAIAssistants?.();
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('auth')}
                className="bg-[#131b2e] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Header Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => {
                closeAIAssistants?.();
                openAIAssistant();
              }}
              aria-label="Open Fabric Genius"
              className="px-3 py-1.5 flex items-center justify-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 active:from-blue-600/20 active:to-purple-600/20 border border-blue-200/50 dark:border-blue-800/50 rounded-full transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-xs bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent tracking-wide">Genius</span>
              </div>
            </button>
            <button
              onClick={() => {
                closeAIAssistants?.();
                setIsWishlistOpen(true);
              }}
              aria-label="View Saved Fabrics Wishlist"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 dark:text-slate-200 relative rounded-xl active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white font-bold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length > 99 ? '99+' : wishlist.length}
                </span>
              )}
            </button>
            {role === 'BUYER' && (
              <button
                onClick={() => handleNavClick('cart')}
                aria-label="View Shopping Cart"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 dark:text-slate-200 relative rounded-xl active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-blue-600 text-white font-bold text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open full-screen mobile menu"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-800 dark:text-slate-100 rounded-xl active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN SLIDE-IN MOBILE NAVIGATION MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Slide-in Full Height Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full min-h-screen shadow-2xl flex flex-col z-10 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Drawer"
            >
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#131b2e] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    F
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                      Fabric Mart
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Textile Sourcing Network</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="p-5 space-y-6 flex-1">
                {/* User Info / Role Switcher Card */}
                {user ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/40"
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
                          {user.companyName}
                        </p>
                      </div>
                    </div>

                    
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Sign in to manage purchase orders, access wholesale pricing, and collaborate with mills.
                    </p>
                    <button
                      onClick={() => handleNavClick('auth')}
                      className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Sign In / Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Mobile Search Form */}
                {currentTab !== 'auth' && (
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search fabric types, specs, mills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full min-h-[48px] pl-11 pr-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </form>
                )}

                {/* Navigation Links with Spacious Touch Targets */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1">
                    Navigation Menu
                  </p>

                  <button
                    onClick={() => handleNavClick('home')}
                    className={`w-full min-h-[52px] px-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all ${
                      currentTab === 'home'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800">
                        <Home className="w-5 h-5" />
                      </div>
                      <span>Home Page</span>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleNavClick('marketplace')}
                    className={`w-full min-h-[52px] px-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all ${
                      currentTab === 'marketplace'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800">
                        <Store className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>Marketplace Discovery</span>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 opacity-60" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => handleNavClick('admin')}
                      className={`w-full min-h-[52px] px-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all cursor-pointer ${
                        currentTab === 'admin' || currentTab === 'admin-login'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span>Admin Control Panel</span>
                      </div>
                      <ChevronDown className="w-4 h-4 -rotate-90 opacity-60" />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleNavClick(role === 'SUPPLIER' ? 'supplier-dashboard' : 'buyer-dashboard')
                    }
                    className={`w-full min-h-[52px] px-4 rounded-2xl font-bold text-sm flex items-center justify-between transition-all cursor-pointer ${
                      currentTab.includes('dashboard')
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800">
                        <LayoutDashboard className="w-5 h-5" />
                      </div>
                      <span>{role === 'SUPPLIER' ? 'Supplier Hub Dashboard' : 'Buyer Sourcing Dashboard'}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 -rotate-90 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      closeAIAssistants?.();
                      setMobileMenuOpen(false);
                      setIsWishlistOpen(true);
                    }}
                    className="w-full min-h-[52px] px-4 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                        <Heart className="w-5 h-5 fill-rose-500/20" />
                      </div>
                      <span>Saved Fabric Wishlist</span>
                    </div>
                    {wishlist.length > 0 ? (
                      <span className="bg-rose-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                        {wishlist.length} saved
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Empty</span>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleNavClick(role === 'SUPPLIER' ? 'onboarding-supplier' : 'onboarding-buyer')
                    }
                    className="w-full min-h-[52px] px-4 rounded-2xl font-medium text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3"
                  >
                    <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Relaunch Onboarding Wizard</span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              {user && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 mt-auto">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full min-h-[48px] px-4 rounded-2xl font-bold text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

