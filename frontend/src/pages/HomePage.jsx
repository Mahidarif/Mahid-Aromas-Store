import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import HeroSection  from '../components/HeroSection';
import ProductCard  from '../components/ProductCard';
import SEO          from '../components/SEO';
import { productsAPI } from '../api/axiosConfig';

// ─── Fragrance family chips ────────────────────────────────────────────────────
const FAMILIES = [
  { label: 'All',              href: '/products' },
  { label: 'Oriental & Oud',  href: '/products?fragranceFamily=Oriental+%2F+Gourmand' },
  { label: 'Floral',          href: '/products?fragranceFamily=Floral' },
  { label: 'Woody',           href: '/products?fragranceFamily=Woody' },
  { label: 'Fresh & Citrus',  href: '/products?fragranceFamily=Fresh+%2F+Citrus' },
  { label: 'Aquatic',         href: '/products?fragranceFamily=Aquatic' },
];

export default function HomePage() {
  const [featured,  setFeatured]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await productsAPI.getAll({ limit: 4, sort: 'newest' });
        if (!cancelled) setFeatured(data.data || []);
      } catch {
        // silently fail — placeholder cards already handle empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <SEO
        title="Haute Parfumerie & Luxury Fragrances"
        description="Explore Mahid Aromas' curated collection of rare and authentic perfumes. Discover signature Oud, Floral, and Woody scents with nationwide express delivery."
        url="/"
        image="/hero-perfume.png"
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── 2. Fragrance family navigation ──────────────────────────────── */}
      <section className="bg-midnight border-y border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            {FAMILIES.map((f) => (
              <Link
                key={f.label}
                to={f.href}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-white/10 bg-surface
                           text-sm font-sans text-text-secondary hover:border-gold/40 hover:text-gold
                           transition-all duration-200 whitespace-nowrap"
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured products ─────────────────────────────────────────── */}
      <section className="py-20 bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <p className="flex items-center justify-center gap-2 text-gold text-xs font-sans tracking-widest uppercase mb-3">
              <Sparkles size={12} /> Curated for You
            </p>
            <h2 className="section-title">New Arrivals</h2>
            <div className="divider-gold mt-4" />
          </motion.div>

          {/* Product grid */}
          {loading ? (
            /* Skeleton loaders */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-surface-2" />
                  <div className="p-4 space-y-3">
                    <div className="h-2 bg-surface-2 rounded w-1/3" />
                    <div className="h-4 bg-surface-2 rounded w-3/4" />
                    <div className="h-3 bg-surface-2 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* View all CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/products" className="btn-outline-gold text-sm px-8 py-3 group">
              View All Collections
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 4. Brand promise strip ────────────────────────────────────────── */}
      <section className="py-16 bg-midnight border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: 'Authenticity Guaranteed',  body: 'Every bottle sourced directly from verified brands and authorized distributors.' },
              { title: 'Crafted for Longevity',    body: 'We curate high-concentration formulas that command presence for hours on end.' },
              { title: 'Pakistan-Wide Delivery',   body: 'Next-day delivery in major cities. Real-time AWB tracking on every order.' },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <div className="divider-gold" />
                <h3 className="font-serif text-xl font-semibold text-text-primary mt-4">{item.title}</h3>
                <p className="text-text-secondary text-sm font-sans leading-relaxed max-w-xs mx-auto">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
