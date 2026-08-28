import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import SEO from '../components/SEO';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const GENDER_CARDS = [
  {
    title: 'For Men',
    subtitle: 'Smoky Woods & Regal Leather',
    href: '/collections?gender=Men',
    image:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80',
    tag: 'Bold & Charismatic',
  },
  {
    title: 'For Women',
    subtitle: 'Luminous Florals & Velvety Ambers',
    href: '/collections?gender=Women',
    image:
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&auto=format&fit=crop&q=80',
    tag: 'Sensual & Radiant',
  },
  {
    title: 'Unisex Signature',
    subtitle: 'Artisanal Boundary-Defying Blends',
    href: '/collections?gender=Unisex',
    image:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    tag: 'Pure Haute Parfumerie',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products', {
          params: { limit: 4 },
        });
        if (isMounted) setFeatured(data.data || []);
      } catch {
        // Handled silently
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-charcoal text-text-primary overflow-hidden">
      <SEO
        title="Mahid Aromas — Haute Parfumerie & Luxury Extraits de Parfum"
        description="Discover artisanal perfumes formulated in 30%+ extrait concentration. Cash on Delivery available across Pakistan with express luxury packaging."
        url="/"
      />

      {/* ── 1. Hero Section ─────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── 2. Shop by Gender Showcase (Men, Women, Unisex) ─────────────────── */}
      <section className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 space-y-2 sm:space-y-3">
          <p className="text-gold text-[11px] sm:text-xs font-sans tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-1.5">
            <Sparkles size={12} /> Curated Olfactory Journeys
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            Curations By Character
          </h2>
          <p className="text-text-muted text-xs sm:text-sm font-sans leading-relaxed">
            Whether seeking an assertive masculine trail, an enchanting feminine aura,
            or a transcendent unisex signature.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {GENDER_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link
                to={card.href}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:border-gold/50 transition-all duration-500"
              >
                {/* Background Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-midnight/80 backdrop-blur-md border border-white/10 text-gold text-[10px] font-sans font-bold uppercase tracking-wider">
                      {card.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-gold transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-sans text-text-secondary">
                      {card.subtitle}
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-gold text-xs font-sans font-semibold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      <span>Explore Collection</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. Featured Fragrances Grid (2-Column on Mobile, 4 on Desktop) ──── */}
      <section className="py-14 sm:py-20 bg-midnight/60 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8 sm:mb-12">
            <div>
              <p className="text-gold text-[11px] sm:text-xs font-sans tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5 mb-1.5">
                <Sparkles size={12} /> The Masterpieces
              </p>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-text-primary">
                Featured Extraits
              </h2>
            </div>

            <Link
              to="/collections"
              className="btn-outline-gold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <span>View All Fragrances</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Grid: 2-column mobile for easy scanability */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="card aspect-[3/4] animate-pulse bg-surface-2 rounded-2xl"
                />
              ))
            ) : featured.length > 0 ? (
              featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : null}
          </div>
        </div>
      </section>

      {/* ── 4. The Art of Olfactory Craftsmanship ────────────────────────────── */}
      <section id="about" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gold/25 bg-surface-2/40 backdrop-blur-md p-6 sm:p-12 lg:p-20 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 sm:space-y-6">
            <span className="text-gold text-xs font-sans tracking-[0.2em] uppercase font-bold flex items-center gap-1.5">
              <Award size={14} /> The Maison Philosophy
            </span>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
              Macerated For Months. <br />
              <span className="text-gold-shimmer italic font-normal">
                Crafted to Last An Eternity.
              </span>
            </h2>

            <p className="font-sans text-text-secondary text-sm sm:text-base leading-relaxed">
              At Mahid Aromas, we reject mass-produced commercial fragrances. Every flacon
              is infused with over 30% pure aromatic oil concentration, hand-poured in small
              artisanal batches, and rested until the top, heart, and base notes merge in
              flawless harmony.
            </p>

            <div className="pt-2 sm:pt-4">
              <Link
                to="/collections"
                className="btn-gold px-7 py-3 sm:py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold inline-block"
              >
                Experience The Craft
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
