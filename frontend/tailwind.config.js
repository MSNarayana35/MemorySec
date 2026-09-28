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
        soc: {
          bg: '#0B0F17',
          card: '#111827',
          cardHover: '#1F2937',
          border: '#1E293B',
          cyan: '#0EA5E9',
          indigo: '#6366F1',
          crimson: '#EF4444',
          orange: '#F97316',
          amber: '#F59E0B',
          emerald: '#10B981',
          slate: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
