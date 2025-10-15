/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-grey': '#292929',
        'brown': '#5C5049',
        'light-grey': '#AEACA7',
        'beige': '#B09585',
        'white': '#DFDDD8',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      letterSpacing: {
        'custom': '0.2em',
      }
    },
  },
  plugins: [],
}