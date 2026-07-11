import { motion } from 'framer-motion';

const techStack = [
  {
    name: 'PDF',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <rect x="4" y="2" width="16" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <text x="6.5" y="15" fill="currentColor" fontFamily="monospace" fontWeight="800" fontSize="7">PDF</text>
      </svg>
    ),
  },
  {
    name: 'Tesseract OCR',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.7" />
        <line x1="12" y1="1" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Node.js',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M12 2l8 4.6v10.8L12 22l-8-4.6V6.6L12 2z" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M12 8l4 2.3v4.4L12 17l-4-2.3v-4.4L12 8z" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Express',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M2 15c1.5 2 3.5 3 6 3 3.5 0 5.5-2.5 6.5-6M2 15h14M17 9c1.5 0 2.5 1.2 2.5 3s-1 3-2.5 3M17 9c-1.5 0-2.5 1.2-2.5 3s1 3 2.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
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
    name: 'Multer',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M12 3v12M12 15l-4-4M12 15l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d="M4 17v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'WASM',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <text x="5" y="15" fill="currentColor" fontFamily="monospace" fontWeight="800" fontSize="7">WASM</text>
      </svg>
    ),
  },
  {
    name: 'Vite',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M12 2l9 4-9 16-9-16 9-4z" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M12 8l4 2-4 8-4-8 4-2z" fill="currentColor" opacity="0.5" />
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
    name: 'Zod',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-auto">
        <path d="M5 5h14M5 19h14M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
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
