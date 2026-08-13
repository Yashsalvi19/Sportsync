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
        'neo': '8px 8px 16px rgba(0, 0, 0, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neo-dark': '8px 8px 16px rgba(0, 0, 0, 0.9), -8px -8px 16px rgba(255, 255, 255, 0.02)',
        'neo-sm': '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.05)',
        'neo-sm-dark': '4px 4px 8px rgba(0, 0, 0, 0.9), -4px -4px 8px rgba(255, 255, 255, 0.02)',
        'neo-inset': 'inset 6px 6px 12px rgba(0, 0, 0, 0.6), inset -6px -6px 12px rgba(255, 255, 255, 0.05)',
        'neo-inset-dark': 'inset 6px 6px 12px rgba(0, 0, 0, 0.9), inset -6px -6px 12px rgba(255, 255, 255, 0.02)',
        'neo-primary': '5px 5px 10px rgba(0, 0, 0, 0.5), -5px -5px 10px rgba(119, 51, 215, 0.3)',
        'neo-primary-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.4), inset -4px -4px 8px rgba(156, 87, 243, 0.4)',
      },
      backdropBlur: {
        'md': '10px',
      }
    },
  },
  plugins: [],
}
