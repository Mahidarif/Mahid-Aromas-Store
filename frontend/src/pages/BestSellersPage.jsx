import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  Filter,
  Layers,
  ShoppingBag,
  Star,
  Loader2,
  AlertCircle,
  RefreshCw,
  Award,
  ShieldCheck,
  Check,
} from 'lucide-react';
import api from '../api/axiosConfig';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const FAMILIES = [
  'All',
  'Oriental / Gourmand',
  'Floral',
  'Woody',
  'Fresh / Citrus',
];

const formatPKR = (n) =>
  `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

export default function BestSellersPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [addingId, setAddingId] = useState(null);

  // ─── 1. Fetch Best Selling Fragrances ──────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function fetchBestSellers() {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/products', {
          params: { limit: 50 },
        });

        if (isMounted) {
          const fetched = response.data?.data || [];
          // Sort by numReviews or rating descending (most popular/coveted first)
          const sortedBest = [...fetched].sort((a, b) => {
            const reviewsA = Number(a.numReviews || 0);
            const reviewsB = Number(b.numReviews || 0);
            if (reviewsB !== reviewsA) return reviewsB - reviewsA;
            return (b.rating || 5) - (a.rating || 5);
          });
          setProducts(sortedBest);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load best-selling fragrances at this time.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchBestSellers();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── 2. Filter by Fragrance Family ─────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (selectedFamily === 'All') return products;
    return products.filter((p) =>
      p.fragranceFamily?.toLowerCase().includes(selectedFamily.toLowerCase())
    );
  }, [products, selectedFamily]);

  return (
    <div className="min-h-screen bg-charcoal text-text-primary pb-20">
      <SEO
        title="Best Selling Fragrances — Mahid Aromas Haute Parfumerie"
        description="Discover the most coveted, iconic extraits de parfum hand-crafted by Mahid Aromas. 100% authentic artisanal scents with Cash on Delivery nationwide."
        url="/best-sellers"
      />

      {/* ── 1. Hero Showcase Section ────────────────────────────────────────── */}
      <section className="relative py-14 sm:py-24 border-b border-white/8 overflow-hidden bg-midnight">
        {/* Glowing Background Radial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-gold/20 via-amber-500/15 to-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4 sm:space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-sans tracking-widest uppercase font-semibold"
          >
            <Flame size={14} className="text-gold animate-pulse" />
            Most Coveted Creations &bull; Signature Iconics
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary"
          >
            Best Selling Fragrances
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sans text-text-muted text-xs sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Our master perfumes adored by fragrance connoisseurs across Pakistan.
            Hand-poured in 30%+ pure extrait concentration for unparalleled sillage.
          </motion.p>
        </div>
      </section>

      {/* ── 2. Filter Navigation Bar ────────────────────────────────────────── */}
      <div className="sticky top-16 z-20 bg-midnight/90 backdrop-blur-md border-b border-white/8 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Family Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {FAMILIES.map((family) => {
              const isSelected = selectedFamily === family;
              return (
                <button
                  key={family}
                  onClick={() => setSelectedFamily(family)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gold text-midnight font-bold shadow-gold-sm'
                      : 'bg-surface-2/80 text-text-secondary hover:text-text-primary hover:bg-surface border border-white/5'
                  }`}
                >
                  {family === 'All' ? 'All Best Sellers' : family}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-sans text-text-muted hidden sm:flex items-center gap-2">
            <Award size={14} className="text-gold" />
            <span>Over 10,000+ flacons delivered nationwide</span>
          </div>
        </div>
      </div>

      {/* ── 3. Product Cards Grid (2-cols on mobile, 4-cols on desktop) ──────── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="card overflow-hidden animate-pulse border border-white/5 bg-surface-2/50 rounded-2xl aspect-[3/4]"
              />
            ))}
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center max-w-md mx-auto space-y-3">
            <AlertCircle size={32} className="text-red-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-text-primary">
              Unable to Load Best Sellers
            </h3>
            <p className="text-xs text-text-muted font-sans">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-outline-gold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto text-xl">
              👑
            </div>
            <h3 className="font-serif text-xl font-bold text-text-primary">
              No Best Sellers Found
            </h3>
            <p className="text-xs text-text-muted font-sans">
              Try selecting a different fragrance family above.
            </p>
          </div>
        )}

        {/* Product Cards Rendering */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
