/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#0A0A0A', // Page background
          900: '#141414', // Announcement bar bg / secondary header
          800: '#161616', // Card background
          700: '#222222', // Card border
          600: '#100A07', // Deepest black
          500: '#888888', // Muted text (brightness floor)
          400: '#DDDDDD', // Nav links default
          300: '#AAAAAA', // Brand name / Brighter muted
          200: '#FFFFFF', // Primary text
          100: '#F5F0E8', // Image background (warm cream)
          border: '#1A1A1A',
        },
        gold: {
          primary: '#F5A623',
          hover: '#D4880B',
          glow: 'rgba(245,166,35,0.10)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        display: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'swing': 'swing 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 160, 23, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 160, 23, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        swing: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        }
      }
    },
  },
  plugins: [],
}