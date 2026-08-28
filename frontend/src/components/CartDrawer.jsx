import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Sparkles,
  Truck,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const FREE_SHIPPING_THRESHOLD = 5000;

const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

/**
 * Mobile & Desktop CRO Luxury Slide-Out Cart Drawer
 */
export default function CartDrawer() {
  const {
    isDrawerOpen,
    isCartOpen,
    closeDrawer,
    closeCart,
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const navigate = useNavigate();
  const isOpen = isDrawerOpen || isCartOpen;
  const handleClose = closeDrawer || closeCart;

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const freeShippingProgress = Math.min(
    100,
    (cartTotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Semi-transparent Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="absolute inset-0 bg-midnight/85 backdrop-blur-md"
          />

          {/* Slide-In Drawer: 100% width on small screens, max-w-md on sm/desktop */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute inset-y-0 right-0 w-full sm:max-w-md flex h-full max-h-screen"
          >
            <div className="w-full h-full bg-midnight border-l border-white/10 shadow-2xl flex flex-col overflow-hidden">
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-6 border-b border-white/8 flex items-center justify-between bg-surface-2/40 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-midnight font-serif font-bold text-sm shadow-gold-sm"
                    style={{ background: 'linear-gradient(135deg, #9B7A2A, #E8C97A)' }}
                  >
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-text-primary leading-tight">
                      Olfactory Bag
                    </h2>
                    <p className="text-[11px] font-sans text-text-muted">
                      {cartCount} {cartCount === 1 ? 'flacon' : 'flacons'} selected
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer"
                  aria-label="Close bag"
                >
                  <X size={20} />
                </button>
              </div>

              {/* ── Free Shipping Visual Progress Bar (AOV Booster) ───────────── */}
              <div className="px-4 sm:px-6 py-3 bg-surface-2/70 border-b border-white/5 space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-text-muted flex items-center gap-1.5 font-medium">
                    <Truck size={14} className="text-gold flex-shrink-0" />
                    {amountToFreeShipping > 0 ? (
                      <span>
                        Add <strong className="text-gold font-bold">{formatPKR(amountToFreeShipping)}</strong> more to unlock <span className="text-emerald-400 font-semibold">Free Delivery!</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles size={13} /> Complimentary Nationwide Delivery Unlocked!
                      </span>
                    )}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        amountToFreeShipping === 0
                          ? 'linear-gradient(90deg, #10B981, #34D399)'
                          : 'linear-gradient(90deg, #9B7A2A, #E8C97A)',
                    }}
                  />
                </div>
              </div>

              {/* Items List (Scrollable) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3.5 divide-y divide-white/5 overscroll-contain">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                    <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-gold/20 flex items-center justify-center text-gold text-2xl">
                      🌸
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-text-primary">
                        Your Bag is Empty
                      </h3>
                      <p className="text-xs font-sans text-text-muted max-w-xs">
                        Explore our handcrafted extraits and discover your signature scent.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        navigate('/collections');
                      }}
                      className="btn-gold text-xs px-6 py-2.5 rounded-xl mt-1 font-bold uppercase tracking-wider"
                    >
                      Discover Fragrances
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const { product, variation, quantity } = item;
                    const itemKey = `${product._id}-${variation._id}`;
                    const imgUrl =
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=80';

                    return (
                      <motion.div
                        key={itemKey}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="pt-3.5 first:pt-0 flex gap-3 sm:gap-4"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-white/10 flex-shrink-0 relative">
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase text-text-muted truncate">
                              {product.brand || 'Mahid Aromas'}
                            </p>
                            <h4 className="font-serif text-sm sm:text-base font-bold text-text-primary truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-gold/15 border border-gold/30 text-[9px] font-sans font-bold text-gold">
                                {variation.size} ml
                              </span>
                              <span className="text-[10px] font-sans text-text-muted truncate">
                                {variation.concentration || 'Extrait'}
                              </span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between pt-1.5">
                            <div className="flex items-center border border-white/15 bg-surface-2 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    variation._id,
                                    Math.max(1, quantity - 1)
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 h-7 flex items-center justify-center text-xs font-sans font-bold text-text-primary border-x border-white/10 select-none">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(variation._id, quantity + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="font-serif font-bold text-xs sm:text-sm text-gold">
                                {formatPKR(variation.price * quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFromCart(variation._id)}
                                className="text-text-muted hover:text-red-400 p-1 cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-white/10 bg-midnight/95 backdrop-blur-md space-y-3 flex-shrink-0 z-10 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
                  <div className="space-y-1 text-xs font-sans">
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Subtotal</span>
                      <span className="text-text-primary font-medium">
                        {formatPKR(cartTotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted">
                      <span>Nationwide Delivery</span>
                      <span>
                        {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
                          <span className="text-emerald-400 font-bold uppercase text-[9px] tracking-wider">
                            Free Delivery
                          </span>
                        ) : (
                          'Rs. 250'
                        )}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1.5 border-t border-white/5 text-sm">
                      <span className="font-serif font-bold text-text-primary">
                        Estimated Total
                      </span>
                      <span className="font-serif font-bold text-base sm:text-lg text-gold">
                        {formatPKR(
                          cartTotal +
                            (cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 250)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Primary & Frictionless Exit CTAs */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="btn-gold w-full py-3.5 sm:py-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold group cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>

                    {/* Frictionless Exit Button */}
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-text-muted hover:text-text-primary text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Continue Shopping</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-[10px] font-sans text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Truck size={12} className="text-gold" /> Cash on Delivery
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-gold" /> 100% Authentic Extraits
                    </span>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
