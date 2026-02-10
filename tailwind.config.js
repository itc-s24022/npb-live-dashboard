/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1d29',
          card: '#242837',
          border: '#2d3142',
        },
        light: {
          bg: '#f5f5f5',
          card: '#ffffff',
          border: '#e0e0e0',
        },
        primary: {
          green: '#00c853',
        },
      },
    },
  },
  plugins: [],
}
