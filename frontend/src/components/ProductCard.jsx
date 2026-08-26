import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

// ─── Helper: format PKR ────────────────────────────────────────────────────────
const formatPKR = (amount) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })
    .format(amount)
    .replace('PKR', 'PKR ');

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity,     setQuantity]     = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedFeedback,setAddedFeedback]= useState(false);
  const [imgError,     setImgError]     = useState(false);

  if (!product) return null;

  const {
    _id, name, brand, rating = 0, numReviews = 0,
    images = [], variations = [], slug,
  } = product;

  // Use the first variation as the display price
  const primaryVariation = variations[0];
  const startingPrice    = primaryVariation?.price ?? 0;
  const compareAtPrice   = primaryVariation?.compareAtPrice;
  const isOnSale         = compareAtPrice && compareAtPrice > startingPrice;
  const inStock          = variations.some((v) => v.stockQuantity > 0);
  const primaryImage     = !imgError && images[0];

  // Rendered star rating
  const fullStars = Math.floor(rating);
  const halfStar  = rating - fullStars >= 0.5;

  const handleAdd = () => {
    if (!inStock) return;
    addToCart(product, primaryVariation, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const increment = (e) => { e.preventDefault(); setQuantity((q) => Math.min(q + 1, 10)); };
  const decrement = (e) => { e.preventDefault(); setQuantity((q) => Math.max(q - 1, 1)); };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card group flex flex-col overflow-hidden"
    >
      {/* ── Image wrapper ─────────────────────────────────────────────────── */}
      <Link
        to={`/products/${slug || _id}`}
        className="relative block overflow-hidden aspect-[3/4] bg-surface-2 flex-shrink-0"
        tabIndex={-1}
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          /* Fallback placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-surface-2">
            <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center">
              <span className="text-2xl">🌸</span>
            </div>
            <span className="text-text-muted text-xs font-sans">No image</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOnSale && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold text-midnight"
                  style={{ background: 'linear-gradient(135deg, #9B7A2A, #E8C97A)' }}>
              SALE
            </span>
          )}
          {!inStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold bg-red-500/20 text-red-400 border border-red-500/20">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsWishlisted((w) => !w); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-all duration-300
                     hover:scale-110 active:scale-95"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={14}
            className={`transition-colors duration-200 ${isWishlisted ? 'fill-red-400 text-red-400' : 'text-text-primary'}`}
          />
        </button>
      </Link>

      {/* ── Card body ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Brand */}
        <p className="text-[10px] font-sans tracking-widest uppercase text-gold/70">{brand}</p>

        {/* Product name */}
        <Link
          to={`/products/${slug || _id}`}
          className="font-serif text-lg font-semibold text-text-primary leading-snug
                     hover:text-gold transition-colors duration-200 line-clamp-2"
        >
          {name}
        </Link>

        {/* Star rating */}
        {numReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex" aria-label={`${rating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < fullStars
                      ? 'fill-gold text-gold'
                      : i === fullStars && halfStar
                      ? 'fill-gold/50 text-gold'
                      : 'fill-transparent text-text-muted'
                  }
                />
              ))}
            </div>
            <span className="text-xs text-text-muted font-sans">({numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-serif text-xl font-semibold text-text-primary">
            {formatPKR(startingPrice)}
          </span>
          {isOnSale && (
            <span className="text-sm text-text-muted line-through font-sans">
              {formatPKR(compareAtPrice)}
            </span>
          )}
          {variations.length > 1 && (
            <span className="text-xs text-text-muted font-sans ml-auto">
              {variations.length} sizes
            </span>
          )}
        </div>

        {/* ── Add to cart row ───────────────────────────────────────────── */}
        {inStock ? (
          <div className="flex items-center gap-2 mt-1">
            {/* Quantity incrementor */}
            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={decrement}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center text-text-secondary
                           hover:text-text-primary hover:bg-surface-2 transition-all duration-150
                           disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-sm font-sans text-text-primary border-x border-white/10 select-none">
                {quantity}
              </span>
              <button
                onClick={increment}
                disabled={quantity >= 10}
                className="w-8 h-8 flex items-center justify-center text-text-secondary
                           hover:text-text-primary hover:bg-surface-2 transition-all duration-150
                           disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Add to cart button */}
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-sans font-medium
                          transition-all duration-300 ease-luxury ${
                            addedFeedback
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'btn-gold'
                          }`}
              aria-label="Add to cart"
            >
              <ShoppingBag size={13} />
              {addedFeedback ? 'Added!' : 'Add to Cart'}
            </motion.button>
          </div>
        ) : (
          <button
            disabled
            className="w-full h-9 rounded-lg text-xs font-sans text-text-muted bg-surface-2 border border-white/5 cursor-not-allowed mt-1"
          >
            Out of Stock
          </button>
        )}
      </div>
    </motion.article>
  );
}
