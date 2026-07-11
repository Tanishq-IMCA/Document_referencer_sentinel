import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLocation } from 'wouter';
import { useState } from 'react';
import GlitchyText from '@/components/ui/GlitchyText';

function HeaderAccentBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [shimKey, setShimKey] = useState(0);
  const [glow, setGlow] = useState(false);
  return (
    <motion.button
      onHoverStart={() => { setShimKey((k) => k + 1); setGlow(true); }}
      onHoverEnd={() => setGlow(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative overflow-hidden px-5 py-2 text-[11px] uppercase tracking-[0.34em] text-black"
      style={{
        backgroundColor: 'var(--accent)',
        borderRadius: 0,
        fontFamily: 'var(--font-display)',
        boxShadow: glow ? '0 0 32px rgba(168,85,247,0.4)' : '0 0 16px rgba(168,85,247,0.18)',
        transition: 'box-shadow 0.25s',
      }}
    >
      <motion.span
        key={shimKey}
        className="pointer-events-none absolute inset-0"
        initial={{ x: '-110%', skewX: '-10deg' }}
        animate={{ x: '250%' }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
      />
      <span className="relative">{children}</span>
    </motion.button>
  );
}

export function Header() {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-50 w-full transition-all duration-500"
      style={{
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        background: scrolled ? 'rgba(5,8,22,0.80)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center justify-between px-8 py-5">
        {/* Logo */}
        <a
          href="/"
          className="text-lg uppercase tracking-[0.3em] text-white cursor-pointer select-none"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <GlitchyText text="SENTINEL" triggerOnMount delay={200} />
        </a>

        {/* Nav */}
        <div className="flex items-center gap-10">
          <a
            href="#about"
            className="hidden md:block text-[11px] uppercase tracking-[0.34em] text-white/30 hover:text-white/70 transition-colors duration-200"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            About Us
          </a>

          <div className="flex items-center gap-3">
            <HeaderAccentBtn onClick={() => navigate('/dashboard')}>Scanner</HeaderAccentBtn>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
