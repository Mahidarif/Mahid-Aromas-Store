import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, ChevronLeft, Star, Shield, Truck,
  CheckCircle, Package, ZoomIn,
} from 'lucide-react';
import { productsAPI } from '../api/axiosConfig';
import { useCart }      from '../context/CartContext';
import ScentPyramid     from '../components/ScentPyramid';
import SEO              from '../components/SEO';

const formatPKR = (n) =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 })
    .format(n).replace('PKR', 'PKR ');

// ─── Trust badge row ──────────────────────────────────────────────────────────
function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { icon: <Shield size={14} className="text-gold" />,   text: '100% Authentic' },
        { icon: <CheckCircle size={14} className="text-green-400" />, text: 'Secure Checkout' },
        { icon: <Truck size={14} className="text-blue-400" />, text: 'Fast Delivery' },
        { icon: <Package size={14} className="text-purple-400" />, text: 'Easy Returns' },
      ].map(({ icon, text }) => (
        <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-white/5">
          {icon}
          <span className="text-xs font-sans text-text-secondary">{text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Star rating display ──────────────────────────────────────────────────────
function StarRating({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={13}
            className={i < Math.round(rating) ? 'fill-gold text-gold' : 'fill-transparent text-text-muted'}
          />
        ))}
      </div>
      <span className="text-xs text-text-muted font-sans">{rating.toFixed(1)} ({count} reviews)</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart } = useCart();

  const [product,          setProduct]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImage,    setSelectedImage]    = useState(0);
  const [quantity,         setQuantity]         = useState(1);
  const [addState,         setAddState]         = useState('idle'); // idle | loading | success
  const [lightboxOpen,     setLightboxOpen]     = useState(false);

  // ── Fetch product ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productsAPI.getById(id)
      .then(({ data }) => {
        if (cancelled) return;
        setProduct(data.data);
        setSelectedVariation(data.data.variations?.[0] || null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Product not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // ── Add to bag ────────────────────────────────────────────────────────
  const handleAddToBag = async () => {
    if (!selectedVariation || addState !== 'idle') return;

    setAddState('loading');
    await new Promise((r) => setTimeout(r, 400)); // small UX delay
    addToCart(product, selectedVariation, quantity);
    setAddState('success');
    setTimeout(() => setAddState('idle'), 2200);
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="space-y-3">
            <div className="aspect-[4/5] rounded-2xl bg-surface" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-surface" />)}
            </div>
          </div>
          <div className="space-y-5 pt-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-surface rounded" style={{ width: `${80 - i * 8}%` }} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="font-serif text-2xl text-text-primary">Product not found</p>
        <p className="text-text-muted font-sans text-sm">{error}</p>
        <Link to="/products" className="btn-outline-gold px-6 py-2.5 text-sm">Browse All Fragrances</Link>
      </div>
    );
  }

  const images   = product.images || [];
  const inStock  = selectedVariation ? selectedVariation.stockQuantity > 0 : false;
  const isOnSale = selectedVariation?.compareAtPrice > selectedVariation?.price;

  const productDescription =
    product.shortDescription ||
    product.description ||
    `Experience ${product.name} by ${product.brand}. An authentic ${product.fragranceFamily} fragrance crafted for longevity.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <SEO
        title={`${product.name} — ${product.brand}`}
        description={productDescription}
        image={images[0]}
        url={`/products/${product.slug || product._id}`}
        type="product"
        keywords={`${product.name}, ${product.brand}, ${product.fragranceFamily}, luxury perfumes, buy ${product.name} Pakistan`}
        productData={{
          price: selectedVariation?.price,
          inStock,
        }}
      />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-8 text-xs font-sans text-text-muted">
        <Link to="/" className="hover:text-gold transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gold transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-text-secondary line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

        {/* ── LEFT: Image gallery ──────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-2 cursor-zoom-in group"
            onClick={() => images.length > 0 && setLightboxOpen(true)}
          >
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={`${product.name} — view ${selectedImage + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-2">🌸</div>
            )}

            {/* Zoom hint */}
            <div className="absolute top-3 right-3 w-9 h-9 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn size={15} className="text-text-secondary" />
            </div>

            {/* Sale badge */}
            {isOnSale && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-sans font-bold text-midnight"
                   style={{ background: 'linear-gradient(135deg,#9B7A2A,#E8C97A)' }}>
                SALE
              </div>
            )}
          </motion.div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    i === selectedImage
                      ? 'border-gold shadow-gold-sm'
                      : 'border-white/5 hover:border-gold/40'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product info ──────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Back button (mobile) */}
          <button onClick={() => navigate(-1)} className="btn-ghost text-xs flex lg:hidden -ml-1">
            <ChevronLeft size={14} /> Back
          </button>

          {/* Brand + Gender */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans tracking-widest text-gold/80 uppercase">{product.brand}</p>
            <span className="px-2.5 py-1 rounded-full bg-surface border border-white/8 text-text-muted text-[10px] font-sans">
              {product.gender}
            </span>
          </div>

          {/* Name */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-primary leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.numReviews > 0 && (
            <StarRating rating={product.rating} count={product.numReviews} />
          )}

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-text-secondary font-sans text-base leading-relaxed italic">
              "{product.shortDescription}"
            </p>
          )}

          {/* Fragrance family chip */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-sans">Fragrance Family:</span>
            <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-sans">
              {product.fragranceFamily}
            </span>
          </div>

          {/* Divider */}
          <div className="divider-gold" style={{ margin: '0' }} />

          {/* ── Variation selector ─────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm font-medium text-text-primary">Select Size</p>
              {selectedVariation && (
                <p className="text-[10px] font-sans text-text-muted uppercase tracking-widest">
                  SKU: {selectedVariation.sku}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {product.variations.map((v) => {
                const isActive  = selectedVariation?._id === v._id.toString() ||
                                  selectedVariation?._id === v._id;
                const noStock   = v.stockQuantity <= 0;

                return (
                  <button
                    key={v._id}
                    onClick={() => { setSelectedVariation(v); setQuantity(1); }}
                    disabled={noStock}
                    className={`relative px-4 py-2.5 rounded-xl border text-sm font-sans transition-all duration-200 ${
                      noStock
                        ? 'opacity-40 cursor-not-allowed border-white/5 text-text-muted line-through'
                        : isActive
                        ? 'border-gold bg-gold/10 text-gold shadow-gold-sm'
                        : 'border-white/10 text-text-secondary hover:border-gold/40 hover:text-text-primary'
                    }`}
                  >
                    <span className="font-semibold">{v.size}ml</span>
                    <span className="ml-1 text-[10px] opacity-70">
                      {v.concentration.split(' ')[0]}
                    </span>
                    {noStock && (
                      <span className="absolute -top-2 -right-2 text-[9px] bg-red-500/80 text-white px-1 rounded">
                        Sold out
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Price (animated on variation change) ──────────────────── */}
          <AnimatePresence mode="wait">
            {selectedVariation && (
              <motion.div
                key={selectedVariation._id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="flex items-baseline gap-3"
              >
                <span className="font-serif text-3xl font-bold text-text-primary">
                  {formatPKR(selectedVariation.price)}
                </span>
                {selectedVariation.compareAtPrice > selectedVariation.price && (
                  <span className="text-lg text-text-muted line-through font-sans">
                    {formatPKR(selectedVariation.compareAtPrice)}
                  </span>
                )}
                {/* Stock indicator */}
                <span className={`ml-2 flex items-center gap-1 text-xs font-sans ${
                  inStock ? 'text-green-400' : 'text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`} />
                  {inStock
                    ? selectedVariation.stockQuantity <= 5
                      ? `Only ${selectedVariation.stockQuantity} left`
                      : 'In Stock'
                    : 'Out of Stock'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Quantity + Add to Bag ──────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Quantity */}
            <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-11 h-12 flex items-center justify-center text-text-secondary hover:text-gold hover:bg-surface-2 transition-all disabled:opacity-30"
              >
                −
              </button>
              <span className="w-11 h-12 flex items-center justify-center text-base font-sans text-text-primary border-x border-white/10 select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(q + 1, selectedVariation?.stockQuantity || 10))}
                disabled={quantity >= (selectedVariation?.stockQuantity || 10)}
                className="w-11 h-12 flex items-center justify-center text-text-secondary hover:text-gold hover:bg-surface-2 transition-all disabled:opacity-30"
              >
                +
              </button>
            </div>

            {/* Add to Bag */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToBag}
              disabled={!inStock || addState === 'loading'}
              className={`flex-1 h-12 rounded-xl font-sans font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                addState === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : !inStock
                  ? 'bg-surface-2 text-text-muted cursor-not-allowed border border-white/5'
                  : 'btn-gold'
              }`}
            >
              {addState === 'loading' ? (
                <span className="w-4 h-4 border-2 border-midnight/40 border-t-midnight rounded-full animate-spin" />
              ) : addState === 'success' ? (
                <><CheckCircle size={15} /> Added to Bag!</>
              ) : (
                <><ShoppingBag size={15} /> Add to Bag</>
              )}
            </motion.button>
          </div>

          {/* Delivery note */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface border border-white/5">
            <Truck size={14} className="text-blue-400 flex-shrink-0" />
            <p className="text-xs font-sans text-text-secondary">
              <span className="text-text-primary font-medium">Estimated delivery 1–3 days</span>
              &nbsp;· TCS, Leopards & Trax available
            </p>
          </div>

          {/* Trust badges */}
          <TrustBadges />

          {/* Full description */}
          {product.description && (
            <div className="pt-2">
              <h3 className="font-serif text-lg font-semibold text-text-primary mb-2">About this fragrance</h3>
              <p className="text-text-secondary font-sans text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* ── Scent Pyramid ────────────────────────────────────────────── */}
          {(product.notes?.top?.length > 0 ||
            product.notes?.heart?.length > 0 ||
            product.notes?.base?.length > 0) && (
            <div className="pt-2">
              <ScentPyramid notes={product.notes} />
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && images[selectedImage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            style={{ background: 'rgba(10,14,26,0.95)' }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[selectedImage]}
              alt={product.name}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
