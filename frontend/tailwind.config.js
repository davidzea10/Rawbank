/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EAB308',
          dark: '#CA8A04',
        },
        secondary: {
          DEFAULT: '#0D9488',
        },
        accent: {
          DEFAULT: '#FACC15',
          dark: '#EAB308',
        },
        text: {
          primary: '#1A202C',
          secondary: '#718096',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F7FAFC',
        },
        danger: '#E53E3E',
        success: '#0D9488',
        warning: '#EAB308',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        light: '0 1px 3px rgba(0,0,0,0.06)',
        medium: '0 4px 12px rgba(0,0,0,0.08)',
        heavy: '0 8px 24px rgba(0,0,0,0.12)',
        card: '0 2px 8px rgba(234,179,8,0.06)',
        cardHover: '0 8px 20px rgba(234,179,8,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
