import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e27',
        'bg-secondary': '#0d1230',
        'bg-card': 'rgba(255,255,255,0.04)',
        blue: {
          accent: '#00d9ff',
          glow: 'rgba(0,217,255,0.15)',
          dim: 'rgba(0,217,255,0.08)',
        },
        purple: {
          accent: '#a78bfa',
          glow: 'rgba(167,139,250,0.15)',
        },
        'glass-border': 'rgba(255,255,255,0.08)',
        'glass-border-hover': 'rgba(255,255,255,0.14)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'radial-blue': 'radial-gradient(ellipse at 50% 0%, rgba(0,217,255,0.12) 0%, transparent 70%)',
        'radial-purple': 'radial-gradient(ellipse at 80% 50%, rgba(167,139,250,0.08) 0%, transparent 60%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'glass-hover': 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
        'btn-primary': 'linear-gradient(135deg, rgba(0,217,255,0.15) 0%, rgba(167,139,250,0.15) 100%)',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '64px 64px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'blue-glow': '0 0 40px rgba(0,217,255,0.2), 0 0 80px rgba(0,217,255,0.05)',
        'blue-glow-sm': '0 0 20px rgba(0,217,255,0.15)',
        'purple-glow': '0 0 40px rgba(167,139,250,0.2)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out infinite 2s',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(0.5deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-0.5deg)' },
        },
        scanLine: {
          '0%': { top: '0%', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};
export default config;
