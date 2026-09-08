import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import {
  Heart,
  X,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  Store,
  Check,
} from 'lucide-react';

interface WishlistDrawerProps {
  onSelectProduct?: (product: Product) => void;
  onNavigateMarketplace?: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  onSelectProduct,
  onNavigateMarketplace,
}) => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  if (!isWishlistOpen) return null;

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const quantity = product.moq || 50;
    const color = product.colors && product.colors.length > 0 ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name) : 'Natural White';
    
    addToCart(product, quantity, color);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleAddAllToCart = () => {
    wishlist.forEach((product) => {
      const quantity = product.moq || 50;
      const color = product.colors && product.colors.length > 0 ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name) : 'Natural White';
      addToCart(product, quantity, color);
    });
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setIsWishlistOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsWishlistOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          aria-hidden="true"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Saved Fabrics Wishlist"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/90">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  Saved Fabric Wishlist
                  <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                    {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quick access to curated swatch selections and preferred mill roll orders.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              aria-label="Close wishlist drawer"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Header bar when wishlist has items */}
          {wishlist.length > 0 && (
            <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Saved for current sourcing project
              </span>
              <button
                onClick={handleAddAllToCart}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add All to Cart</span>
              </button>
            </div>
          )}

          {/* Body List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/40">
                  <Heart className="w-8 h-8 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Your Wishlist is Empty</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Bookmark sustainable textiles, organic cottons, and luxury silks directly from the marketplace for fast comparison.
                  </p>
                </div>
                {onNavigateMarketplace && (
                  <button
                    onClick={() => {
                      setIsWishlistOpen(false);
                      onNavigateMarketplace();
                    }}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <Store className="w-4 h-4" />
                    <span>Explore Marketplace</span>
                  </button>
                )}
              </div>
            ) : (
              wishlist.map((product) => {
                const isAdded = addedIds[product.id];
                const primaryImage =
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400';

                return (
                  <div
                    key={product.id}
                    onClick={() => handleViewProduct(product)}
                    className="group bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 transition-all cursor-pointer shadow-2xs relative flex gap-4"
                  >
                    {/* Thumbnail */}
                    <div className="relative shrink-0">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-22 h-22 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      {product.ecoScore === 'A+' && (
                        <span className="absolute -top-1.5 -left-1.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                          ECO
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {product.name}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWishlist(product.id);
                            }}
                            aria-label={`Remove ${product.name} from wishlist`}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          Mill: {product.supplierName || 'Apex Textiles Ltd.'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          {product.gsm && <span>{product.gsm} GSM</span>}
                          {product.gsm && product.moq && <span>•</span>}
                          {product.moq && <span>MOQ: {product.moq}m</span>}
                        </div>
                      </div>

                      {/* Footer Price & Action */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            ${Number(product.pricePerMeter ?? 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium"> / meter</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add Order</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {wishlist.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-blue-50/80 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Saved fabric items sync across desktop and mobile devices for your company account.
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WishlistDrawer;
