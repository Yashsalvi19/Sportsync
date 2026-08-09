/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We will support manual or system dark mode
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#7733D7',
          50: '#F5EFFC',
          100: '#DBC2FA',
          200: '#BA8AF5',
          300: '#9C57F3',
          500: '#7733D7',
          600: '#492489',
          900: '#0E0236',
        },
        secondary: '#492489',
        accent: '#9C57F3',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        card: 'var(--card-bg)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 4px 30px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        'md': '10px',
      }
    },
  },
  plugins: [],
}
