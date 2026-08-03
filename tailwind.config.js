/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: colors.white,
          light: colors.gray[100],
        },
        secondary: {
          DEFAULT: '#4f46e5', // A vibrant indigo
          dark: '#4338ca',    // A darker shade for hover states
        },
        'text-primary': colors.gray[800],   // Main text color
        'text-secondary': colors.gray[600], // Lighter text for subtitles
        'text-accent': '#4f46e5',          // Accent text color for links
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
