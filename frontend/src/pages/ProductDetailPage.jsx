import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ChevronLeft,
  Star,
  ShieldCheck,
  Truck,
  Droplets,
  Award,
  Sparkles,
  Check,
  Plus,
  Minus,
  Heart,
  ZoomIn,
  Clock,
  Layers,
  Loader2,
  Lock,
  Flame,
  CheckCircle2,
  Package,
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import ScentPyramid from '../components/ScentPyramid';
import SEO from '../components/SEO';

const formatPKR = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();

  // ─── 1. State Management (All hooks called at top level unconditionally) ────
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingState, setAddingState] = useState('idle'); // idle | loading | success
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ─── 2. Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function fetchProductDetails() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setSelectedImageIdx(0);

        const response = await api.get(`/api/products/${id}`);
        const data = response.data?.data || response.data;

        if (isMounted && data) {
          setProduct(data);
          if (data.variations && data.variations.length > 0) {
            setSelectedVariation(data.variations[0]);
          } else {
            const fallbackVar = {
              _id: 'default-50',
              size: 50,
              concentration: 'Extrait de Parfum',
              price: data.startingPrice || data.price || 12500,
              stockQuantity: 15,
            };
            data.variations = [fallbackVar];
            setSelectedVariation(fallbackVar);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Fragrance details could not be retrieved.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ─── 3. Add to Cart Handler ────────────────────────────────────────────────
  const handleAddToBag = async () => {
    if (!selectedVariation || addingState !== 'idle') return;

    try {
      setAddingState('loading');
      await new Promise((resolve) => setTimeout(resolve, 300));

      addToCart(product, selectedVariation, quantity);

      setAddingState('success');
      openCart();

      setTimeout(() => {
        setAddingState('idle');
      }, 1800);
    } catch {
      setAddingState('idle');
    }
  };

  // ─── 4. Conditional Loading & Error States ──────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-charcoal text-text-primary">
        <Loader2 size={36} className="text-gold animate-spin" />
        <p className="text-xs font-sans tracking-widest uppercase text-text-muted">
          Loading Haute Parfumerie Flacon...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center bg-charcoal text-text-primary">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-2xl">
          🌸
        </div>
        <h2 className="font-serif text-3xl font-bold">Fragrance Not Found</h2>
        <p className="text-sm font-sans text-text-muted max-w-md">
          {error || 'This fragrance flacon may have been archived or is temporarily unavailable.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-outline-gold text-xs px-5 py-2.5 rounded-xl font-semibold"
          >
            Retry
          </button>
          <Link to="/collections" className="btn-gold text-xs px-5 py-2.5 rounded-xl font-semibold">
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  // ─── 5. Safely Extracted Product Data ───────────────────────────────────────
  const {
    name = 'Artisanal Extrait',
    brand = 'Mahid Aromas',
    description = '',
    fragranceFamily = 'Oriental',
    gender = 'Unisex',
    season = 'All Season',
    notes = {},
    images = [],
    variations = [],
    rating = 4.9,
    numReviews = 34,
  } = product;

  // Active variation calculations
  const activeVar = selectedVariation || variations[0] || {
    _id: 'default-50',
    size: 50,
    concentration: 'Extrait de Parfum',
    price: 12500,
    stockQuantity: 15,
  };

  const currentPrice = activeVar.price || 0;
  const currentCompareAtPrice = activeVar.compareAtPrice;
  const isOnSale = currentCompareAtPrice && currentCompareAtPrice > currentPrice;
  const currentStock = activeVar.stockQuantity !== undefined ? activeVar.stockQuantity : 10;
  const isInStock = currentStock > 0;

  // Largest variation calculated safely without conditional hook calls
  const largestVariationId =
    variations && variations.length > 1
      ? variations.reduce((max, v) => (v.size > max.size ? v : max), variations[0])._id
      : null;

  const currentImage =
    images[selectedImageIdx] ||
    images[0] ||
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-charcoal text-text-primary pb-28 lg:pb-20">
      <SEO
        title={`${name} — ${brand} Haute Parfumerie`}
        description={description?.slice(0, 160) || 'Artisanal extrait de parfum hand-blended by Mahid Aromas.'}
        image={currentImage}
      />

      {/* ── Breadcrumbs Navigation ──────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-midnight/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-sans text-text-muted">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Link to="/collections" className="hover:text-gold transition-colors flex items-center gap-1 flex-shrink-0">
              <ChevronLeft size={14} /> Catalog
            </Link>
            <span className="text-white/20">/</span>
            <Link to={`/collections?gender=${gender}`} className="hover:text-gold transition-colors flex-shrink-0">
              {gender === 'Men' ? 'For Men' : gender === 'Women' ? 'For Women' : 'Unisex'}
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-text-primary font-medium truncate">
              {name}
            </span>
          </div>

          <span className="text-gold hidden md:inline flex items-center gap-1 font-semibold">
            <Sparkles size={12} /> 30%+ Extrait Concentration &bull; 12+ Hrs Sillage
          </span>
        </div>
      </div>

      {/* ── Main Product Display Section (Max-width 7xl constrained for desktop) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-start">
          
          {/* ── LEFT: Sticky Desktop Flacon Showcase (5-6 Cols) ───────────────── */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            {/* Main Stage Flacon Image */}
            <div className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0B0F19] border border-white/10 shadow-2xl group">
              <img
                src={currentImage}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Badges Overlay */}
              <div className="absolute top-3.5 sm:top-4 left-3.5 sm:left-4 flex flex-col gap-1.5">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider backdrop-blur-md border shadow-md ${
                    gender === 'Men'
                      ? 'bg-sky-950/85 text-sky-300 border-sky-500/30'
                      : gender === 'Women'
                      ? 'bg-rose-950/85 text-rose-300 border-rose-500/30'
                      : 'bg-gold/25 text-gold border-gold/40'
                  }`}
                >
                  {gender === 'Men' ? 'For Him' : gender === 'Women' ? 'For Her' : 'Unisex'}
                </span>

                {fragranceFamily && (
                  <span className="px-3 py-1 rounded-full bg-midnight/90 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-sans text-text-secondary">
                    {fragranceFamily}
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted((prev) => !prev)}
                className="absolute top-3.5 sm:top-4 right-3.5 sm:right-4 w-9 h-9 rounded-full bg-midnight/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-400/30 transition-all active:scale-90 shadow-md"
                aria-label="Wishlist"
              >
                <Heart
                  size={16}
                  className={isWishlisted ? 'fill-red-400 text-red-400' : ''}
                />
              </button>

              {/* Zoom Trigger */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-3.5 sm:bottom-4 right-3.5 sm:right-4 px-3 py-1.5 rounded-xl bg-midnight/80 backdrop-blur-md border border-white/10 text-xs font-sans text-text-secondary hover:text-gold flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <ZoomIn size={14} /> View High-Res
              </button>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIdx(index)}
                    className={`relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden border transition-all flex-shrink-0 cursor-pointer ${
                      selectedImageIdx === index
                        ? 'border-gold shadow-gold-sm ring-1 ring-gold'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Details & Buying Controls (6-7 Cols) ───────────── */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            
            {/* Title & Brand Header */}
            <div className="space-y-2 border-b border-white/8 pb-5 sm:pb-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-sans uppercase tracking-[0.25em] text-gold font-bold">
                  {brand}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-sans text-text-muted">
                  <div className="flex items-center text-gold">
                    <Star size={13} className="fill-gold" />
                    <span className="ml-1 font-semibold text-text-primary">{rating}</span>
                  </div>
                  <span>&bull;</span>
                  <span>{numReviews} Verified Reviews</span>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-text-primary leading-tight">
                {name}
              </h1>

              {/* Dynamic Live Price */}
              <div className="flex items-baseline gap-3 pt-1.5">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-gold">
                  {formatPKR(currentPrice)}
                </span>
                {isOnSale && (
                  <span className="text-sm sm:text-base text-text-muted line-through font-sans">
                    {formatPKR(currentCompareAtPrice)}
                  </span>
                )}
                {isOnSale && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-sans font-bold uppercase tracking-wider border border-gold/30">
                    Special Offer
                  </span>
                )}
              </div>
            </div>

            {/* ── 2. Clickable Bottle Size Selector Pills (With Value Props) ──── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans uppercase tracking-widest text-text-muted font-bold block">
                  Select Bottle Size:
                </label>

                {activeVar && (
                  <span className="text-xs font-sans text-gold font-medium">
                    {activeVar.concentration || 'Extrait de Parfum'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variations.map((v) => {
                  const isSelected = activeVar._id === v._id;
                  const variationInStock = (v.stockQuantity !== undefined ? v.stockQuantity : 10) > 0;
                  const isBestValue = v._id === largestVariationId;

                  return (
                    <button
                      key={v._id || v.size}
                      type="button"
                      disabled={!variationInStock}
                      onClick={() => {
                        setSelectedVariation(v);
                        setQuantity(1);
                      }}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? 'bg-gold/15 text-gold border-gold ring-1 ring-gold shadow-gold-sm'
                          : variationInStock
                          ? 'bg-surface-2/70 text-text-primary border-white/10 hover:border-gold/40 hover:bg-surface-2'
                          : 'bg-surface-2/20 text-text-muted border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Best Value Highlight Badge */}
                      {isBestValue && (
                        <div className="absolute -top-2.5 right-3">
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-gold text-midnight text-[9px] font-sans font-extrabold uppercase tracking-wider shadow-md">
                            Best Value
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-serif text-base sm:text-lg font-bold">
                          {v.size} ml
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-gold shadow-gold-sm" />
                        )}
                      </div>

                      <div className="text-xs font-sans font-medium text-text-secondary">
                        {formatPKR(v.price)}
                      </div>

                      {!variationInStock && (
                        <span className="text-[10px] text-red-400 font-sans block mt-1 font-semibold">
                          Sold Out
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Scarcity & Urgency Indicator (CRO Trigger) ──────────────── */}
              <div className="p-3 rounded-xl bg-surface-2/60 border border-white/8 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  {isInStock && currentStock <= 5 ? (
                    <>
                      <Flame size={15} className="text-amber-400 animate-pulse" />
                      <span className="text-amber-300 font-semibold">
                        Only {currentStock} left in {activeVar.size}ml size &mdash; order soon!
                      </span>
                    </>
                  ) : isInStock ? (
                    <>
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span className="text-text-secondary">
                        In Stock &bull; Ready for 24-hr express dispatch
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-red-400 font-semibold">
                        Currently sold out in this size
                      </span>
                    </>
                  )}
                </div>

                <span className="text-[11px] text-text-muted hidden sm:inline">
                  Artisanal Batch #04
                </span>
              </div>
            </div>

            {/* ── 3. Desktop Quantity & Add to Cart ───────────────────────────── */}
            <div className="space-y-4 pt-1">
              <div className="hidden lg:flex items-stretch gap-3">
                <div className="flex items-center justify-center border border-white/15 bg-surface-2/80 rounded-2xl px-4 py-3 w-36 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !isInStock}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="font-sans font-bold text-base px-4 select-none text-text-primary">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || !isInStock}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={!isInStock || addingState !== 'idle'}
                  className={`btn-gold flex-1 py-4 px-8 rounded-2xl font-sans font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-gold transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    addingState === 'success'
                      ? 'bg-emerald-500 text-midnight font-extrabold'
                      : ''
                  }`}
                >
                  {addingState === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-midnight" />
                      <span>Adding to Bag...</span>
                    </>
                  ) : addingState === 'success' ? (
                    <>
                      <Check size={18} />
                      <span>Added to Bag!</span>
                    </>
                  ) : isInStock ? (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart &bull; {formatPKR(currentPrice * quantity)}</span>
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
              </div>

              {/* ── Trust Badges Row (Directly below Add to Cart) ─────────────── */}
              <div className="p-4 rounded-2xl bg-surface-2/40 border border-white/8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                <div className="flex items-center gap-2 text-text-secondary">
                  <ShieldCheck size={16} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="font-bold text-text-primary text-[11px]">100% Authentic</p>
                    <p className="text-[10px] text-text-muted">Master Extraits</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-text-secondary">
                  <Truck size={16} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="font-bold text-text-primary text-[11px]">COD Nationwide</p>
                    <p className="text-[10px] text-text-muted">Pay at Doorstep</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-text-secondary">
                  <Lock size={16} className="text-gold flex-shrink-0" />
                  <div>
                    <p className="font-bold text-text-primary text-[11px]">Secure Checkout</p>
                    <p className="text-[10px] text-text-muted">256-Bit SSL</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 4. Fragrance Story / Description ───────────────────────────── */}
            <div className="space-y-2.5 pt-4 border-t border-white/8">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
                <Award size={16} className="text-gold" /> Olfactory Composition &amp; Craft
              </h3>
              <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* ── 5. The Visual Scent Pyramid Breakdown ───────────────────────── */}
            <div className="space-y-3 pt-4 border-t border-white/8">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
                <Sparkles size={16} className="text-gold" /> The Scent Pyramid Architecture
              </h3>

              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface-2/40 border border-gold/20">
                <ScentPyramid notes={notes} />
              </div>
            </div>

            {/* ── 6. Longevity & Seasonal Specs ──────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/8 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-surface-2/60 border border-white/5 space-y-0.5">
                <span className="text-text-muted uppercase tracking-wider block text-[9px]">
                  Concentration
                </span>
                <span className="font-bold text-gold text-xs sm:text-sm block">
                  30%+ Pure Extrait
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-2/60 border border-white/5 space-y-0.5">
                <span className="text-text-muted uppercase tracking-wider block text-[9px]">
                  Longevity
                </span>
                <span className="font-bold text-text-primary text-xs sm:text-sm block">
                  10 &ndash; 14+ Hours
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-2/60 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-text-muted uppercase tracking-wider block text-[9px]">
                  Seasonality
                </span>
                <span className="font-bold text-text-primary text-xs sm:text-sm block">
                  {season}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 7. FIXED MOBILE CRO BOTTOM "ADD TO CART" BAR (Mobile Only) ───────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-midnight/95 backdrop-blur-xl border-t border-gold/30 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-base text-gold">
              {formatPKR(currentPrice)}
            </span>
            {activeVar && (
              <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-text-muted font-semibold">
                {activeVar.size}ml
              </span>
            )}
          </div>
          <span className="text-[10px] font-sans text-text-muted truncate block">
            {name}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToBag}
          disabled={!isInStock || addingState !== 'idle'}
          className={`btn-gold px-6 py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-gold active:scale-95 transition-transform flex-shrink-0 disabled:opacity-40 ${
            addingState === 'success' ? 'bg-emerald-500 text-midnight font-black' : ''
          }`}
        >
          {addingState === 'loading' ? (
            <Loader2 size={15} className="animate-spin text-midnight" />
          ) : addingState === 'success' ? (
            <>
              <Check size={15} />
              <span>Added!</span>
            </>
          ) : isInStock ? (
            <>
              <ShoppingBag size={15} />
              <span>Add to Cart</span>
            </>
          ) : (
            'Sold Out'
          )}
        </button>
      </div>

      {/* ── 8. Lightbox Zoom Overlay ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-midnight/95 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="relative max-w-3xl w-full aspect-[3/4] max-h-[85vh]">
              <img
                src={currentImage}
                alt={name}
                className="w-full h-full object-contain rounded-2xl"
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 btn-gold p-2 rounded-full shadow-lg text-xs"
              >
                &times; Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
