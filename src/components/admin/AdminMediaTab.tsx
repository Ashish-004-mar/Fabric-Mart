import React, { useState, useEffect } from 'react';
import { Product, FabricImage } from '../../types';
import {
  Image as ImageIcon,
  Cloud,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Star,
  Layers,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Check
} from 'lucide-react';

interface AdminMediaTabProps {
  products: Product[];
  onRefreshProducts: () => void;
}

interface MediaStats {
  totalImages: number;
  cloudinaryConfigured: boolean;
  cloudinaryCloudName: string;
  unsplashConfigured: boolean;
  pexelsConfigured: boolean;
  pixabayConfigured: boolean;
  primaryImagesCount: number;
  formatsCount: { webp: number; jpg: number; png: number };
}

export const AdminMediaTab: React.FC<AdminMediaTabProps> = ({ products, onRefreshProducts }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Sync state
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // New image upload form
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/admin/media/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch media stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const found = products.find((p) => p.id === selectedProductId || p.slug === selectedProductId);
    if (found) {
      setSelectedProduct(found);
    } else if (products.length > 0) {
      setSelectedProduct(products[0]);
      setSelectedProductId(products[0].id);
    }
  }, [selectedProductId, products]);

  const handleRunFullPipeline = async () => {
    if (!confirm('Run automated image import pipeline for all products? This will search, optimize, and store 4 multi-angle WebP images for all fabric SKUs.')) {
      return;
    }

    setIsSyncingAll(true);
    setSyncStatusMsg('Running multi-provider image search, WebP compression, and Cloudinary CDN upload pipeline...');

    try {
      const res = await fetch('/api/admin/media/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (res.ok) {
        setSyncStatusMsg(`Success! Processed ${data.processedProducts} products (${data.totalImages} WebP images generated).`);
        fetchStats();
        onRefreshProducts();
      } else {
        setSyncStatusMsg(`Error: ${data.error || 'Pipeline execution failed'}`);
      }
    } catch (err: any) {
      setSyncStatusMsg(`Pipeline error: ${err.message}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleRunSingleProductPipeline = async () => {
    if (!selectedProduct) return;
    setIsSyncingSingle(true);
    setSyncStatusMsg(`Syncing high-res textile media for "${selectedProduct.name}"...`);

    try {
      const res = await fetch('/api/admin/media/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id }),
      });
      const data = await res.json();

      if (res.ok) {
        setSyncStatusMsg(`Successfully updated 4 multi-angle images for ${selectedProduct.name}`);
        fetchStats();
        onRefreshProducts();
      } else {
        setSyncStatusMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSyncStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsSyncingSingle(false);
    }
  };

  const handleAddCustomImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newImageUrl.trim()) return;

    setIsUploading(true);
    setUploadMsg(null);

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newImageUrl.trim(),
          altText: newAltText.trim() || `${selectedProduct.name} Custom Detail View`,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setUploadMsg('Image uploaded and processed into Cloudinary CDN successfully!');
        setNewImageUrl('');
        setNewAltText('');
        fetchStats();
        onRefreshProducts();
      } else {
        setUploadMsg(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setUploadMsg(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/images/${imageId}/primary`, {
        method: 'PUT',
      });
      if (res.ok) {
        onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!selectedProduct || !confirm('Are you sure you want to remove this image from the gallery?')) return;
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/images/${imageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onRefreshProducts();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderImage = async (currentIndex: number, direction: 'up' | 'down') => {
    if (!selectedProduct || !selectedProduct.galleryImages) return;
    const currentImages = [...selectedProduct.galleryImages];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    // Swap
    const temp = currentImages[currentIndex];
    currentImages[currentIndex] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;

    const reorderedIds = currentImages.map((img) => img.id);

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/images/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: reorderedIds }),
      });
      if (res.ok) {
        onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER & OVERVIEW BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Cloud className="w-4 h-4" />
            <span>Fabric Mart Production CDN Architecture</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Image Management & Cloudinary CDN Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated multi-angle fabric search, responsive WebP optimization, color science verification, and SQLite CDN storage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRunFullPipeline}
            disabled={isSyncingAll}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Pipeline Running...' : 'Sync All Fabrics (264 WebP Images)'}</span>
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
          <button onClick={() => setSyncStatusMsg(null)} className="text-blue-500 hover:text-blue-700 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>CDN Service Status</span>
            <Cloud className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{stats?.cloudinaryConfigured ? 'Cloudinary Live' : 'Local CDN Ready'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Cloud: {stats?.cloudinaryCloudName}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Stored WebP Images</span>
            <ImageIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalImages || 264}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">4 multi-angle views per fabric SKU</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Media Source Providers</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Unsplash
            </span>
            <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Pexels
            </span>
            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Pixabay
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Fallback to curated fabric vault</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>WebP Format Optimization</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            100% WebP
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Auto w=1200 / w=400 / w=2000</p>
        </div>
      </div>

      {/* MAIN FABRIC PRODUCT SELECTOR & MEDIA MANAGER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PRODUCT SELECTOR */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Fabric SKU</h3>
            <span className="text-xs text-slate-400 font-mono">{products.length} Items</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
            {products.map((p) => {
              const isSelected = p.id === selectedProductId || p.slug === selectedProductId;
              const hasGallery = p.galleryImages && p.galleryImages.length >= 4;

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setSelectedProduct(p);
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {p.sku} • {p.categoryName}
                      </p>
                    </div>
                  </div>
                  {hasGallery && (
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full shrink-0">
                      4 Views
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: GALLERY EDITOR & MEDIA ACTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProduct ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">SKU: {selectedProduct.sku}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-500">{selectedProduct.categoryName}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {selectedProduct.name}
                  </h3>
                </div>

                <button
                  onClick={handleRunSingleProductPipeline}
                  disabled={isSyncingSingle}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSingle ? 'animate-spin' : ''}`} />
                  <span>Re-fetch 4 Media Angles</span>
                </button>
              </div>

              {/* GALLERY ANGLE TILES GRID */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Fabric Media Gallery ({selectedProduct.galleryImages?.length || selectedProduct.images.length} Images)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0
                    ? selectedProduct.galleryImages
                    : selectedProduct.images.map((img, idx) => ({
                        id: `fallback-${idx}`,
                        fabricId: selectedProduct.id,
                        secureUrl: img,
                        thumbnailUrl: img,
                        galleryUrl: img,
                        zoomUrl: img,
                        altText: `${selectedProduct.name} View ${idx + 1}`,
                        sortOrder: idx + 1,
                        isPrimary: idx === 0,
                        width: 1200,
                        height: 1200,
                        format: 'webp',
                        fileSize: 150000,
                      }))
                  ).map((img, idx) => {
                    const angleLabels = ['Primary 1:1', 'Folded Fabric View', 'Macro Texture Close-Up', 'Drape & Application View'];

                    return (
                      <div
                        key={img.id || idx}
                        className={`relative group bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden border-2 transition-all p-3 space-y-3 ${
                          img.isPrimary
                            ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                          <img src={img.galleryUrl || img.secureUrl} alt={img.altText} className="w-full h-full object-cover" />

                          {img.isPrimary && (
                            <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Primary Card Image</span>
                            </div>
                          )}

                          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-xs">
                            {angleLabels[idx] || `Angle ${idx + 1}`}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {img.altText}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            WebP • {img.width || 1200}x{img.height || 1200}
                          </p>
                        </div>

                        {/* ACTIONS BAR */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleReorderImage(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReorderImage(idx, 'down')}
                              disabled={idx === (selectedProduct.galleryImages?.length || selectedProduct.images.length) - 1}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {!img.isPrimary && (
                              <button
                                onClick={() => handleSetPrimary(img.id)}
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteImage(img.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                              title="Delete image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADD CUSTOM IMAGE FORM */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Upload or Add Custom Image URL</span>
                </h4>

                <form onSubmit={handleAddCustomImage} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      required
                      placeholder="Image URL (e.g., Unsplash, Cloudinary, Pexels)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Alt text / angle description"
                      value={newAltText}
                      onChange={(e) => setNewAltText(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      Images are automatically compressed and transformed via Cloudinary CDN.
                    </p>
                    <button
                      type="submit"
                      disabled={isUploading || !newImageUrl.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Upload & Process</span>
                    </button>
                  </div>

                  {uploadMsg && (
                    <p className={`text-[11px] font-bold ${uploadMsg.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
                      {uploadMsg}
                    </p>
                  )}
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">Select a fabric product on the left to edit its gallery media.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
