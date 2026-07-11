'use client';

import { motion } from 'framer-motion';

const techStack = [
  {
    name: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Python',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M12 2C9.3 2 7 3.1 7 4.5V7h5v1H5.5C4.1 8 3 9.3 3 12c0 2.8 1.1 4 2.5 4H7v-2.5C7 11.8 9.3 10 12 10s5 1.8 5 3.5V16h1.5c1.4 0 2.5-1.2 2.5-4 0-2.7-1.1-4-2.5-4H17V5.5C17 3.1 14.7 2 12 2zm-1 2.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z" fill="currentColor" opacity="0.7" />
        <path d="M12 14c-2.7 0-5 1.8-5 3.5V19h1.5c1.4 0 2.5-1.2 2.5-4v-1zm1 5.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'FastAPI',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <path d="M12 6l-2 6h4l-4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>
    ),
  },
  {
    name: 'Next.js',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
        <path d="M14 8l-5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <path d="M10 8h4v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'React',
    icon: (
      <svg viewBox="0 0 841.9 595.3" fill="none" className="h-5 w-auto">
        <circle cx="420.9" cy="296.5" r="45.7" fill="currentColor" />
        <ellipse cx="420.9" cy="296.5" rx="234.3" ry="45.7" stroke="currentColor" strokeWidth="14" fill="none" opacity="0.6" />
        <ellipse cx="420.9" cy="296.5" rx="234.3" ry="45.7" stroke="currentColor" strokeWidth="14" fill="none" opacity="0.6" transform="rotate(60 420.9 296.5)" />
        <ellipse cx="420.9" cy="296.5" rx="234.3" ry="45.7" stroke="currentColor" strokeWidth="14" fill="none" opacity="0.6" transform="rotate(120 420.9 296.5)" />
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <rect x="2" y="2" width="20" height="20" rx="1" fill="currentColor" opacity="0.15" />
        <text x="4" y="17" fill="currentColor" fontFamily="monospace" fontWeight="800" fontSize="11">TS</text>
      </svg>
    ),
  },
  {
    name: 'PostgreSQL',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <ellipse cx="12" cy="8" rx="9" ry="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M3 8v8c0 2.2 4 4 9 4s9-1.8 9-4V8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M3 12c0 2.2 4 4 9 4s9-1.8 9-4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'Redis',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M3 12l9-4 9 4-9 4-9-4z" fill="currentColor" opacity="0.5" />
        <path d="M3 16l9-4 9 4-9 4-9-4z" fill="currentColor" opacity="0.3" />
        <path d="M3 8l9-4 9 4-9 4-9-4z" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
  {
    name: 'Semgrep',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Claude AI',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M12 3C8 3 5 6 5 10c0 2.5 1.2 4.7 3 6.1V19l2-1 1.5 1 1.5-1 2 1v-2.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-6-7z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1" />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" opacity="0.8" />
        <circle cx="15" cy="10" r="1.5" fill="currentColor" opacity="0.8" />
        <path d="M9 14c1 1 5 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </svg>
    ),
  },
  {
    name: 'Celery',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M12 4v4M8 6l2 3M16 6l-2 3M5 12h4M15 12h4M8 18l2-3M16 18l-2-3M12 20v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'TailwindCSS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M4 10c2-4 5-4 7 0s5 4 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M4 16c2-4 5-4 7 0s5 4 7 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'Docker',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <rect x="4" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="8" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
        <rect x="12" y="10" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="8" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="12" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
        <path d="M2 14s.5 2 3 2h14c2 0 3-2 3-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M18 13s1-1 2-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'Framer',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M5 4h14v7H5V4z" fill="currentColor" opacity="0.6" />
        <path d="M5 11h7l7 7H5v-7z" fill="currentColor" opacity="0.4" />
        <path d="M5 18h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </svg>
    ),
  },
];

function TechRow({ direction, speed = 40 }: { direction: 'left' | 'right'; speed?: number }) {
  const row = [...techStack, ...techStack, ...techStack];
  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #050816, transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #050816, transparent)' }}
      />
      <motion.div
        className="flex items-center gap-12 py-4"
        animate={{
          x: direction === 'left' ? ['0%', '-33.333%'] : ['-33.333%', '0%'],
        }}
        transition={{
          x: { duration: speed, repeat: Infinity, ease: 'linear' },
        }}
      >
        {row.map((tech, i) => (
          <div
            key={`${tech.name}-${i}`}
            className="flex items-center gap-2.5 text-white/30 hover:text-white/70 transition-all duration-500 cursor-default shrink-0 group"
          >
            <div className="w-8 h-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {tech.icon}
            </div>
            <span
              className="text-[11px] uppercase tracking-[0.28em] whitespace-nowrap"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {tech.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function TechCarousel() {
  return (
    <section className="relative border-y border-white/[0.05] py-8 overflow-hidden">
      <div className="mx-auto max-w-7xl px-8 mb-6">
        <p
          className="text-[10px] uppercase tracking-[0.48em] text-white/20 text-center"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Powered By
        </p>
      </div>
      <TechRow direction="left" speed={45} />
      <TechRow direction="right" speed={55} />
    </section>
  );
}
