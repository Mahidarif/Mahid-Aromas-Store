import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

// ─── Animation Variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUpVariant = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const lineVariant = {
  hidden:  { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
  },
};

// ─── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({ value, label }) {
  return (
    <motion.div variants={fadeUpVariant} className="text-center">
      <div className="font-serif text-2xl md:text-3xl font-bold text-gold">{value}</div>
      <div className="text-xs text-text-muted mt-1 font-sans tracking-wide uppercase">{label}</div>
    </motion.div>
  );
}

export default function HeroSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: '#0A0E1A' }}
    >
      {/* ── Background image ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <img
          src="/hero-perfume.png"
          alt="Mahid Aromas — Luxury Perfumes"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Layered gradient overlays for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(10,14,26,0.25) 0%, rgba(10,14,26,0.65) 50%, rgba(10,14,26,0.97) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 70% 50%, transparent 40%, rgba(10,14,26,0.6) 100%)',
          }}
        />
      </motion.div>

      {/* ── Ambient orbs ──────────────────────────────────────────────────── */}
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/3 left-1/6 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4A6FA5 0%, transparent 70%)' }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="max-w-3xl"
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeUpVariant}
            className="flex items-center gap-3 mb-6"
          >
            <span className="flex items-center gap-1.5 text-gold text-xs font-sans tracking-widest uppercase">
              <Sparkles size={12} className="text-gold" />
              Authentic Luxury Fragrances
            </span>
            {/* Thin gold line */}
            <motion.div
              variants={lineVariant}
              className="h-px flex-1 max-w-20 origin-left"
              style={{ background: 'linear-gradient(to right, #C9A84C, transparent)' }}
            />
          </motion.div>

          {/* Hero headline */}
          <motion.h1
            variants={fadeUpVariant}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            <span className="text-text-primary">Where Scent Becomes</span>
            <br />
            <span className="text-gold-shimmer italic">Memory.</span>
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            variants={fadeUpVariant}
            className="mt-6 text-text-secondary text-lg sm:text-xl max-w-xl leading-relaxed font-sans"
          >
            Discover our curated collection of rare, authentic fragrances — from
            the smoky depths of Arabian Oud to sun-drenched Mediterranean florals.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUpVariant} className="mt-10 flex flex-wrap gap-4">
            <Link to="/products" className="btn-gold text-base px-8 py-4 rounded-xl group">
              Explore Collection
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link to="/products?tags=bestseller" className="btn-outline-gold text-base px-8 py-4 rounded-xl">
              Bestsellers
            </Link>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={lineVariant}
            className="mt-16 h-px max-w-md origin-left"
            style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.4), transparent)' }}
          />

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            className="mt-8 grid grid-cols-3 gap-8 max-w-sm"
          >
            <StatBadge value="200+"  label="Fragrances" />
            <StatBadge value="10K+"  label="Happy Clients" />
            <StatBadge value="100%"  label="Authentic" />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-text-muted text-xs font-sans tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #C9A84C, transparent)' }}
        />
      </motion.div>
    </section>
  );
}
