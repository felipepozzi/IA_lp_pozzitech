/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/views/**/*.ejs'],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        secondary: '#111827',
        accent: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#818CF8',
        },
        highlight: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
        },
        surface: '#F9FAFB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
        glow: '0 0 40px rgba(79,70,229,0.25)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,70,229,0.2)' },
          '50%': { boxShadow: '0 0 60px rgba(79,70,229,0.5)' },
        },
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
};
