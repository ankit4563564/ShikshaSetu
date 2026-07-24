/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: 'var(--midnight)',
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        
        // Custom EduSync / ShikshaSetu Premium Colors
        'deep-teal': '#1F4E5F',
        marigold: '#E8A33D',
        sage: '#6B9080',
        'warm-clay': '#C1502E',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        serif: ['"Source Serif 4"', 'serif'],
      },
    },
  },
  plugins: [],
};
