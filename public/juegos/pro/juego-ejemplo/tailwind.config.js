/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./js/main.js"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981',
          dark: '#059669',
        }
      },
      fontFamily: {
        fredoka: ['Fredoka', 'Quicksand', 'sans-serif'],
      },
      animation: {
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}