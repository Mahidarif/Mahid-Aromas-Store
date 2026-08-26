import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2, PackageOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPKR = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })
    .format(n).replace('PKR', 'PKR ');

// ─── Single cart row ──────────────────────────────────────────────────────────
function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart();
  const { product, variation, quantity } = item;
  const image = product.images?.[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 py-4 border-b border-white/5 last:border-0"
    >
      {/* Thumbnail */}
      <Link
        to={`/products/${product.slug || product._id}`}
        className="flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-surface-2 block"
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">🌸</div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-sans tracking-widest text-gold/70 uppercase">{product.brand}</p>
        <Link
          to={`/products/${product.slug || product._id}`}
          className="font-serif text-sm font-semibold text-text-primary line-clamp-1 hover:text-gold transition-colors mt-0.5"
        >
          {product.name}
        </Link>

        {/* Size & concentration badge */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span className="px-2 py-0.5 rounded-md bg-surface-2 border border-white/8 text-[10px] font-sans text-text-secondary">
            {variation.size}ml
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-2 border border-white/8 text-[10px] font-sans text-text-muted">
            {variation.concentration.split(' ')[0]}
          </span>
        </div>

        {/* Quantity controls + price */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() =>
                quantity > 1
                  ? updateQuantity(variation._id, quantity - 1)
                  : removeFromCart(variation._id)
              }
              className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-gold hover:bg-surface-2 transition-all"
              aria-label="Decrease"
            >
              {quantity === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
            </button>
            <span className="w-7 h-7 flex items-center justify-center text-xs font-sans text-text-primary border-x border-white/10 select-none">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(variation._id, quantity + 1)}
              disabled={quantity >= (variation.stockQuantity || 10)}
              className="w-7 h-7 flex items-center justify-center text-text-secondary hover:text-gold hover:bg-surface-2 transition-all disabled:opacity-30"
              aria-label="Increase"
            >
              <Plus size={10} />
            </button>
          </div>

          <span className="font-serif text-sm font-semibold text-text-primary">
            {formatPKR(variation.price * quantity)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeFromCart(variation._id)}
        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all mt-1"
        aria-label="Remove item"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────
export default function CartDrawer() {
  const { cartItems, cartTotal, shippingFee, cartCount, isDrawerOpen, closeDrawer } = useCart();
  const orderTotal = cartTotal + shippingFee;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(10,14,26,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={closeDrawer}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col shadow-2xl"
            style={{ background: '#12182B', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-gold" />
                <h2 className="font-serif text-lg font-semibold text-text-primary">
                  Your Bag
                </h2>
                {cartCount > 0 && (
                  <span className="ml-1 min-w-[20px] h-5 rounded-full text-midnight text-[10px] font-bold flex items-center justify-center px-1.5"
                        style={{ background: 'linear-gradient(135deg,#9B7A2A,#E8C97A)' }}>
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-all"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 scrollbar-hide">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center border border-white/5">
                    <PackageOpen size={32} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="font-serif text-lg text-text-primary">Your bag is empty</p>
                    <p className="text-text-muted text-sm font-sans mt-1">Discover our luxury fragrances</p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="btn-gold px-6 py-2.5 text-sm"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <CartItem key={item.variation._id} item={item} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — only visible when cart has items */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/5 px-5 py-5 space-y-4">
                {/* Price breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text-primary">{formatPKR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-text-secondary">Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-400' : 'text-text-primary'}>
                      {shippingFee === 0 ? 'Free' : formatPKR(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="font-sans font-medium text-text-primary">Total</span>
                    <span className="font-serif text-xl font-bold text-text-primary">
                      {formatPKR(orderTotal)}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[10px] text-text-muted font-sans text-center">
                      Add {formatPKR(5000 - cartTotal)} more for free shipping
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="btn-gold w-full py-3.5 text-sm rounded-xl group"
                >
                  Proceed to Checkout
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <button
                  onClick={closeDrawer}
                  className="w-full text-center text-xs text-text-muted hover:text-text-secondary font-sans transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
