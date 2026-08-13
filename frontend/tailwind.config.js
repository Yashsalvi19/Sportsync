/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We support manual dark mode via class
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
        // Light mode shadows (for #E0E5EC background)
        'neo': '8px 8px 16px #bec3c9, -8px -8px 16px #ffffff',
        'neo-sm': '4px 4px 8px #bec3c9, -4px -4px 8px #ffffff',
        'neo-inset': 'inset 6px 6px 12px #bec3c9, inset -6px -6px 12px #ffffff',
        'neo-primary': '5px 5px 10px #bec3c9, -5px -5px 10px #ffffff',
        'neo-primary-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.2)',
        
        // Dark mode shadows (for #0E0236 background)
        'neo-dark': '8px 8px 16px rgba(0, 0, 0, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neo-sm-dark': '4px 4px 8px rgba(0, 0, 0, 0.6), -4px -4px 8px rgba(255, 255, 255, 0.05)',
        'neo-inset-dark': 'inset 6px 6px 12px rgba(0, 0, 0, 0.9), inset -6px -6px 12px rgba(255, 255, 255, 0.02)',
        'neo-primary-dark': '5px 5px 10px rgba(0, 0, 0, 0.5), -5px -5px 10px rgba(119, 51, 215, 0.3)',
        'neo-primary-inset-dark': 'inset 4px 4px 8px rgba(0, 0, 0, 0.4), inset -4px -4px 8px rgba(156, 87, 243, 0.4)',
      },
      backdropBlur: {
        'md': '10px',
      }
    },
  },
  plugins: [],
}
