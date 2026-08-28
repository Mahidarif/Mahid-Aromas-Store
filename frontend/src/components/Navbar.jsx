import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

// ─── Announcement Bar Ticker Items (High CRO for Pakistan) ─────────────────────
const ANNOUNCEMENTS = [
  { text: 'Cash on Delivery (COD) Available Nationwide', icon: Truck },
  { text: 'Complimentary Luxury Shipping on Orders Over Rs. 5,000', icon: Sparkles },
  { text: '100% Guaranteed Authentic Haute Parfumerie & Extraits', icon: ShieldCheck },
];

// ─── Navigation Hierarchy ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Collections', href: '/collections' },
  {
    label: 'Gender',
    children: [
      {
        label: 'For Men',
        subtext: 'Smoky woods, regal leather & bold spices',
        href: '/collections?gender=Men',
      },
      {
        label: 'For Women',
        subtext: 'Luminous florals, velvety vanilla & ambers',
        href: '/collections?gender=Women',
      },
      {
        label: 'Unisex Signature',
        subtext: 'Transcendent, boundary-defying compositions',
        href: '/collections?gender=Unisex',
      },
    ],
  },
  {
    label: 'Fragrance Families',
    children: [
      {
        label: 'Oriental & Oud',
        subtext: 'Cambodian agarwood & warm rich resins',
        href: '/collections?fragranceFamily=Oriental',
      },
      {
        label: 'Floral Haute',
        subtext: 'Bulgarian rose, night-blooming jasmine & neroli',
        href: '/collections?fragranceFamily=Floral',
      },
      {
        label: 'Woody Elegance',
        subtext: 'Creamy sandalwood, cedarwood & smoky vetiver',
        href: '/collections?fragranceFamily=Woody',
      },
      {
        label: 'Fresh & Citrus',
        subtext: 'Calabrian bergamot & aquatic sea breeze',
        href: '/collections?fragranceFamily=Fresh',
      },
    ],
  },
  { label: 'Best Sellers', href: '/best-sellers', isPill: true },
  { label: 'Our Story', href: '/#about' },
];

