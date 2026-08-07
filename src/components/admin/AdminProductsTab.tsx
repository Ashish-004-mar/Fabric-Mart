import React, { useEffect, useState } from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Star,
  TrendingUp,
  Trash2,
  Eye,
  Search,
  Filter,
  AlertCircle,
  Tag,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

export const AdminProductsTab: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string, isApproved: boolean) => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/products/${productId}/toggle-featured`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTrending = async (productId: string) => {
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/products/${productId}/toggle-trending`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this fabric product listing?')) return;
    try {
      const token = localStorage.getItem('fabric_mart_admin_token') || 'admin-jwt-token-user-admin-1';
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchesApproval =
      approvalFilter === 'ALL'
        ? true
        : approvalFilter === 'APPROVED'
        ? p.isApproved
        : approvalFilter === 'PENDING'
        ? !p.isApproved
        : approvalFilter === 'FEATURED'
        ? p.isFeatured
        : approvalFilter === 'TRENDING'
        ? p.isTrending
        : true;

    return matchesSearch && matchesApproval;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" /> Fabric Product Moderation & Curation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review new fabric listings, approve eco-certifications, and curate featured marketplace products.
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by fabric name, SKU, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48"
          >
            <option value="ALL">All Products</option>
            <option value="APPROVED">Approved Products</option>
            <option value="PENDING">Pending Moderation</option>
            <option value="FEATURED">Featured Products</option>
            <option value="TRENDING">Trending Fabrics</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Fabric & SKU</th>
                <th className="px-5 py-3.5">Supplier Mill</th>
                <th className="px-5 py-3.5">Price & Stock</th>
                <th className="px-5 py-3.5">Badges & Flags</th>
                <th className="px-5 py-3.5">Approval</th>
                <th className="px-5 py-3.5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading catalog items...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No products found matching criteria.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=100&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{product.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-200">{product.supplierName}</p>
                      <p className="text-[10px] text-slate-500">{product.categoryName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-emerald-400">${product.pricePerMeter} / m</p>
                      <p className={`text-[10px] font-mono ${product.stockQuantity < 200 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        {product.stockQuantity} m in stock
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleFeatured(product.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            product.isFeatured ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-600'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-3.5 h-3.5 ${product.isFeatured ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleToggleTrending(product.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            product.isTrending ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-900 text-slate-600'
                          }`}
                          title="Toggle Trending"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          product.isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}
                      >
                        {product.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="View Product Specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!product.isApproved ? (
                          <button
                            onClick={() => handleApproveProduct(product.id, true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveProduct(product.id, false)}
                            className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 font-semibold text-[10px] rounded-lg transition-colors border border-amber-800 flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative text-slate-200 shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <img
                src={selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=100&auto=format&fit=crop&q=80'}
                alt={selectedProduct.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-800"
              />
              <div>
                <h3 className="text-base font-bold text-white">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-400">{selectedProduct.supplierName}</p>
                <p className="text-xs font-mono text-blue-400 mt-0.5">SKU: {selectedProduct.sku}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">{selectedProduct.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Composition</span>
                  <span className="font-semibold text-slate-200">{selectedProduct.composition}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">GSM (Weight)</span>
                  <span className="font-semibold text-slate-200">{selectedProduct.gsm} gsm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Price / Meter</span>
                  <span className="font-bold text-emerald-400">${selectedProduct.pricePerMeter}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Minimum Order (MOQ)</span>
                  <span className="font-semibold text-slate-200">{selectedProduct.moq} meters</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
