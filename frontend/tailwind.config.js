export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        cream: '#faf9f7',
        sand: '#f4eee7',
        ink: '#1f1d1a',
        muted: '#6b6560',
        line: '#e6ded4',
        tan: '#d4a574',
        peach: '#e89f71',
        sage: '#a8d5ba',
        night: '#141311',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wordmark: '0.32em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(31,29,26,0.04), 0 12px 32px -18px rgba(31,29,26,0.18)',
        lift: '0 2px 4px rgba(31,29,26,0.05), 0 30px 60px -30px rgba(31,29,26,0.28)',
      },
    },
  },
  plugins: [],
};
