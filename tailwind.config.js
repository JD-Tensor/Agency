/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FCFBF8',
          100: '#F7F5F0',
          200: '#EFECE4',
          300: '#E3DFD5',
          400: '#C7C2B4',
          500: '#A49F90',
        },
        ink: {
          950: '#141312',
          900: '#1F1E1D',
          800: '#2E2C29',
          700: '#43403B',
          600: '#5E5B54',
          500: '#7F7B72',
          400: '#A39F95',
        },
        clay: {
          50: '#FAF3EE',
          100: '#F5E4D8',
          500: '#D97236',
          600: '#C25E26',
          700: '#A54917',
        },
        forest: {
          50: '#F1F7F4',
          700: '#245147',
          800: '#1B3E36',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

