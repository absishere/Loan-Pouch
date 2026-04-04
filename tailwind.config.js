/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
      },
      colors: {
        'clay-bg': 'rgba(255, 255, 255, 0.25)',
        'clay-border': 'rgba(255, 255, 255, 0.18)',
      },
    },
  },
  plugins: [],
}

