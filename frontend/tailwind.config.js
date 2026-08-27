/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sistema visual Warm Cream (Modo Claro editorial)
        cream: {
          50: '#fcfaf4',
          100: '#f6f3ea',
          200: '#f0ebdd',
          300: '#e7e0ce',
          400: '#ddd3ba',
          500: '#cfc3a4',
        },
        ivory: '#ffffff',
        sand: {
          300: '#e5decf',
          400: '#d9d0bc',
          500: '#cabfa6',
        },
        ink: {
          DEFAULT: '#2a2723',
          soft: '#4a453d',
          muted: '#8a837a',
        },
        // --- Acentos Dorados Industriales
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // --- Slate & Gold (Modo Oscuro)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
        'gold-glow-lg': '0 0 35px -5px rgba(217, 119, 6, 0.4)',
        'cream-soft': '0 4px 24px -12px rgba(122, 108, 82, 0.18)',
        'cream-panel': '0 10px 40px -18px rgba(122, 108, 82, 0.28)',
      },
      backgroundImage: {
        'gold-fume': 'radial-gradient(120% 120% at 50% 0%, #fcfaf4 0%, #f6f3ea 55%, #f0ebdd 100%)',
      },
    },
  },
  plugins: [],
};