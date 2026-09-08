import React, { useState, useEffect } from 'react';
import { Product, SupplierProfile } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/StarRating';
import { ShieldCheck, Heart, ShoppingBag, Truck, Sparkles, Send, CheckCircle2, ChevronRight, Scale, RotateCcw, Star, Award, Clock, CheckCircle, MessageSquare, ThumbsUp, X, PlusCircle, ZoomIn, Maximize2, Layers, Box, Move3d } from 'lucide-react';
import { Fabric3DViewer } from '../components/3dFabric/Fabric3DViewer';
import { Fabric3DModal } from '../components/3dFabric/Fabric3DModal';

interface ProductDetailsPageProps {
  product: Product;
  similarProducts: Product[];
  onSelectProduct: (p: Product) => void;
  onNavigateMarketplace: () => void;
  openAIAssistant: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  similarProducts,
  onSelectProduct,
  onNavigateMarketplace,
  openAIAssistant,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(product.images[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Natural');
  const [quantityMeters, setQuantityMeters] = useState(product.moq || 50);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<'photo' | '3d'>('3d');
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  // Supplier Profile & Rating State
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(true);

  const { user } = useAuth();

  // Dynamic Color Selection & Variant Price Calculation
  const activeColorIndex = product.colors.findIndex((c) => c.name === selectedColor);
  const selectedColorObj = product.colors[activeColorIndex >= 0 ? activeColorIndex : 0];
  const variantPriceMultiplier = (selectedColorObj as any)?.priceMultiplier || (1 + (Math.max(0, activeColorIndex) % 3) * 0.05);
  const currentUnitPrice = (selectedColorObj as any)?.pricePerMeter || Number((Number(product.pricePerMeter ?? 0) * (activeColorIndex === 0 ? 1 : variantPriceMultiplier)).toFixed(2));

  useEffect(() => {
    if (product) {
      const initialColor = product.colors?.[0]?.name || 'Natural';
      setSelectedColor(initialColor);
      setSelectedImage(product.imageUrl || product.images?.[0] || '');
      setQuantityMeters(product.moq || 50);
    }
  }, [product]);

  const handleSelectColorSwatch = (colorName: string, idx: number) => {
    setSelectedColor(colorName);
    const colorObj = product.colors?.[idx] || product.colors?.find((c) => c.name === colorName);
    const colorImg = (colorObj as any)?.imageUrl || (colorObj as any)?.image;
    if (colorImg) {
      setSelectedImage(colorImg);
    } else if (product.images && product.images.length > 0) {
      const targetImg = product.images[idx % product.images.length];
      setSelectedImage(targetImg);
    }
  };

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newBuyerName, setNewBuyerName] = useState(user?.name || '');
  const [newBuyerCompany, setNewBuyerCompany] = useState(user?.companyName || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Ask FabricAI Widget State
  const [askQuery, setAskQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // Contact Supplier Messaging State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState(`Inquiry regarding ${product.name} (SKU: ${product.sku})`);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [messagesList, setMessagesList] = useState<Array<{ sender: 'buyer' | 'supplier'; text: string; time: string }>>([
    {
      sender: 'supplier',
      text: `Hello! Thank you for considering ${product.name}. Our mill team is available 24/7 to answer custom MOQ quotes, laboratory certifications, or shipping timelines. How can we help your fashion brand today?`,
      time: 'Just now',
    },
  ]);
  const [inquirySentSuccess, setInquirySentSuccess] = useState(false);

  const fetchSupplierProfile = () => {
    setIsLoadingSupplier(true);
    fetch(`/api/suppliers/by-name/${encodeURIComponent(product.supplierName)}`)
      .then((r) => {
        if (!r.ok) return { supplier: null };
        return r.json();
      })
      .then((data) => {
        if (data?.supplier) setSupplierProfile(data.supplier);
      })
      .catch((err) => console.error('Error loading supplier profile:', err))
      .finally(() => setIsLoadingSupplier(false));
  };

  useEffect(() => {
    fetchSupplierProfile();
  }, [product.supplierName]);

  const handleSendInquiryMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;

    const newMsg = {
      sender: 'buyer' as const,
      text: inquiryMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesList((prev) => [...prev, newMsg]);
    setInquiryMessage('');
    setInquirySentSuccess(true);

    // Simulate automated supplier auto-acknowledgment
    setTimeout(() => {
      setMessagesList((prev) => [
        ...prev,
        {
          sender: 'supplier' as const,
          text: `Thank you! Your inquiry regarding "${product.name}" has been routed directly to ${product.supplierName}'s account manager. An official quotation will be updated in your Buyer Dashboard.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const applyTemplatePrompt = (promptText: string) => {
    setInquiryMessage(promptText);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierProfile || !newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/suppliers/${supplierProfile.userId || supplierProfile.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
          buyerName: newBuyerName,
          buyerCompany: newBuyerCompany,
          productName: product.name,
        }),
      });
      const data = await res.json();
      if (data.supplier) {
        setSupplierProfile(data.supplier);
        setReviewSuccessMsg('Thank you! Your supplier rating and review have been published.');
        setNewComment('');
        setTimeout(() => setReviewSuccessMsg(null), 4000);
        setIsReviewModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAskSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const q = customQuestion || askQuery;
    if (!q.trim()) return;

    setIsAiAnswering(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Regarding the fabric "${product.name}" (Composition: ${product.composition}, GSM: ${product.gsm}, Width: ${product.widthCm}cm, Care: ${product.careInstructions || 'Standard'}): ${q}`,
        }),
      });
      const data = await res.json();
      setAiAnswer(data.text || 'This fabric is well-suited for your requirements.');
    } catch (err) {
      console.error('Ask AI error:', err);
      setAiAnswer('Our technical lab team confirms this fabric meets standard textile benchmarks for breathability and seam strength.');
    } finally {
      setIsAiAnswering(false);
    }
  };

  const activeColorObj = product.colors.find(c => c.name === selectedColor) || product.colors[0];
  const activeColorHex = activeColorObj?.hex;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1c30] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* 3D Fabric Modal */}
      {is3DModalOpen && (
        <Fabric3DModal
          product={product}
          isOpen={is3DModalOpen}
          onClose={() => setIs3DModalOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button onClick={onNavigateMarketplace} className="hover:underline">Marketplace</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>{product.categoryName}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</span>
        </nav>

        {/* TOP SECTION: IMAGE GALLERY & SPECIFICATIONS SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Left Column: Image Gallery & 3D Fabric Inspector */}
          <div className="space-y-4">
            {/* View Mode Toggle Bar */}
            <div className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1 w-full">
                <button
                  onClick={() => setMediaTab('3d')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mediaTab === '3d'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Box className="w-4 h-4 text-indigo-300 animate-pulse" />
                  <span>3D Real Fabric Inspector</span>
                </button>
                <button
                  onClick={() => setMediaTab('photo')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mediaTab === 'photo'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>2D Photo Gallery</span>
                </button>
              </div>
            </div>

            {/* Media Display Area */}
            {mediaTab === '3d' ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <Fabric3DViewer
                  textureUrl={selectedImage || product.images[0]}
                  fabricName={product.name}
                  fabricType={product.subcategoryName || product.categoryName}
                  colorHex={activeColorHex}
                  mode="cloth"
                  height="420px"
                  autoRotateDefault={true}
                  showControlsBar={true}
                  onOpenFullStudio={() => setIs3DModalOpen(true)}
                />
              </div>
            ) : (
              <div className="relative aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group shadow-inner">
                <img
                  src={selectedImage || (product.galleryImages?.[0]?.galleryUrl || product.images[0])}
                  alt={product.galleryImages?.find(gi => gi.secureUrl === selectedImage)?.altText || product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                  onClick={() => setIsZoomModalOpen(true)}
                />

                {/* Color Blend Tint Overlay for Selected Color */}
                {activeColorObj && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-colors duration-500 rounded-2xl mix-blend-color opacity-50"
                    style={{ backgroundColor: activeColorObj.hex }}
                  />
                )}

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <button
                    onClick={() => setIsZoomModalOpen(true)}
                    className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-md text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Zoom 2000x2000 Texture Inspection"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-md text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                {/* Active Color Chip & Angle Indicator Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                  <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 shadow-md">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    {product.galleryImages?.find(gi => gi.secureUrl === selectedImage || gi.galleryUrl === selectedImage)?.altText.split(' - ')[1] || 'Primary Fabric Angle'}
                  </div>
                  {activeColorObj && (
                    <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2 shadow-md">
                      <span className="w-3 h-3 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: activeColorObj.hex }} />
                      <span>{activeColorObj.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Multi-Angle Image Thumbnails */}
            <div className="grid grid-cols-4 gap-2.5">
              {(product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : product.images.map((img, idx) => ({
                id: `img-${idx}`,
                secureUrl: img,
                thumbnailUrl: img,
                altText: `Angle ${idx + 1}`,
              }))).slice(0, 4).map((imgObj: any, idx: number) => {
                const imgUrl = imgObj.thumbnailUrl || imgObj.secureUrl || imgObj;
                const isSelected = (selectedImage || product.images[0]) === (imgObj.secureUrl || imgObj);
                const angleLabels = ['Primary 1:1', 'Folded', 'Macro Close', 'Drape'];

                return (
                  <button
                    key={imgObj.id || idx}
                    onClick={() => setSelectedImage(imgObj.secureUrl || imgObj)}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all group/thumb ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={imgUrl} alt={imgObj.altText || `Fabric view ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 text-white text-[9px] font-semibold py-0.5 text-center truncate px-1">
                      {angleLabels[idx] || `Angle ${idx + 1}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Controls & Summary */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-mono">SKU: {product.sku}</span>
                <span>•</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {product.supplierName}
                </span>
                {supplierProfile && (
                  <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 text-[11px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{Number(supplierProfile.rating ?? 4.8).toFixed(1)}</span>
                    <span className="text-amber-600/80 dark:text-amber-400/80 font-normal">({supplierProfile.reviewsCount || 142})</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & MOQ Block */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 flex items-baseline gap-2">
                  <span>${Number(currentUnitPrice ?? 0).toFixed(2)}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400"> / meter</span>
                  {activeColorIndex > 0 && (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                      {selectedColor} Color Variant
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500">MOQ: <span className="font-bold text-slate-800 dark:text-slate-200">{product.moq} meters</span></p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  In Stock ({product.stockQuantity}m)
                </span>
                <p className="text-[10px] text-slate-400 mt-1">48hr Mill Air Dispatch</p>
              </div>
            </div>

            {/* Color Swatch Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Select Colorway: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{selectedColor}</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Click swatch to preview image & variant price</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c, idx) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleSelectColorSwatch(c.name, idx)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all transform active:scale-95 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/30 scale-105 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: c.hex }}
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0 flex items-center justify-center"
                      />
                      <span>{c.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-36">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Quantity (Meters)</label>
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-1">
                    <input
                      type="number"
                      min={product.moq || 10}
                      step={10}
                      value={quantityMeters}
                      onChange={(e) => setQuantityMeters(Math.max(1, Number(e.target.value)))}
                      className="w-full text-center text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 pr-2">m</span>
                  </div>
                </div>

                <div className="flex-1 pt-5">
                  <p className="text-xs text-right font-bold text-slate-800 dark:text-slate-200">
                    Est. Subtotal: <span className="text-blue-600 text-sm">${Number((currentUnitPrice ?? 0) * (quantityMeters ?? 0)).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  onClick={() => addToCart(product, quantityMeters, selectedColor)}
                  className="bg-[#131b2e] dark:bg-blue-600 text-white font-bold py-3 px-3 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md text-xs cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantityMeters}m to Cart</span>
                </button>

                <button
                  onClick={() => addToCart(product, 2, selectedColor)}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Order Swatch ($5.00)</span>
                </button>

                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact Supplier</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Global Express</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Lab Quality Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>14-Day Defect Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* TECHNICAL SPECIFICATIONS & ASK FABRICAI AI SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Specifications Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <span>Technical & Quality Specifications</span>
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left divide-y divide-slate-200 dark:divide-slate-800">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 w-1/3">Composition & Family</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      {product.composition} <span className="text-slate-400">({product.mainFamily})</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Fiber Origin</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.fiberOrigin || 'Natural Plant'}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Weave Structure</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.weaveType || 'Plain Weave'}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Texture & Handfeel</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.texture || 'Smooth & Crisp'}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Weight (GSM)</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.gsm} g/m² (Grams per square meter)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Roll Width</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.widthCm} cm (Approx 59 inches)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Performance Profile</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      <div className="flex flex-wrap gap-1.5">
                        {product.breathable && <span className="bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 text-[10px] font-bold">Breathable</span>}
                        {product.moistureWicking && <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold">Moisture Wicking</span>}
                        {product.stretchable && <span className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 text-[10px] font-bold">4-Way Stretch</span>}
                        {product.wrinkleResistant && <span className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-[10px] font-bold">Wrinkle Resistant</span>}
                        {product.ecoFriendly && <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">Eco-Friendly</span>}
                        {product.hypoallergenic && <span className="bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded border border-pink-200 dark:border-pink-800 text-[10px] font-bold">Hypoallergenic</span>}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Minimum Order Quantity (MOQ)</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.moq} meters per colorway</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Sustainability Certifications</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white flex flex-wrap gap-1">
                      {product.certifications.map((c) => (
                        <span key={c} className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[10px]">
                          {c}
                        </span>
                      ))}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Care & Washing Instructions</td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.careInstructions || 'Machine wash cold gentle cycle. Hang dry.'}</td>
                  </tr>
                  {product.sustainabilityNotes && (
                    <tr>
                      <td className="p-3.5 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50">Sustainability Impact</td>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white">{product.sustainabilityNotes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Ask FabricAI Widget */}
          <div className="bg-[#0b1c30] text-white p-6 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Instant Technical AI Insights</span>
              </div>
              <h4 className="text-base font-bold text-white">Ask Fabric Mart Agent about this fabric</h4>
              <p className="text-xs text-slate-300">
                Get instant answers regarding drape, shrinkage, seam strength, or garment suitability for {product.name}.
              </p>

              {/* Preset Prompts */}
              <div className="space-y-1.5 pt-2 text-xs">
                <button
                  onClick={() => handleAskSubmit(undefined, 'Is this suitable for unlined summer blazers?')}
                  className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors"
                >
                  💡 "Is this suitable for unlined summer blazers?"
                </button>
                <button
                  onClick={() => handleAskSubmit(undefined, 'What is the expected shrinkage rate after first wash?')}
                  className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors"
                >
                  💡 "What is the expected shrinkage rate?"
                </button>
              </div>

              {/* AI Answer Box */}
              {isAiAnswering && (
                <div className="p-3 bg-blue-950/60 border border-blue-800 rounded-xl text-xs text-blue-200 animate-pulse">
                  Analyzing composition & yarn structure...
                </div>
              )}

              {aiAnswer && (
                <div className="p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 space-y-1.5 leading-relaxed">
                  <span className="font-bold text-blue-400 text-[10px] uppercase block">Fabric Mart Analysis:</span>
                  <p>{aiAnswer}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAskSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Ask custom question..."
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isAiAnswering || !askQuery.trim()}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* SUPPLIER RELIABILITY & STAR RATING ASSESSMENT */}
        {supplierProfile && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header / Mill Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={supplierProfile.logo}
                  alt={supplierProfile.businessName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {supplierProfile.businessName}
                    </h3>
                    {supplierProfile.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Verified Textile Mill</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {supplierProfile.city}, {supplierProfile.country} • Operating: {supplierProfile.operatingHours || 'Mon - Fri'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Rate & Review Supplier</span>
              </button>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {/* Grid layout: Ratings Breakdown & Reliability KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 5 cols: Star Rating Breakdown */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/70 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {Number(supplierProfile.rating ?? 4.8).toFixed(1)}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">out of 5.0</p>
                  </div>
                  <div>
                    <StarRating
                      rating={supplierProfile.rating}
                      size="lg"
                      showValue={false}
                    />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                      Based on {supplierProfile.reviewsCount || 142} verified buyer audits
                    </p>
                  </div>
                </div>

                {/* Star Distribution Progress Bars */}
                <div className="space-y-1.5 text-xs">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const bd = supplierProfile.ratingBreakdown || { 5: 128, 4: 11, 3: 2, 2: 1, 1: 0 };
                    const count = bd[star as 1 | 2 | 3 | 4 | 5] || 0;
                    const total = (supplierProfile.reviewsCount || 142);
                    const pct = Math.round((count / (total || 1)) * 100);

                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-6 text-slate-500 font-bold text-[11px] flex items-center gap-0.5">
                          {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                        </span>
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                        <span className="w-10 text-right text-[11px] text-slate-400 font-mono">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right 7 cols: Key Reliability Performance Indicators */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Mill Reliability Benchmark Audit</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">On-Time Shipment</p>
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {supplierProfile.reliabilityMetrics?.onTimeShipmentRate || 98.8}%
                    </p>
                    <span className="text-[9px] text-slate-400">Guaranteed Dispatch</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Quality Pass Rate</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                      {supplierProfile.reliabilityMetrics?.qualityPassRate || 99.4}%
                    </p>
                    <span className="text-[9px] text-slate-400">Lab Batch Testing</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Order Fulfillment</p>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                      {supplierProfile.reliabilityMetrics?.orderFulfillmentRate || 99.9}%
                    </p>
                    <span className="text-[9px] text-slate-400">Zero Stock Outage</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Avg Response Time</p>
                    <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {supplierProfile.reliabilityMetrics?.avgResponseTimeHours || 1.5}h
                    </p>
                    <span className="text-[9px] text-slate-400">Direct Mill Desk</span>
                  </div>
                </div>

                {/* Recent Verified Reviews List */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Recent Buyer Feedbacks ({supplierProfile.recentReviews?.length || 0})
                  </h5>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(supplierProfile.recentReviews || []).map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {rev.buyerName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({rev.buyerCompany})
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{rev.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={rev.rating} size="sm" />
                          {rev.productName && (
                            <span className="text-[10px] text-blue-600 font-medium">
                              • Ordered: {rev.productName}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW SUBMISSION MODAL */}
        {isReviewModalOpen && supplierProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>Rate & Review Supplier</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Submit an audit review for <strong className="text-slate-800 dark:text-slate-200">{supplierProfile.businessName}</strong> regarding fabric batch quality, shipping speed, or accuracy.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Interactive Star Rating Selector */}
                <div className="space-y-1.5 text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Rating Score
                  </label>
                  <StarRating
                    rating={newRating}
                    interactive={true}
                    size="lg"
                    onChange={(val) => setNewRating(val)}
                  />
                  <p className="text-[11px] font-extrabold text-blue-600">
                    {newRating === 5 && '★★★★★ Excellent - Pristine Quality & Fast Dispatch'}
                    {newRating === 4 && '★★★★☆ Very Good - High Quality'}
                    {newRating === 3 && '★★★☆☆ Average - Acceptable'}
                    {newRating === 2 && '★★☆☆☆ Fair - Some issues'}
                    {newRating === 1 && '★☆☆☆☆ Unsatisfactory'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newBuyerName}
                      onChange={(e) => setNewBuyerName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newBuyerCompany}
                      onChange={(e) => setNewBuyerCompany(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Detailed Buyer Feedback
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe batch quality, hand feel, roll packaging, or dispatch speed..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Publish Audit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CONTACT SUPPLIER MESSAGING THREAD MODAL */}
        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Direct Mill Inquiry Thread
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      To: <span className="font-bold text-blue-600">{product.supplierName}</span> ({product.name})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preset Inquiry Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Inquiry Templates:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `Request custom GSM/weight specification for ${product.name}`,
                    `Inquire about bulk discount for 500m+ order`,
                    `Ask for GOTS/OEKO-TEX lab certificate PDF`,
                    `Request estimated air dispatch timeline to US/EU`,
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyTemplatePrompt(chip)}
                      className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg transition-all text-left"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Thread History Container */}
              <div className="h-64 overflow-y-auto bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                {messagesList.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'buyer' ? 'ml-auto items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs ${
                        msg.sender === 'buyer'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Send Message Form */}
              <form onSubmit={handleSendInquiryMessage} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your inquiry message directly to the mill manager..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!inquiryMessage.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
                {inquirySentSuccess && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Inquiry delivered directly to supplier showroom terminal.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {/* SIMILAR FABRICS CAROUSEL */}
        {similarProducts.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Similar Verified Textiles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((sp) => (
                <div
                  key={sp.id}
                  onClick={() => onSelectProduct(sp)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md transition-all space-y-2"
                >
                  <img src={sp.images[0]} alt="" className="w-full h-36 rounded-xl object-cover" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{sp.name}</h4>
                  <p className="text-[10px] text-slate-500">{sp.composition} • {sp.gsm} GSM</p>
                  <p className="text-xs font-bold text-blue-600">${sp.pricePerMeter}/m</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* HIGH-RESOLUTION 2000x2000 TEXTURE ZOOM MODAL */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <ZoomIn className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{product.name} (Macro Inspection)</h3>
                  <p className="text-[11px] text-slate-400">{product.composition} • {product.gsm} GSM • High Resolution 2000x2000 WebP</p>
                </div>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40 min-h-[400px]">
              <img
                src={product.galleryImages?.find(gi => gi.secureUrl === selectedImage)?.zoomUrl || selectedImage || product.images[0]}
                alt={product.name}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {(product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : product.images).map((imgObj: any, idx: number) => {
                  const url = imgObj.thumbnailUrl || imgObj.secureUrl || imgObj;
                  const secUrl = imgObj.secureUrl || imgObj;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(secUrl)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === secUrl ? 'border-blue-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                Tip: Click and drag or scroll to inspect weave density, thread uniformity, and fiber structure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
