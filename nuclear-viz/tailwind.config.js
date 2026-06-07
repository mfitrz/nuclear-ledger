/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        terminal: {
          bg: '#0a0900',
          panel: '#0d0c00',
          primary: '#c9a800',
          bright: '#f0cc00',
          dim: '#8a7c00',
          dimmer: '#2a2600',
          border: 'rgba(201,168,0,0.25)',
          red: '#c83030',
          blue: '#3070c8',
          purple: '#9030c8',
          orange: '#c86020',
          green: '#30c870',
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        scanline: 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
