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
        wine: {
          50: '#fff0f4',
          100: '#fbd6e0',
          200: '#f28da5',
          300: '#e04a6f',
          400: '#c42b4e',
          500: '#a11d3b',
          600: '#85162e',
          700: '#6b1124',
          800: '#540c1b',
          900: '#3b0813',
          950: '#23040a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
