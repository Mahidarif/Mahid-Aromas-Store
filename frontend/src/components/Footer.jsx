import { Link } from 'react-router-dom';
import { ShieldCheck, RefreshCcw, Truck, Lock, ExternalLink } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Collections', href: '/products' },
    { label: 'New Arrivals',    href: '/products?sort=newest' },
    { label: 'Bestsellers',     href: '/products?tags=bestseller' },
    { label: 'Gift Sets',       href: '/products?tags=gift-set' },
  ],
  Help: [
    { label: 'Track Order',   href: '/track' },
    { label: 'Returns',       href: '/returns' },
    { label: 'FAQ',           href: '/faq' },
    { label: 'Contact Us',    href: '/contact' },
  ],
  Company: [
    { label: 'Our Story',     href: '/about' },
    { label: 'Authenticity',  href: '/authenticity' },
    { label: 'Privacy Policy',href: '/privacy' },
    { label: 'Terms of Use',  href: '/terms' },
  ],
};

const TRUST_BADGES = [
  {
    icon:    <ShieldCheck size={20} className="text-gold" />,
    title:   'SSL Secured',
    desc:    '256-bit encryption',
  },
  {
    icon:    <Lock size={20} className="text-gold" />,
    title:   'Secure Payments',
    desc:    'Stripe & JazzCash',
  },
  {
    icon:    <Truck size={20} className="text-gold" />,
    title:   'Fast Delivery',
    desc:    'TCS · Leopards · Trax',
  },
  {
    icon:    <RefreshCcw size={20} className="text-gold" />,
    title:   'Easy Returns',
    desc:    '7-day return policy',
  },
];

export default function Footer() {
  return (
    <footer className="bg-midnight border-t border-white/5">

      {/* ── Trust badges bar ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0 border border-gold/10">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-sm font-sans font-medium text-text-primary">{badge.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer grid ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #9B7A2A, #E8C97A)' }}>
                <span className="font-serif font-bold text-midnight">M</span>
              </div>
              <div>
                <span className="font-serif font-bold tracking-wide text-xl text-gold-shimmer">MAHID</span>
                <span className="font-serif font-light text-xl text-text-secondary ml-1 tracking-widest"> AROMAS</span>
              </div>
            </Link>

            <p className="text-text-secondary text-sm leading-relaxed max-w-xs font-sans">
              Crafting olfactory experiences that tell stories. Authentic luxury fragrances
              delivered to your door across Pakistan.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-gold hover:border-gold/30 transition-all duration-200"
                aria-label="Instagram"
              >
                <ExternalLink size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-text-muted hover:text-gold hover:border-gold/30 transition-all duration-200"
                aria-label="Facebook"
              >
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Payment badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['Visa', 'Mastercard', 'JazzCash', 'COD'].map((method) => (
                <span
                  key={method}
                  className="px-3 py-1 rounded-md bg-surface border border-white/8 text-text-muted text-xs font-sans"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-sans font-semibold text-text-primary text-sm tracking-widest uppercase mb-5">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-text-secondary hover:text-gold transition-colors duration-200 font-sans"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs font-sans">
            © {new Date().getFullYear()} Mahid Aromas. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-text-muted text-xs font-sans">
            <ShieldCheck size={12} className="text-green-500" />
            <span>Secure &amp; Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
