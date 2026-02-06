/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#001F54',
          50: '#E6EBF5',
          100: '#CDD7EB',
          200: '#9BB0D7',
          300: '#6988C3',
          400: '#3761AF',
          500: '#001F54',
          600: '#001943',
          700: '#001332',
          800: '#000C22',
          900: '#000611',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        orange: {
          DEFAULT: '#FF8C42',
          50: '#FFE8DC',
          100: '#FFD9C8',
          200: '#FFBB9F',
          300: '#FF9C77',
          400: '#FF8C42',
          500: '#FF6A0D',
          600: '#D85100',
          700: '#A13D00',
          800: '#6A2900',
          900: '#331400',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

