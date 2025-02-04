/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C5CFF', // Purple accent color
          hover: '#6B4EE6',
        },
        secondary: {
          DEFAULT: '#FF4B8C', // Pink accent
          hover: '#E6437D',
        },
        dark: {
          DEFAULT: '#1A1B2F', // Dark blue background
          lighter: '#252642',
          card: '#2A2C45',
        },
        light: {
          DEFAULT: '#F8F9FF',
          muted: '#B4B7C9',
        }
      }
    },
  },
  plugins: [],
};