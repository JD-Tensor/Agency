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
          50: 'rgb(var(--c-parchment-50) / <alpha-value>)',
          100: 'rgb(var(--c-parchment-100) / <alpha-value>)',
          200: 'rgb(var(--c-parchment-200) / <alpha-value>)',
          300: 'rgb(var(--c-parchment-300) / <alpha-value>)',
          400: 'rgb(var(--c-parchment-400) / <alpha-value>)',
          500: 'rgb(var(--c-parchment-500) / <alpha-value>)',
        },
        ink: {
          950: 'rgb(var(--c-ink-950) / <alpha-value>)',
          900: 'rgb(var(--c-ink-900) / <alpha-value>)',
          800: 'rgb(var(--c-ink-800) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          600: 'rgb(var(--c-ink-600) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
          400: 'rgb(var(--c-ink-400) / <alpha-value>)',
        },
        clay: {
          50: 'rgb(var(--c-clay-50) / <alpha-value>)',
          100: 'rgb(var(--c-clay-100) / <alpha-value>)',
          500: 'rgb(var(--c-clay-500) / <alpha-value>)',
          600: 'rgb(var(--c-clay-600) / <alpha-value>)',
          700: 'rgb(var(--c-clay-700) / <alpha-value>)',
        },
        forest: {
          50: 'rgb(var(--c-forest-50) / <alpha-value>)',
          700: 'rgb(var(--c-forest-700) / <alpha-value>)',
          800: 'rgb(var(--c-forest-800) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

