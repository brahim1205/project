/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,html}"
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          primary: '#25D366',
          secondary: '#128C7E',
          dark: '#075E54',
          light: '#DCF8C6',
          gray: '#f0f0f0',
          darkgray: '#4A4A4A'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}