/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6edf5',
          100: '#ccdaeb',
          500: '#1a4f8a',
          600: '#154077',
          700: '#003366',
          800: '#002855',
          900: '#001d3d',
        },
        accent: {
          400: '#f5a623',
          500: '#e8960f',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
