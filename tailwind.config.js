/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        navy: {
          950: '#060E1E',
          900: '#0B172A',
          800: '#112239',
          700: '#1A3150',
        },
        cyan: {
          400: '#00C2FF',
          500: '#00A3D9',
        },
      },
    },
  },
  plugins: [],
};
