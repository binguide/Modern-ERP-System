/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#d6e4ff',
          500: '#1677ff',
          600: '#0958d9',
          700: '#003eb3',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
