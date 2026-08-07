import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Layers,
  ShoppingBag,
  Bot,
  Bell,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminBuyersTab } from './AdminBuyersTab';
import { AdminSuppliersTab } from './AdminSuppliersTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminAISettingsTab } from './AdminAISettingsTab';
import { AdminNotificationsTab } from './AdminNotificationsTab';
import { AdminContentTab } from './AdminContentTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminMediaTab } from './AdminMediaTab';

interface AdminLayoutProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onExitAdmin: () => void;
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onExitAdmin,
  children,
}) => {
  const { user, logout } = useAuth();
  const [internalTab, setInternalTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const activeTab = propActiveTab || internalTab;
  const setActiveTab = propSetActiveTab || setInternalTab;

  const handleAdminLogout = () => {
    localStorage.removeItem('fabric_mart_admin_token');
    logout();
    onExitAdmin();
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'buyers', label: 'Buyer Management', icon: Users },
    { id: 'suppliers', label: 'Supplier Approvals', icon: Building2 },
    { id: 'products', label: 'Product Moderation', icon: Package },
    { id: 'media', label: 'Media & Cloudinary CDN', icon: Cloud },
    { id: 'categories', label: 'Categories Catalog', icon: Layers },
    { id: 'orders', label: 'Marketplace Orders', icon: ShoppingBag },
    { id: 'ai-settings', label: 'AI Copilot & Logs', icon: Bot },
    { id: 'notifications', label: 'Broadcast Center', icon: Bell },
    { id: 'content', label: 'CMS & Storefront', icon: FileText },
    { id: 'settings', label: 'System Configuration', icon: Settings },
  ];

  const renderActiveTabContent = () => {
    if (children) return children;

    switch (activeTab) {
      case 'overview':
        return <AdminOverviewTab onNavigateTab={(t) => setActiveTab(t)} />;
      case 'buyers':
        return <AdminBuyersTab />;
      case 'suppliers':
        return <AdminSuppliersTab />;
      case 'products':
        return <AdminProductsTab />;
      case 'media':
        return <AdminMediaTab products={products} onRefreshProducts={fetchProducts} />;
      case 'categories':
        return <AdminCategoriesTab />;
      case 'orders':
        return <AdminOrdersTab />;
      case 'ai-settings':
        return <AdminAISettingsTab />;
      case 'notifications':
        return <AdminNotificationsTab />;
      case 'content':
        return <AdminContentTab />;
      case 'settings':
        return <AdminSettingsTab />;
      default:
        return <AdminOverviewTab onNavigateTab={(t) => setActiveTab(t)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                Fabric Mart <span className="bg-blue-600/30 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-widest">Admin</span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">Control Panel & System Administration</p>
            </div>
          </div>
        </div>

        {/* Quick Info & User Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>JWT Session Active</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono">admin@fabricmart.com</span>
          </div>

          <button
            onClick={handleAdminLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Return to Fabric Mart Storefront"
          >
            <span>Exit Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-3 mb-2">Navigation Modules</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-900 space-y-3">
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Assistant Health</span>
              </div>
              <p className="text-[11px] text-slate-400">Hugging Face API connected & catalog grounded.</p>
            </div>

            <button
              onClick={handleAdminLogout}
              className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/50">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {renderActiveTabContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
