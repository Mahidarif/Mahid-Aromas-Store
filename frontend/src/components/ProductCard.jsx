import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ArrowRight,
  Heart,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

/**
 * Mobile CRO & Luxury ProductCard Component
 */
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const {
    _id,
    name,
    brand = 'Mahid Aromas',
    fragranceFamily,
    gender = 'Unisex',
    notes = {},
    images = [],
    variations = [],
    slug,
  } = product;

  // Calculate lowest starting price across variations
  const startingPrice =
    product.startingPrice ||
    (variations.length > 0
      ? Math.min(...variations.map((v) => v.price))
      : 0);

  const primaryVariation = variations[0];
  const compareAtPrice = primaryVariation?.compareAtPrice;
  const isOnSale = compareAtPrice && compareAtPrice > startingPrice;

  const totalStock = variations.reduce(
    (sum, v) => sum + (v.stockQuantity || 0),
    0
  );
  const inStock = totalStock > 0;

  const primaryImage =
    !imgError && images[0]
      ? images[0]
      : 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80';

  const productUrl = `/products/${slug || _id}`;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || !primaryVariation) return;

    setAdding(true);
    addToCart(product, primaryVariation, 1);

    setTimeout(() => {
      setAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }, 350);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="card group flex flex-col justify-between overflow-hidden border border-white/8 hover:border-gold/40 rounded-xl sm:rounded-2xl bg-surface-2/40 hover:bg-surface-2/80 transition-all duration-300 shadow-card hover:shadow-gold-sm"
    >
      {/* ── 1. Image Container with Aspect Ratio ─────────────────────────────── */}
      <div className="relative block overflow-hidden aspect-[3/4] bg-[#0B0F19] flex-shrink-0">
        <Link to={productUrl} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={() => setImgError(true)}
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        </Link>

        {/* Top Badges (Compact on mobile) */}
        <div className="absolute top-2 sm:top-3.5 left-2 sm:left-3.5 flex flex-col gap-1 pointer-events-none">
          <span
            className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider backdrop-blur-md border shadow-xs ${
              gender === 'Men'
                ? 'bg-sky-950/85 text-sky-300 border-sky-500/30'
                : gender === 'Women'
                ? 'bg-rose-950/85 text-rose-300 border-rose-500/30'
                : 'bg-gold/25 text-gold border-gold/40'
            }`}
          >
            {gender === 'Men' ? 'Him' : gender === 'Women' ? 'Her' : 'Unisex'}
          </span>

          {fragranceFamily && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-midnight/80 backdrop-blur-md border border-white/10 text-[10px] font-sans text-text-secondary">
              {fragranceFamily}
            </span>
          )}
        </div>

        {/* Wishlist & Out of Stock */}
        <div className="absolute top-2 sm:top-3.5 right-2 sm:right-3.5 flex flex-col items-end gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted((prev) => !prev);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-midnight/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-400/30 transition-all active:scale-90"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={13}
              className={`transition-colors ${
                isWishlisted ? 'fill-red-400 text-red-400' : ''
              }`}
            />
          </button>

          {!inStock && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/80 backdrop-blur-md text-[9px] font-sans font-bold text-white uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Card Content Body (Compact for 2-column mobile) ───────────────── */}
      <div className="flex flex-col flex-1 p-3 sm:p-5 gap-1.5 sm:gap-3">
        <p className="text-[9px] sm:text-[11px] font-sans tracking-widest uppercase text-text-muted font-medium truncate">
          {brand}
        </p>

        <Link
          to={productUrl}
          className="font-serif text-sm sm:text-lg font-bold text-text-primary group-hover:text-gold transition-colors duration-200 line-clamp-1 leading-snug"
        >
          {name}
        </Link>

        {/* Scent Notes Teaser (hidden on small mobile to save vertical space) */}
        {notes.top && notes.top.length > 0 && (
          <p className="hidden sm:block text-xs text-text-secondary font-sans line-clamp-1">
            <span className="text-gold/80 font-medium">Notes:</span>{' '}
            {notes.top.slice(0, 2).join(', ')}
          </p>
        )}

        {/* Pricing Display in PKR */}
        <div className="pt-1.5 sm:pt-2 mt-auto border-t border-white/5 flex items-baseline justify-between">
          <div>
            <span className="text-[8px] sm:text-[10px] font-sans text-text-muted block">
              Starting at
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-sm sm:text-base text-gold">
                {formatPKR(startingPrice)}
              </span>
              {isOnSale && (
                <span className="text-[10px] text-text-muted line-through font-sans hidden sm:inline">
                  {formatPKR(compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <span className="text-[10px] font-sans text-text-muted">
            {variations.length > 0 ? `${variations.length} sizes` : 'Extrait'}
          </span>
        </div>
      </div>

      {/* ── 3. Action Buttons (Always visible and touch-friendly on mobile) ──── */}
      <div className="p-3 pt-0 sm:p-5 sm:pt-0 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5">
        <Link
          to={productUrl}
          className="btn-ghost border border-white/10 text-[11px] sm:text-xs py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-2 flex items-center justify-center gap-1 transition-all"
        >
          <span>Discover</span>
          <ArrowRight size={12} />
        </Link>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!inStock || adding}
          className={`text-[11px] sm:text-xs py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-1 transition-all shadow-xs disabled:opacity-40 cursor-pointer ${
            justAdded
              ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40'
              : 'btn-gold shadow-gold-sm'
          }`}
        >
          {adding ? (
            <Loader2 size={12} className="animate-spin" />
          ) : justAdded ? (
            <>
              <Check size={12} />
              <span>Added!</span>
            </>
          ) : inStock ? (
            <>
              <ShoppingBag size={12} />
              <span>Add to Cart</span>
            </>
          ) : (
            'Sold Out'
          )}
        </button>
      </div>
    </motion.article>
  );
}