export default function Navbar({ cartCount: propCartCount }) {
  const { openCart, cartCount: contextCartCount } = useCart();
  const cartCount = propCartCount !== undefined ? propCartCount : contextCartCount;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Auto-cycle Announcement Ticker ──────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // ── Scroll detection for luxury frosted glass header ─────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close mobile drawer & search on route change ─────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // ── Auto-focus search input ──────────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isLoggedIn = !!localStorage.getItem('ma_token');

  return (
    <>
      {/* ── 1. Announcement Bar Ticker (COD & Trust Signal) ───────────────────── */}
      <div className="bg-midnight border-b border-white/5 py-2 px-3 sm:px-4 relative z-50 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] sm:text-[11px] font-sans tracking-wider sm:tracking-widest uppercase text-text-muted">
          {/* Left badge */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-gold/90 font-medium">
            <Sparkles size={11} /> Mahid Aromas Haute Parfumerie
          </span>

          {/* Animated Center Ticker */}
          <div className="flex-1 flex justify-center items-center h-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={announcementIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-1.5 text-gold-shimmer font-semibold text-center truncate px-2"
              >
                {(() => {
                  const CurrentIcon = ANNOUNCEMENTS[announcementIdx].icon;
                  return <CurrentIcon size={12} className="text-gold flex-shrink-0" />;
                })()}
                <span className="truncate">{ANNOUNCEMENTS[announcementIdx].text}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right quick link */}
          <Link
            to="/collections?gender=Men"
            className="hidden md:inline hover:text-gold transition-colors text-[10px] tracking-widest"
          >
            Explore Now &rarr;
          </Link>
        </div>
      </div>

      {/* ── 2. Main Luxury Sticky Header (Mobile Optimized Touch Targets) ─────── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-midnight/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2.5 sm:py-3'
            : 'bg-charcoal/95 backdrop-blur-md border-b border-white/5 py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-6">
            
            {/* ── LEFT: Logo & Mobile Hamburger ─────────────────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Large Touch-Target Mobile Hamburger Button (min 40x40px) */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu size={22} />
              </button>

              {/* Brand Logo at the Start */}
              <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <img
                  src="/logo-mark-white.png"
                  alt="Mahid Aromas Logo"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain flex-shrink-0 group-hover:scale-105 transition-transform drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                />
                <div>
                  <span className="font-serif font-bold tracking-[0.18em] sm:tracking-[0.2em] text-sm sm:text-lg text-gold-shimmer block leading-tight">
                    MAHID
                  </span>
                  <span className="font-sans font-light tracking-[0.3em] sm:tracking-[0.35em] text-[8px] sm:text-[10px] text-text-muted uppercase block">
                    AROMAS
                  </span>
                </div>
              </Link>
            </div>

            {/* ── CENTER: Desktop Navigation Links ──────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1.5 flex-1 justify-center">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                        activeDropdown === link.label
                          ? 'text-gold bg-surface-2 font-bold shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/70 font-medium'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          activeDropdown === link.label ? 'rotate-180 text-gold' : 'opacity-60'
                        }`}
                      />
                    </button>

                    {/* High-Visibility Dropdown */}
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          transition={{ duration: 0.18 }}
                          className="absolute top-full left-0 mt-2 w-80 bg-[#0B0F19] border-2 border-gold/40 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[100]"
                        >
                          <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-gold">
                              {link.label} Selection
                            </span>
                            <Sparkles size={11} className="text-gold" />
                          </div>

                          <div className="space-y-1">
                            {link.children.map((child) => (
                              <Link
                                key={child.label}
                                to={child.href}
                                onClick={() => setActiveDropdown(null)}
                                className="block p-3 rounded-xl hover:bg-gold/15 transition-all group border-l-2 border-transparent hover:border-gold"
                              >
                                <p className="text-sm font-sans font-bold text-white group-hover:text-gold transition-colors">
                                  {child.label}
                                </p>
                                {child.subtext && (
                                  <p className="text-xs font-sans text-text-secondary mt-0.5 leading-snug">
                                    {child.subtext}
                                  </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-3.5 py-2 rounded-xl text-xs font-sans tracking-wider uppercase transition-all duration-200 ${
                      link.isPill
                        ? 'bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-midnight font-bold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2/70 font-medium'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* ── RIGHT: Prominent Mobile Touch Targets (Search, Account, Cart) ──── */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Search Icon Button (min 40x40) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-xl text-text-secondary hover:text-gold hover:bg-surface-2 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Search Fragrances"
              >
                <Search size={19} />
              </button>

              {/* Account / Sign In (Temporarily Hidden) */}
              {/* <Link
                to={isLoggedIn ? '/account' : '/login'}
                className="w-10 h-10 rounded-xl text-text-secondary hover:text-gold hover:bg-surface-2 transition-colors hidden sm:flex items-center justify-center"
                aria-label="User Account"
              >
                <User size={19} />
              </Link> */}

              {/* Prominent Cart Trigger with Luminous Counter Badge (min 42x42 on mobile) */}
              <button
                type="button"
                onClick={openCart}
                className="relative min-w-[42px] h-[42px] px-2.5 sm:px-3 rounded-xl bg-surface-2/90 border border-white/10 hover:border-gold/50 text-text-primary hover:text-gold transition-all duration-200 cursor-pointer shadow-card flex items-center justify-center gap-2"
                aria-label={`Cart with ${cartCount} items`}
              >
                <ShoppingBag size={19} className="text-gold" />
                <span className="text-xs font-sans font-semibold hidden md:inline">Bag</span>

                {cartCount > 0 ? (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="min-w-[20px] h-[20px] rounded-full text-midnight text-[11px] font-extrabold flex items-center justify-center px-1 shadow-gold-sm"
                    style={{ background: 'linear-gradient(135deg, #9B7A2A, #E8C97A)' }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20 hidden md:inline" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── 3. Luxury Search Modal Overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-xl flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-2xl bg-charcoal border border-gold/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSearch}
            >
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <span className="text-xs font-sans tracking-widest uppercase text-gold flex items-center gap-1.5 font-bold">
                  <Sparkles size={12} /> Search Haute Parfumerie
                </span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-text-muted hover:text-text-primary p-2 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search perfumes, notes (Oud, Rose, Amber)..."
                  className="input-luxury pl-12 pr-28 py-3.5 text-base w-full bg-surface-2 rounded-xl"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold py-2 px-4 text-xs rounded-lg font-bold"
                >
                  Search
                </button>
              </div>

              {/* Quick Suggestion Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-sans text-text-muted">
                <span>Popular:</span>
                {['For Men', 'For Women', 'Oud Royale', 'Extrait'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      navigate(`/collections?q=${encodeURIComponent(tag)}`);
                      setSearchOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-gold/15 hover:text-gold transition-colors text-[11px]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Full-Height Mobile Drawer Navigation (Slide-in) ─────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-midnight/85 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-midnight border-r border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div>
                <div className="p-5 border-b border-white/8 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo-mark-white.png"
                      alt="Mahid Aromas Logo"
                      className="w-7 h-7 object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
                    />
                    <span className="font-serif font-bold text-sm tracking-widest text-gold-shimmer">
                      MAHID AROMAS
                    </span>
                  </div>

                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl text-text-muted hover:text-text-primary"
                    aria-label="Close navigation"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Quick Gender Select Pills */}
                <div className="p-4 bg-surface-2/50 border-b border-white/5">
                  <p className="text-[10px] font-sans uppercase tracking-widest text-gold font-bold mb-2">
                    Shop by Character:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Link
                      to="/collections?gender=Men"
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 text-center text-xs font-sans font-semibold rounded-lg bg-sky-950/40 text-sky-300 border border-sky-500/20 active:scale-95 transition-transform"
                    >
                      Men
                    </Link>
                    <Link
                      to="/collections?gender=Women"
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 text-center text-xs font-sans font-semibold rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/20 active:scale-95 transition-transform"
                    >
                      Women
                    </Link>
                    <Link
                      to="/collections?gender=Unisex"
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 text-center text-xs font-sans font-semibold rounded-lg bg-gold/10 text-gold border border-gold/20 active:scale-95 transition-transform"
                    >
                      Unisex
                    </Link>
                  </div>
                </div>

                {/* Navigation Links with large tap heights */}
                <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[50vh]">
                  <Link
                    to="/collections"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-sans font-semibold text-text-primary hover:text-gold hover:bg-surface-2 transition-colors"
                  >
                    All Collections
                  </Link>
                  <Link
                    to="/best-sellers"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-sans font-bold text-gold bg-gold/10 border border-gold/20"
                  >
                    <span>Best Sellers</span>
                    <Sparkles size={15} />
                  </Link>

                  <div className="pt-3 pb-1 px-4 text-[10px] font-sans font-bold uppercase tracking-widest text-text-muted">
                    Fragrance Families
                  </div>
                  {[
                    { label: 'Oriental & Oud', href: '/collections?fragranceFamily=Oriental' },
                    { label: 'Floral Haute', href: '/collections?fragranceFamily=Floral' },
                    { label: 'Woody Elegance', href: '/collections?fragranceFamily=Woody' },
                    { label: 'Fresh & Citrus', href: '/collections?fragranceFamily=Fresh' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-xs font-sans text-text-secondary hover:text-gold hover:bg-surface-2 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Footer Details & Account CTA */}
              <div className="p-5 border-t border-white/8 space-y-3 bg-surface-2/40">
                <div className="text-[11px] text-text-muted font-sans flex items-center gap-2">
                  <ShieldCheck size={14} className="text-gold" />
                  <span>Cash on Delivery across Pakistan</span>
                </div>

                {/* Account / Login CTAs (Temporarily Hidden) */}
                {/* {isLoggedIn ? (
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="btn-outline-gold w-full text-xs py-3 text-center block font-semibold"
                  >
                    My Account Portal
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn-outline-gold text-xs py-3 text-center block font-semibold"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-gold text-xs py-3 text-center block font-bold"
                    >
                      Register
                    </Link>
                  </div>
                )} */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
