import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import api from '../api/axiosConfig';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';

const GENDERS = [
  { label: 'All Fragrances', value: 'All' },
  { label: 'For Men', value: 'Men' },
  { label: 'For Women', value: 'Women' },
  { label: 'Unisex', value: 'Unisex' },
];

const FAMILIES = [
  { label: 'All Families', value: 'All' },
  { label: 'Oriental & Oud', value: 'Oriental' },
  { label: 'Floral Haute', value: 'Floral' },
  { label: 'Woody Elegance', value: 'Woody' },
  { label: 'Fresh & Citrus', value: 'Fresh' },
  { label: 'Aquatic', value: 'Aquatic' },
];

const SORT_OPTIONS = [
  { label: 'Featured & Popular', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Alphabetical: A-Z', value: 'name-asc' },
];

export default function CollectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── 1. State Management ───────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states from URL or defaults
  const activeFamily = searchParams.get('fragranceFamily') || 'All';
  const activeGender = searchParams.get('gender') || 'All';
  const activeSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('q') || '';

  // ─── 2. Data Fetching ──────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function fetchCatalog() {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/api/products', {
          params: { limit: 100 },
        });

        if (isMounted) {
          setProducts(response.data?.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load the fragrance collection at this time.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── URL Filter Handlers ───────────────────────────────────────────────────
  const setGenderFilter = (genderVal) => {
    const nextParams = new URLSearchParams(searchParams);
    if (genderVal === 'All') {
      nextParams.delete('gender');
    } else {
      nextParams.set('gender', genderVal);
    }
    setSearchParams(nextParams);
  };

  const setFamilyFilter = (family) => {
    const nextParams = new URLSearchParams(searchParams);
    if (family === 'All') {
      nextParams.delete('fragranceFamily');
    } else {
      nextParams.set('fragranceFamily', family);
    }
    setSearchParams(nextParams);
  };

  const setSortOption = (sortVal) => {
    const nextParams = new URLSearchParams(searchParams);
    if (sortVal === 'featured') {
      nextParams.delete('sort');
    } else {
      nextParams.set('sort', sortVal);
    }
    setSearchParams(nextParams);
  };

  const setSearchInput = (query) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!query.trim()) {
      nextParams.delete('q');
    } else {
      nextParams.set('q', query);
    }
    setSearchParams(nextParams);
  };

  // ─── 3. Filtering & Sorting Logic ──────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (activeGender !== 'All') {
      result = result.filter(
        (p) => (p.gender || 'Unisex').toLowerCase() === activeGender.toLowerCase()
      );
    }

    if (activeFamily !== 'All') {
      result = result.filter((p) =>
        p.fragranceFamily?.toLowerCase().includes(activeFamily.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const minPriceA =
        a.variations && a.variations.length > 0
          ? Math.min(...a.variations.map((v) => v.price))
          : a.startingPrice || 0;
      const minPriceB =
        b.variations && b.variations.length > 0
          ? Math.min(...b.variations.map((v) => v.price))
          : b.startingPrice || 0;

      if (activeSort === 'price-asc') return minPriceA - minPriceB;
      if (activeSort === 'price-desc') return minPriceB - minPriceA;
      if (activeSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return result;
  }, [products, searchQuery, activeGender, activeFamily, activeSort]);

  const hasActiveFilters =
    activeFamily !== 'All' || activeGender !== 'All' || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-charcoal text-text-primary">
      <SEO
        title="Artisanal Fragrance Collections — Mahid Aromas"
        description="Explore the master catalog of rare extraits de parfum, agarwood blends, and luminous florals with nationwide Cash on Delivery."
      />

      {/* ── 1. Luxury Hero Banner ───────────────────────────────────────────── */}
      <section className="relative py-12 sm:py-20 border-b border-white/8 overflow-hidden bg-midnight">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-[11px] sm:text-xs font-sans tracking-widest uppercase font-semibold"
          >
            <Sparkles size={12} />
            Haute Parfumerie Catalog
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary"
          >
            {activeGender === 'Men'
              ? 'Fragrances For Men'
              : activeGender === 'Women'
              ? 'Fragrances For Women'
              : activeGender === 'Unisex'
              ? 'Unisex Signature Blends'
              : 'The Fragrance Catalog'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-sans text-text-muted text-xs sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Formulated in pure 30%+ extrait concentration. Explore by character,
            notes, or bespoke compositions.
          </motion.p>
        </div>
      </section>

      {/* ── 2. Filter & Search Section (Mobile Swipeable Controls) ──────────── */}
      <section className="bg-midnight/70 border-b border-white/8 py-5 sm:py-8">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
          
          {/* Row 1: Gender Tabs & Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Gender Segmented Switcher */}
            <div className="inline-flex items-center p-1 sm:p-1.5 rounded-2xl bg-surface-2/80 border border-white/8 overflow-x-auto scrollbar-none">
              {GENDERS.map((g) => {
                const isSelected = activeGender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGenderFilter(g.value)}
                    className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-sans transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-gold text-midnight font-bold shadow-gold-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2 font-medium'
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input-luxury pl-10 pr-3 py-2 sm:py-2.5 text-xs w-full bg-surface-2/90 rounded-xl"
                />
              </div>

              <div className="relative flex-shrink-0">
                <select
                  value={activeSort}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="input-luxury text-xs py-2 sm:py-2.5 pl-3 pr-7 bg-surface-2/90 cursor-pointer appearance-none border-white/10 rounded-xl font-medium"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
              </div>
            </div>

          </div>

          {/* Row 2: Olfactory Family Filter Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 sm:pt-2 border-t border-white/5">
            <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-widest text-gold font-semibold mr-1 flex-shrink-0 flex items-center gap-1">
              <SlidersHorizontal size={11} /> Family:
            </span>

            {FAMILIES.map((fam) => {
              const isSelected = activeFamily === fam.value;
              return (
                <button
                  key={fam.value}
                  type="button"
                  onClick={() => setFamilyFilter(fam.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gold/20 text-gold border border-gold/40 font-bold shadow-xs'
                      : 'bg-surface-2/50 text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-white/5'
                  }`}
                >
                  {fam.label}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 3. Product Catalog Grid (2-Column Mobile Layout) ────────────────── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Results Counter & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-10 text-xs font-sans text-text-muted">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-gold">{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'fragrance' : 'fragrances'}
            </span>

            {activeGender !== 'All' && (
              <span className="px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">
                {activeGender}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-gold hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <X size={13} /> Reset Filters
            </button>
          )}
        </div>

        {/* Loading Skeletons (2-cols mobile) */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="card overflow-hidden animate-pulse border border-white/5 bg-surface-2/50 rounded-xl sm:rounded-2xl aspect-[3/4]"
              />
            ))}
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center max-w-md mx-auto space-y-3">
            <AlertCircle size={32} className="text-red-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-text-primary">
              Unable to Load Catalog
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

        {/* Empty Search State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16 space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto text-2xl">
              🌸
            </div>
            <h3 className="font-serif text-xl font-bold text-text-primary">
              No Fragrances Found
            </h3>
            <p className="text-xs text-text-muted font-sans leading-relaxed">
              We could not find any perfumes matching your selected filters.
            </p>
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="btn-gold text-xs px-5 py-2.5 rounded-xl mt-1 font-semibold"
            >
              Browse All Fragrances
            </button>
          </div>
        )}

        {/* Products Grid Rendering (2-cols on mobile for high conversion) */}
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
