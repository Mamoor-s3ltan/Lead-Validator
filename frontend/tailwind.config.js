/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF9',
        ink: '#1B1A17',
        border: '#E3E1DB',
        secondary: '#736F68',
        accent: '#2F5D50',
        error: '#B23A2F',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
};