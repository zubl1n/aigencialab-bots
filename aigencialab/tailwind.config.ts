import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark:    '#2563eb',
        },
        accent:  '#10b981',
        purple:  '#8b5cf6',
        slate: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-up':    'fadeUp .6s ease forwards',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
