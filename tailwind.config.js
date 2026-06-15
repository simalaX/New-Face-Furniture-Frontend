/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5E3C',
          50: '#F9F3EE',
          100: '#F0E1D0',
          200: '#DFC3A1',
          300: '#CEA572',
          400: '#BD8743',
          500: '#8B5E3C',
          600: '#734E31',
          700: '#5B3D26',
          800: '#432D1B',
          900: '#2B1C10',
        },
        secondary: {
          DEFAULT: '#D9B382',
          50: '#FDF8F1',
          100: '#F8EDD9',
          200: '#F0D9B2',
          300: '#E8C58B',
          400: '#D9B382',
          500: '#C99B59',
          600: '#A87D3E',
          700: '#7F5F2F',
          800: '#564020',
          900: '#2D2010',
        },
        accent: '#F5F1EB',
        dark: '#1E1E1E',
        cream: '#FAF7F2',
        terracotta: '#C4714A',
        walnut: '#5C3D2E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
