/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Manuscript surfaces
        paper: '#F4F2EC',     // page background — cool bone, not warm cream
        surface: '#FCFBF7',   // raised cards
        rule: '#E3E0D6',      // hairlines & borders
        highlight: '#F2D86B', // the "highlighter" — citation signature
        ink: {
          DEFAULT: '#1B1D2A', // indigo-black body text
          soft: '#5B5D6B',
          faint: '#8A8B95',
        },
        // Prussian ink — primary accent (links, controls, citation keys)
        prussian: {
          50: '#EEF3F7',
          100: '#D3E1ED',
          200: '#A9C3D9',
          400: '#3F6F9B',
          500: '#1F4E7A',
          600: '#173F62',
          700: '#122F4A',
        },
        // Legacy alias so existing `brand-*` classes keep working
        brand: {
          50: '#EEF3F7',
          100: '#D3E1ED',
          400: '#3F6F9B',
          500: '#1F4E7A',
          600: '#173F62',
          700: '#122F4A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 29, 42, 0.04), 0 8px 24px -16px rgba(27, 29, 42, 0.18)',
        lift: '0 2px 4px rgba(27, 29, 42, 0.06), 0 18px 40px -22px rgba(27, 29, 42, 0.30)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ink-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ink-in': 'ink-in 0.4s ease both',
      },
    },
  },
  plugins: [],
};
