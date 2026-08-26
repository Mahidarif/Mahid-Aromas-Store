import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Wind, Heart, Anchor } from 'lucide-react';

// ─── Per-tier config ───────────────────────────────────────────────────────────
// Each tier has its own colour palette, icon, label, and width constraint
// so the pyramid narrows from bottom (base) → top (top notes).
const TIERS = [
  {
    key:         'top',
    label:       'Top Notes',
    sublabel:    'First impression · fades in 15–30 min',
    Icon:        Wind,
    colorFrom:   'from-blue-400/20',
    colorTo:     'to-indigo-500/10',
    borderColor: 'border-blue-400/25',
    iconColor:   'text-blue-300',
    noteColor:   'bg-blue-400/10 text-blue-200 border-blue-400/20',
    dotColor:    'bg-blue-400',
    widthClass:  'max-w-xs',             // narrowest — top of pyramid
  },
  {
    key:         'heart',
    label:       'Heart Notes',
    sublabel:    'Core character · lasts 2–4 hours',
    Icon:        Heart,
    colorFrom:   'from-rose-400/20',
    colorTo:     'to-pink-500/10',
    borderColor: 'border-rose-400/25',
    iconColor:   'text-rose-300',
    noteColor:   'bg-rose-400/10 text-rose-200 border-rose-400/20',
    dotColor:    'bg-rose-400',
    widthClass:  'max-w-sm',             // medium
  },
  {
    key:         'base',
    label:       'Base Notes',
    sublabel:    'Deep foundation · lingers for hours',
    Icon:        Anchor,
    colorFrom:   'from-amber-500/20',
    colorTo:     'to-yellow-600/10',
    borderColor: 'border-amber-500/25',
    iconColor:   'text-amber-300',
    noteColor:   'bg-amber-500/10 text-amber-200 border-amber-500/20',
    dotColor:    'bg-amber-400',
    widthClass:  'max-w-full',           // widest — base of pyramid
  },
];

// ─── Stagger variants ──────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const tierVariant = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const noteVariant = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Note Pill ─────────────────────────────────────────────────────────────────
function NotePill({ note, colorClass }) {
  return (
    <motion.span
      variants={noteVariant}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-sans border ${colorClass} backdrop-blur-sm`}
    >
      {note}
    </motion.span>
  );
}

// ─── Single Tier Row ──────────────────────────────────────────────────────────
function PyramidTier({ tier, notes = [], index }) {
  const { label, sublabel, Icon, colorFrom, colorTo, borderColor, iconColor, noteColor, dotColor, widthClass } = tier;

  if (notes.length === 0) return null;

  return (
    <motion.div
      variants={tierVariant}
      className={`w-full ${widthClass} mx-auto`}
    >
      {/* Tier card */}
      <div
        className={`relative rounded-2xl border ${borderColor} bg-gradient-to-br ${colorFrom} ${colorTo} p-4 sm:p-5`}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {/* Left accent bar */}
        <div className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${dotColor} opacity-60`} />

        {/* Header row */}
        <div className="flex items-center gap-3 mb-3 pl-2">
          <div className={`flex-shrink-0 w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center`}>
            <Icon size={14} className={iconColor} />
          </div>
          <div>
            <h4 className={`font-serif text-sm font-semibold ${iconColor}`}>{label}</h4>
            <p className="text-text-muted text-[10px] font-sans mt-0.5 leading-none">{sublabel}</p>
          </div>
          <div className="ml-auto text-text-muted text-[10px] font-sans">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>

        {/* Note pills — staggered reveal */}
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
          className="flex flex-wrap gap-1.5 pl-2"
        >
          {notes.map((note) => (
            <NotePill key={note} note={note} colorClass={noteColor} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Connector line between tiers ────────────────────────────────────────────
function TierConnector() {
  return (
    <div className="flex items-center justify-center my-1 z-10">
      <div className="w-px h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(201,168,76,0.3), rgba(201,168,76,0.05))' }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * ScentPyramid
 *
 * @param {{ top: string[], heart: string[], base: string[] }} notes
 * @param {boolean} [compact]  — smaller padding for modal/sidebar use
 */
export default function ScentPyramid({ notes = {}, compact = false }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const { top = [], heart = [], base = [] } = notes;
  const hasAnyNotes = top.length || heart.length || base.length;

  if (!hasAnyNotes) {
    return (
      <div className="text-center py-8 text-text-muted text-sm font-sans">
        Scent notes not available for this fragrance.
      </div>
    );
  }

  return (
    <div ref={ref} className={compact ? '' : 'py-2'}>
      {/* Section header */}
      {!compact && (
        <div className="mb-6 text-center">
          <h3 className="font-serif text-xl font-semibold text-text-primary">Scent Pyramid</h3>
          <div className="divider-gold mt-2" />
          <p className="text-text-muted text-xs font-sans mt-3 max-w-xs mx-auto">
            Fragrances unfold in layers — from the first impression to the lasting signature.
          </p>
        </div>
      )}

      {/* Visual triangle indicator (decorative) */}
      <div className="flex justify-center mb-4">
        <svg width="80" height="44" viewBox="0 0 80 44" fill="none" aria-hidden="true">
          {/* Triangle outline */}
          <path d="M40 4 L74 40 H6 Z" stroke="rgba(201,168,76,0.25)" strokeWidth="1" fill="none" />
          {/* Tier dividers */}
          <line x1="17" y1="29" x2="63" y2="29" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8" />
          <line x1="28" y1="18" x2="52" y2="18" stroke="rgba(201,168,76,0.15)" strokeWidth="0.8" />
          {/* Tier labels inside triangle */}
          <text x="40" y="13" textAnchor="middle" fontSize="5" fill="rgba(147,197,253,0.7)" fontFamily="serif">TOP</text>
          <text x="40" y="25" textAnchor="middle" fontSize="5" fill="rgba(251,113,133,0.7)" fontFamily="serif">HEART</text>
          <text x="40" y="37" textAnchor="middle" fontSize="5" fill="rgba(251,191,36,0.7)"  fontFamily="serif">BASE</text>
        </svg>
      </div>

      {/* Staggered tier cards — top → heart → base (pyramid order) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="flex flex-col items-center gap-0"
      >
        <PyramidTier tier={TIERS[0]} notes={top}   index={0} />
        {top.length > 0 && heart.length > 0 && <TierConnector />}
        <PyramidTier tier={TIERS[1]} notes={heart} index={1} />
        {heart.length > 0 && base.length > 0 && <TierConnector />}
        <PyramidTier tier={TIERS[2]} notes={base}  index={2} />
      </motion.div>
    </div>
  );
}
