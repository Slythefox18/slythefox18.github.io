/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./garlicmustard.html",
    "./weather/weather.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        overpass: ['Overpass, sans-serif'],
      },
    },
  plugins: [],
  }
}
// npx tailwindcss -i ./css/style.css -o ./css/output.css --watch