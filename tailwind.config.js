/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom palette based on request
        brand: {
          light: '#F7F7F7', // background
          subtle: '#EEEEEE',
          dark: '#393E46',  // headings / accents
          muted: '#929AAB', // text secondary
        },
        surface: '#F7F7F7',
        border: '#EEEEEE',
        text: {
          base: '#393E46',
          muted: '#929AAB',
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-up': 'fadeInUp 1s ease-out',
        'slide-down': 'slideDown 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
