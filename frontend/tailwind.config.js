/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#020202', // Deepest Charcoal/Black
        surface: '#111111', // Matte Black
        primary: '#FFFFFF', // Pure White
        secondary: '#A1A1AA', // Neutral Grey
        accent: '#3B82F6', // Refined Royal Blue
        // Keeping semantic names for compatibility if needed, but mapping to new palette
        error: '#EF4444',
        success: '#10B981',
      },
      borderRadius: {
        DEFAULT: '2px',
        'none': '0',
        'sm': '1px',
        'md': '2px',
        'lg': '4px',
        'xl': '8px',
        '2xl': '12px',
        '3xl': '16px',
        'full': '9999px',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '-0.01em', // Slightly tighter default
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      backgroundImage: {
        'subtle-grid': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.03)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      },
    },
  },
  plugins: [],
}