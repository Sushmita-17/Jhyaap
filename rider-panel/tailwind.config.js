export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: { 950: '#0A0A0A', 900: '#141414', 800: '#161616', 700: '#222222', 500: '#888888', 400: '#DDDDDD', 200: '#FFFFFF' },
        gold: { primary: '#C9A84C', hover: '#D9B85C' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Inter', 'system-ui', 'sans-serif'], mono: ['DM Mono', 'monospace'] },
    },
  },
  plugins: [],
}

