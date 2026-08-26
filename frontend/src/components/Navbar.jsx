import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from 'lucide-react';

// ─── Nav Links Definition ──────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Collections', href: '/products' },
  { label: 'New Arrivals', href: '/products?sort=newest' },
  {
    label: 'Families',
    children: [
      { label: 'Oriental & Oud',  href: '/products?fragranceFamily=Oriental+%2F+Gourmand' },
      { label: 'Floral',          href: '/products?fragranceFamily=Floral' },
      { label: 'Woody',           href: '/products?fragranceFamily=Woody' },
      { label: 'Fresh & Citrus',  href: '/products?fragranceFamily=Fresh+%2F+Citrus' },
    ],
  },
  { label: 'About', href: '/about' },
];

export default function Navbar({ cartCount = 0 }) {
  const [scrolled,        setScrolled]        = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeDropdown,  setActiveDropdown]  = useState(null);
  const searchRef  = useRef(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  // ── Scroll detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close mobile menu on route change ────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // ── Focus search input when opened ────────────────────────────────────────
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isLoggedIn = !!localStorage.getItem('ma_token');

  return (
    <>
      {/* ── Announcement bar ────────────────────────────────────────────── */}
      <div className="bg-midnight text-center py-2 px-4 text-xs font-sans tracking-widest text-gold/80 uppercase border-b border-white/5">
        Free shipping on orders over PKR 5,000 &nbsp;|&nbsp; Authentic luxury fragrances
      </div>

      {/* ── Main navbar ─────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-luxury ${
          scrolled
            ? 'glass border-b border-white/8 shadow-card'
            : 'bg-transparent border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #9B7A2A, #E8C97A)' }}>
                <span className="font-serif font-bold text-midnight text-sm">M</span>
              </div>
              <div>
                <span className="font-serif font-bold tracking-wide text-lg text-gold-shimmer">
                  MAHID
                </span>
                <span className="font-serif font-light text-lg text-text-secondary ml-1 tracking-widest">
                  AROMAS
                </span>
              </div>
            </Link>

            {/* ── Desktop nav links ─────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className="flex items-center gap-1 btn-ghost text-sm tracking-wide">
                      {link.label}
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                          activeDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-52 glass rounded-xl border border-white/8 overflow-hidden shadow-card"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block px-4 py-3 text-sm text-text-secondary hover:text-gold hover:bg-surface-2 transition-all duration-150 border-b border-white/5 last:border-0"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="btn-ghost text-sm tracking-wide"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* ── Right actions ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-ghost p-2.5 rounded-lg"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Account */}
              <Link
                to={isLoggedIn ? '/account' : '/login'}
                className="btn-ghost p-2.5 rounded-lg hidden sm:flex"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="btn-ghost p-2.5 rounded-lg relative"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full
                               text-midnight text-[10px] font-bold flex items-center justify-center px-1"
                    style={{ background: 'linear-gradient(135deg, #9B7A2A, #E8C97A)' }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn-ghost p-2.5 rounded-lg lg:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search overlay ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start pt-24 justify-center px-4"
            style={{ background: 'rgba(10,14,26,0.9)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSearch}
            >
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search fragrances, notes, brands…"
                  className="input-luxury pl-12 pr-24 py-4 text-base rounded-2xl"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-gold py-2 px-4 text-xs rounded-lg">
                  Search
                </button>
              </div>
              <p className="text-center text-text-muted text-xs mt-3">Press Esc to close</p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-80 glass border-l border-white/8 flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between px-6 h-18 border-b border-white/8">
              <span className="font-serif text-gold font-semibold">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {NAV_LINKS.map((link) => (
                link.children ? (
                  <div key={link.label}>
                    <p className="text-text-muted text-xs font-sans tracking-widest uppercase px-3 pt-4 pb-2">
                      {link.label}
                    </p>
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="block px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-gold hover:bg-surface transition-all duration-150"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="block px-3 py-2.5 rounded-lg text-sm text-text-primary hover:text-gold hover:bg-surface transition-all duration-150"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="px-4 pb-8 border-t border-white/8 pt-4 space-y-3">
              {isLoggedIn ? (
                <Link to="/account" className="btn-outline-gold w-full">My Account</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-outline-gold w-full">Sign In</Link>
                  <Link to="/register" className="btn-gold w-full">Create Account</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
