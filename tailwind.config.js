/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple:     '#6b65ff',
        'purple-10':'#7A74FF',
        'purple-80':'#E1E0FF',
        'purple-90':'#F0F0FF',
        yellow:     '#d2ff66',
        'light-grey':'#F7F7F2',
        'warm-grey': '#e1dad4',
        muted:      '#5a5a5a',
        ink:        '#0a0a0a',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        brand: '12px',
      },
    },
  },
  plugins: [],
};
