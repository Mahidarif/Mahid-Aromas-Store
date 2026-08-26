/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {

      // ─── Luxury Colour Palette ──────────────────────────────────────────────
      colors: {
        // Backgrounds & surfaces
        midnight:  '#0A0E1A',     // deepest background
        charcoal:  '#12182B',     // primary background
        surface:   '#1A2035',     // card & panel surfaces
        'surface-2': '#1E2640',   // slightly elevated surface

        // Gold accent family
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E8C97A',
          pale:    '#F5E4B4',
          dark:    '#9B7A2A',
        },

        // Champagne & cream
        champagne: '#F7E7CE',
        cream:     '#FAF6F0',

        // Text
        'text-primary':   '#F0EBE1',   // warm off-white
        'text-secondary': '#9CA3AF',   // muted gray
        'text-muted':     '#5C677D',   // very muted

        // Status
        success: '#22C55E',
        error:   '#EF4444',
        warning: '#F59E0B',
      },

      // ─── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        serif:  ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans:   ['"Inter"', 'system-ui', 'Helvetica', 'Arial', 'sans-serif'],
      },

      // ─── Font sizes ─────────────────────────────────────────────────────────
      fontSize: {
        '2xs':  ['0.625rem', { lineHeight: '1rem' }],
        '7xl':  ['4.5rem',   { lineHeight: '1.1' }],
        '8xl':  ['6rem',     { lineHeight: '1' }],
        '9xl':  ['8rem',     { lineHeight: '1' }],
      },

      // ─── Spacing ─────────────────────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '88':  '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ─── Border radius ────────────────────────────────────────────────────────
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '2rem',
      },

      // ─── Box shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        'gold-sm':  '0 0 15px rgba(201, 168, 76, 0.15)',
        'gold':     '0 0 30px rgba(201, 168, 76, 0.25)',
        'gold-lg':  '0 0 60px rgba(201, 168, 76, 0.35)',
        'card':     '0 4px 32px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 48px rgba(0, 0, 0, 0.55)',
        'inner-gold': 'inset 0 0 20px rgba(201, 168, 76, 0.08)',
      },

      // ─── Background gradients (via backgroundImage) ───────────────────────
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':     'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-shine':         'linear-gradient(135deg, #9B7A2A 0%, #E8C97A 50%, #9B7A2A 100%)',
        'surface-gradient':   'linear-gradient(180deg, #1A2035 0%, #12182B 100%)',
        'hero-gradient':      'linear-gradient(to bottom, rgba(10,14,26,0.3) 0%, rgba(10,14,26,0.7) 60%, rgba(10,14,26,0.95) 100%)',
      },

      // ─── Keyframe animations ─────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 168, 76, 0)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(201, 168, 76, 0.25)' },
        },
      },
      animation: {
        shimmer:      'shimmer 3s linear infinite',
        'fade-up':    'fade-up 0.6s ease forwards',
        float:        'float 4s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2.5s ease-in-out infinite',
      },

      // ─── Backdrop blur ────────────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ─── Transition timings ────────────────────────────────────────────────
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  plugins: [],
};
