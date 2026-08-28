import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Droplets,
  Award,
} from 'lucide-react';

// ─── Animation Variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-midnight py-12 sm:py-20 lg:py-32"
    >
      {/* ── 1. Layered Atmospheric Background & Radial Lighting ─────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-midnight to-charcoal" />

        {/* Ambient Gold Radial Spotlights */}
        <div
          className="absolute top-1/4 left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full opacity-20 blur-[100px] sm:blur-[120px]"
          style={{ background: 'radial-gradient(circle, #E8C97A 0%, #9B7A2A 50%, transparent 80%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full opacity-15 blur-[120px] sm:blur-[140px]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
        />

        {/* Subtle Luxury Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#E8C97A_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* ── 2. Hero Content Container (Split Luxury Layout) ──────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* ── Left Column: Headline, Story & CTAs (7 Cols) ──────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="lg:col-span-7 space-y-5 sm:space-y-7 text-center lg:text-left"
          >
            {/* Haute Parfumerie Eyebrow */}
            <motion.div
              variants={fadeUpVariant}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/30 bg-gold/5 backdrop-blur-md"
            >
              <Sparkles size={12} className="text-gold animate-pulse" />
              <span className="text-gold font-sans text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase">
                Artisanal Extraits de Parfum
              </span>
            </motion.div>

            {/* Grand Headline: 3xl on small mobile, 5xl on tablet, 7xl on desktop */}
            <motion.h1
              variants={fadeUpVariant}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-text-primary leading-[1.12]"
            >
              The Essence of <br />
              <span className="text-gold-shimmer italic font-normal">Pure Luxury.</span>
            </motion.h1>

            {/* Emotional Story Body */}
            <motion.p
              variants={fadeUpVariant}
              className="text-text-secondary text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed"
            >
              Distilled from aged Cambodian agarwood, velvety Bulgarian rose, and
              precious golden ambers. Mastercrafted in 30%+ extrait concentration
              for an indelible presence.
            </motion.p>

            {/* High-Converting Mobile CTAs */}
            <motion.div
              variants={fadeUpVariant}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1"
            >
              {/* Primary CTA */}
              <Link
                to="/collections"
                className="btn-gold w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 group shadow-gold"
              >
                <span>Explore Signature Collection</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </Link>

              {/* Secondary CTA */}
              <Link
                to="/collections?gender=Men"
                className="btn-outline-gold w-full sm:w-auto px-6 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center hover:bg-gold hover:text-midnight transition-all duration-300"
              >
                Shop By Character
              </Link>
            </motion.div>

            {/* Trust Reassurance Badges (COD & Quality) */}
            <motion.div
              variants={fadeUpVariant}
              className="pt-4 sm:pt-6 border-t border-white/8 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto lg:mx-0 text-left"
            >
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-gold flex-shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-sans font-bold text-text-primary">COD Delivery</p>
                  <p className="text-[9px] sm:text-[10px] font-sans text-text-muted">Nationwide</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-gold flex-shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-sans font-bold text-text-primary">30% Extrait</p>
                  <p className="text-[9px] sm:text-[10px] font-sans text-text-muted">Long Lasting</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold flex-shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-sans font-bold text-text-primary">100% Authentic</p>
                  <p className="text-[9px] sm:text-[10px] font-sans text-text-muted">Master Lab</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Column: Luxury Flacon Visual & Showcase Card (5 Cols) ─────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative mt-4 lg:mt-0"
          >
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gold/20 rounded-3xl blur-3xl transform scale-95" />

              <div className="relative rounded-3xl overflow-hidden border border-gold/30 bg-surface-2/60 backdrop-blur-xl shadow-2xl p-5 sm:p-7 space-y-4 sm:space-y-5 group">
                
                {/* Flacon Image */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-midnight/80 border border-white/5 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80"
                    alt="Oud Royale — Mahid Aromas Extrait"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-midnight/90 backdrop-blur-md border border-gold/40 text-gold text-[10px] font-sans font-bold tracking-wider uppercase shadow-lg">
                      Signature Release
                    </span>
                  </div>

                  {/* Bottom Longevity Pill */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-gold/95 text-midnight text-[10px] font-sans font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Award size={12} /> 12+ Hrs Sillage
                    </span>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-sans tracking-wider text-text-muted uppercase block">
                      Featured Masterpiece
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary group-hover:text-gold transition-colors">
                      Oud Royale Extrait
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-sans text-text-muted uppercase block">
                      From
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-bold text-gold">
                      Rs. 14,500
                    </span>
                  </div>
                </div>

                <Link
                  to="/collections"
                  className="btn-outline-gold w-full text-xs py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 group-hover:bg-gold group-hover:text-midnight transition-all duration-300"
                >
                  <span>Discover The Flacon</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
