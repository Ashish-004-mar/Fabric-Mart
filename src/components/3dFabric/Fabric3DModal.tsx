import React, { useState } from 'react';
import { Product } from '../../types';
import { Fabric3DViewer, Fabric3DMode, LightingPreset } from './Fabric3DViewer';
import { X, Sparkles, ShoppingBag, Sliders, Layers, Sun, Wind, Eye, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Fabric3DModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const Fabric3DModal: React.FC<Fabric3DModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorName, setSelectedColorName] = useState(product.colors[0]?.name || '');
  const [activeMode, setActiveMode] = useState<Fabric3DMode>('cloth');
  const [lighting, setLighting] = useState<LightingPreset>('studio');
  const [meters, setMeters] = useState(product.moq || 50);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTextureUrl = product.images[selectedImageIndex] || product.images[0] || '';
  const activeColorObj = product.colors.find(c => c.name === selectedColorName) || product.colors[0];

  const handleAddToCart = () => {
    addToCart(product, meters, selectedColorName || 'Natural');
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col lg:flex-row bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: 3D WebGL Canvas Viewport */}
        <div className="w-full lg:w-3/5 p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                3D Real Fabric Inspector Studio
              </span>
              <span className="text-xs text-slate-400 font-mono">
                GSM: {product.gsm || 220} • {product.composition || '100% Premium Fiber'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              {product.name}
            </h2>
            <p className="text-xs text-slate-400 mb-4 line-clamp-1">
              {product.description}
            </p>
          </div>

          {/* 3D Viewer Element */}
          <div className="relative my-2 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
            <Fabric3DViewer
              textureUrl={currentTextureUrl}
              fabricName={product.name}
              fabricType={product.subcategoryName || product.categoryName}
              colorHex={activeColorObj?.hex}
              mode={activeMode}
              height="380px"
              autoRotateDefault={true}
              showControlsBar={true}
            />
          </div>

          {/* Real Fabric Image Texture Switcher */}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Real Fabric View Angle for 3D Texture Mapping:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, idx) => {
                const labels = ['Primary Shot', 'Folded Texture', 'Macro Weave', 'Drape View'];
                const active = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 group flex flex-col items-center ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                    }`}
                  >
                    <img
                      src={img}
                      alt={labels[idx]}
                      className="w-full h-12 object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] text-slate-300 mt-1 font-medium truncate w-full text-center">
                      {labels[idx] || `View ${idx + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Material Control & Specs Panel */}
        <div className="w-full lg:w-2/5 p-6 flex flex-col justify-between bg-slate-900 overflow-y-auto max-h-[90vh]">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Wholesale Price</span>
                <div className="text-2xl font-extrabold text-indigo-400">
                  ${Number(product.pricePerMeter ?? 0).toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">/ meter</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Stock</span>
                <div className="text-sm font-semibold text-emerald-400 flex items-center justify-end gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  {product.stockQuantity?.toLocaleString()} m Ready
                </div>
              </div>
            </div>

            {/* Technical Specs Summary */}
            <div className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Technical Fabric Profile
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Weave Type:</span>
                  <p className="font-semibold text-slate-200">{product.weaveType || 'Plain Weave'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Texture Finish:</span>
                  <p className="font-semibold text-slate-200">{product.texture || 'Smooth'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Fiber Origin:</span>
                  <p className="font-semibold text-slate-200">{product.fiberOrigin || 'Natural'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Eco Certification:</span>
                  <p className="font-semibold text-emerald-400">{product.certifications?.[0] || 'OEKO-TEX 100'}</p>
                </div>
              </div>
            </div>

            {/* Color Swatch Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Colorway in 3D: <span className="text-indigo-400 font-bold">{selectedColorName}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => {
                    const isSelected = selectedColorName === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColorName(c.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300'
                        }`}
                      >
                        <span style={{ backgroundColor: c.hex }} className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Order Quantity (Meters):
                </label>
                <span className="text-xs text-slate-400">MOQ: {product.moq}m</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMeters((m) => Math.max(product.moq || 10, m - 10))}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={meters}
                  onChange={(e) => setMeters(Math.max(product.moq || 10, Number(e.target.value)))}
                  className="w-28 h-10 rounded-xl bg-slate-950 border border-slate-800 text-center font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => setMeters((m) => m + 10)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <span className="text-xs font-semibold text-indigo-300">
                  Total: ${Number((meters || 0) * (product.pricePerMeter || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  Added {meters}m to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Order {meters}m Fabric Sample / Bolt
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Includes 3D Real Fabric Certificate & Custom Mill Shipping Verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
