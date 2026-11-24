/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#151515",
          charcoal: "#292929",
          gold: "#D6B878",
          "gold-light": "#E5CE9F",
          "gold-dark": "#B8964E",
          ivory: "#F5F3EF",
          gray: "#EAEAEA",
          muted: "#737373"
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        'luxury': '0.15em',
        'ultra': '0.25em',
      }
    },
  },
  plugins: [],
}
