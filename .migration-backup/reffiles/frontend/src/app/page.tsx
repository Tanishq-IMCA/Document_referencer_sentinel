'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Landing/Header';
import GlitchyText from '@/components/ui/GlitchyText';
import { SegmentBar } from '@/components/ui/SegmentBar';
import TechCarousel from '@/components/Landing/TechCarousel';

// ─── DATA ───────────────────────────────────────────────────────────────────

const CLI_LINES = [
  { text: '> reposight audit engine v1.0.0', delay: 0 },
  { text: '> connecting to github api...', delay: 350 },
  { text: '> neural analysis modules loaded', delay: 700 },
  { text: '> all systems nominal ✓', delay: 1050, accent: true },
];

const SAMPLE_SCORES = [
  { label: 'OVERALL', value: 84 },
  { label: 'SECURITY', value: 73 },
  { label: 'COMPLEXITY', value: 91 },
  { label: 'COVERAGE', value: 68 },
  { label: 'MAINTAIN', value: 79 },
];

const STATS = [
  { value: '2.4M+', label: 'Lines Analyzed' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '<90s', label: 'Avg Scan Time' },
  { value: '12+', label: 'Dimensions Measured' },
];

const FEATURES = [
  {
    tag: '01 — ANALYSIS',
    heading: 'DEEP CODE INTELLIGENCE',
    body: 'AST-level analysis across your entire codebase. Complexity, coupling, test coverage, and security surface — measured and reported with machine precision.',
    visual: 'code',
  },
  {
    tag: '02 — AUDIT',
    heading: 'HONEST SKILL ASSESSMENT',
    body: 'Cross-reference your resume claims against your actual commit history. We find the gaps before employers do.',
    visual: 'audit',
  },
  {
    tag: '03 — SECURITY',
    heading: 'VULNERABILITY SURFACE',
    body: 'Static analysis for dependency vulnerabilities, injection vectors, secrets exposure, and insecure patterns across every file.',
    visual: 'security',
  },
  {
    tag: '04 — REPORTS',
    heading: 'AUDIT-GRADE REPORTS',
    body: 'Professional, exportable PDF reports you can attach to job applications or share with engineering leads.',
    visual: 'report',
  },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function CliLine({ text, delay, accent }: { text: string; delay: number; accent?: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="text-[11px] leading-relaxed"
      style={{
        fontFamily: 'var(--font-mono)',
        color: accent ? 'var(--accent)' : 'rgba(255,255,255,0.28)',
      }}
    >
      {text}
    </motion.div>
  );
}

/** macOS audit window with switchable AUDIT ENGINE / RESULTS tabs */
function MacWindow() {
  const [activeTab, setActiveTab] = useState<'AUDIT ENGINE' | 'RESULTS'>('AUDIT ENGINE');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setScanning(true);
      let p = 0;
      const iv = setInterval(() => {
        p += 4 + 4; // deterministic-ish for SSR safety — actual randomness only in effect
        setScanProgress(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(iv);
          setScanning(false);
          setScanDone(true);
          setTimeout(() => setActiveTab('RESULTS'), 500);
        }
      }, 85);
    }, 3500);
    return () => clearTimeout(t1);
  }, []);

  const TABS = ['AUDIT ENGINE', 'RESULTS'] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Ambient glow */}
      <div
        className="absolute -inset-8 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.07) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />

      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 0,
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 2px 0 rgba(255,255,255,0.03) inset, 0 32px 80px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.4)',
          background: 'rgba(7,9,20,0.97)',
        }}
      >
        {/* ── Window Chrome ── */}
        <div
          className="flex items-center gap-0 px-4 border-b"
          style={{
            height: 38,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-2 mr-5">
            {[
              { color: '#ff5f56' },
              { color: '#ffbd2e' },
              { color: '#27c93f' },
            ].map((btn, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full cursor-default"
                style={{ backgroundColor: btn.color, boxShadow: `0 0 5px ${btn.color}60` }}
              />
            ))}
          </div>

          {/* Tabs — clickable */}
          <div className="flex h-full items-end">
            {TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 h-7 flex items-center text-[10px] tracking-[0.26em] uppercase transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)',
                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: isActive ? '1px solid rgba(7,9,20,0.97)' : 'none',
                    marginBottom: isActive ? -1 : 0,
                    borderRadius: 0,
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Status pill */}
          <div className="ml-auto flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${scanDone ? '' : 'animate-pulse'}`}
              style={{ backgroundColor: scanDone ? 'var(--accent)' : '#facc15' }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}
            >
              neural-search@main
            </span>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'AUDIT ENGINE' ? (
            <motion.div
              key="audit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="p-5 space-y-4"
            >
              {/* Terminal lines */}
              <div className="space-y-1.5">
                {[
                  { t: '> scanning neural-search@main', c: 'rgba(255,255,255,0.25)' },
                  { t: '✓ fetched 1,284 files (3.2s)',   c: 'var(--accent)' },
                  { t: '✓ resolved 47 dependencies',      c: 'var(--accent)' },
                  { t: '✓ security audit complete',       c: 'var(--accent)' },
                  { t: '! 3 medium-severity issues found',c: '#facc15' },
                  { t: '> generating report...',          c: 'rgba(255,255,255,0.25)' },
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.6 + i * 0.12, duration: 0.2 }}
                    className="text-[11px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-mono)', color: line.c }}
                  >
                    {line.t}
                  </motion.div>
                ))}
              </div>

              {/* Scan progress */}
              <AnimatePresence>
                {scanning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.28em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
                        Scanning
                      </span>
                      <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        {Math.round(scanProgress)}%
                      </span>
                    </div>
                    <div className="h-[2px] w-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{
                          width: `${scanProgress}%`,
                          background: 'linear-gradient(90deg, rgba(16,185,129,0.5) 0%, #10b981 100%)',
                          boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="p-5"
            >
              <div
                className="text-[10px] tracking-[0.32em] uppercase text-white/20 mb-4"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Score Breakdown
              </div>
              <div className="space-y-3">
                {SAMPLE_SCORES.map((s, i) => (
                  <SegmentBar
                    key={s.label}
                    label={s.label}
                    value={s.value}
                    segments={28}
                    segmentHeight={2}
                    delay={i * 0.1}
                    labelWidth={74}
                  />
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.05] grid grid-cols-3 gap-3">
                {[
                  { label: 'Overall', value: '84', color: 'var(--accent)' },
                  { label: 'Issues', value: '3', color: '#facc15' },
                  { label: 'LOC', value: '14.3k', color: 'rgba(255,255,255,0.4)' },
                ].map(m => (
                  <div key={m.label} className="text-center">
                    <div className="text-lg" style={{ fontFamily: 'var(--font-display)', color: m.color }}>{m.value}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Status bar ── */}
        <div
          className="flex items-center justify-between px-5 py-2 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[10px] text-white/15 tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            14,382 LOC · Python 78%
          </span>
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: scanDone ? 'var(--accent)' : 'rgba(255,255,255,0.15)' }}
          >
            {scanDone ? '✓ Complete' : '● Live'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureVisual({ type }: { type: string }) {
  if (type === 'code')
    return (
      <div className="absolute top-0 right-0 w-40 h-36 opacity-25 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 p-3 text-[7px] leading-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
          <div>{'const audit = new'}</div>
          <div>{'  RepoSight(repo);'}</div>
          <div className="opacity-50">{'await audit.analyze({'}</div>
          <div className="opacity-50">{'  deep: true'}</div>
          <div className="opacity-50">{'});'}</div>
        </div>
      </div>
    );
  if (type === 'audit')
    return (
      <div className="absolute top-4 right-4 w-28 h-28 opacity-20 pointer-events-none">
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
          <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-white/30" />
          <circle cx="40" cy="40" r="22" stroke="currentColor" strokeWidth="1.5" className="text-white/40" />
          <circle cx="40" cy="40" r="8" fill="currentColor" className="text-white/30" />
          <line x1="40" y1="6" x2="40" y2="18" stroke="currentColor" strokeWidth="1.5" className="text-white/50" />
        </svg>
      </div>
    );
  if (type === 'security')
    return (
      <div className="absolute top-3 right-3 w-32 h-28 opacity-20 pointer-events-none">
        <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
          <path d="M40 8L12 20v20c0 16 12 28 28 32C56 68 68 56 68 40V20L40 8z" stroke="currentColor" strokeWidth="1.5" className="text-white/50" />
          <path d="M28 40l8 8 16-16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60" />
        </svg>
      </div>
    );
  if (type === 'report')
    return (
      <div className="absolute top-3 right-3 w-28 h-32 opacity-20 pointer-events-none">
        <div className="w-full h-full border border-white/20" style={{ borderRadius: 2 }}>
          {[82, 65, 90, 55, 72].map((w, i) => (
            <div key={i} className="mx-3 mt-3 h-1 bg-white/20" style={{ width: `${w}%`, borderRadius: 1 }} />
          ))}
        </div>
      </div>
    );
  return null;
}

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden border border-white/[0.08] p-8 transition-all duration-700 hover:border-white/[0.16] hover:bg-white/[0.03]"
      style={{
        borderRadius: '2px',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <FeatureVisual type={feature.visual} />
      {/* Hover accent bottom line */}
      <div
        className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-700"
        style={{ background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)' }}
      />
      <div className="relative">
        <div
          className="text-[10px] tracking-[0.38em] mb-5 uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
        >
          {feature.tag}
        </div>
        <GlitchyText
          text={feature.heading}
          as="h3"
          className="text-sm tracking-[0.14em] text-white mb-4 uppercase block"
          style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
        />
        <p className="text-sm text-white/30 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          {feature.body}
        </p>
      </div>
    </motion.div>
  );
}

function StatNumber({ value, label, delay }: { value: string; label: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <div
        className="text-4xl md:text-5xl text-white mb-1.5 tracking-[-0.02em]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </div>
      <div
        className="text-[10px] uppercase tracking-[0.32em] text-white/22"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// ─── BUTTON PRIMITIVES ────────────────────────────────────────────────────────

/** Accent (filled emerald) button — shimmer sweeps on each hover-in */
function AccentButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [shimKey, setShimKey] = useState(0);
  const [glow, setGlow] = useState(false);

  return (
    <motion.button
      onHoverStart={() => { setShimKey((k) => k + 1); setGlow(true); }}
      onHoverEnd={() => setGlow(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden flex items-center gap-2.5 text-black ${className}`}
      style={{
        backgroundColor: 'var(--accent)',
        borderRadius: 0,
        fontFamily: 'var(--font-display)',
        boxShadow: glow
          ? '0 0 40px rgba(16,185,129,0.45), 0 0 80px rgba(16,185,129,0.15)'
          : '0 0 24px rgba(16,185,129,0.22)',
        transition: 'box-shadow 0.25s',
      }}
    >
      {/* Shimmer — new key each hover-in triggers fresh animation */}
      <motion.span
        key={shimKey}
        className="pointer-events-none absolute inset-0"
        initial={{ x: '-110%', skewX: '-10deg' }}
        animate={{ x: '250%' }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)',
        }}
      />
      {children}
    </motion.button>
  );
}

/** Ghost (outline) button — fills from left + border/text brighten on hover */
function GhostButton({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: 0,
        fontFamily: 'var(--font-display)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)'}`,
        color: hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
        transition: 'color 0.25s, border-color 0.25s',
      }}
    >
      {/* Fill overlay slides in from left */}
      <motion.span
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ transformOrigin: 'left', background: 'rgba(255,255,255,0.05)' }}
      />
      <span className="relative">{children}</span>
    </motion.button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-display)' }}>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-20 items-center">

            {/* Left */}
            <div>
              {/* CLI animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-10 space-y-1"
              >
                {CLI_LINES.map((line, i) => (
                  <CliLine key={i} {...line} />
                ))}
              </motion.div>

              {/* Headline */}
              <div className="mb-7 space-y-1">
                {[
                  { text: 'YOUR CODE.', delay: 1400 },
                  { text: 'NOWHERE', delay: 1700 },
                  { text: 'TO HIDE.', delay: 2000, accent: true },
                ].map(({ text, delay, accent }) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <GlitchyText
                      text={text}
                      as="h1"
                      triggerOnMount
                      delay={delay + 100}
                      className="block leading-[1.04] tracking-[0.04em] uppercase"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(52px, 8vw, 100px)',
                        color: accent ? 'var(--accent)' : 'white',
                      } as React.CSSProperties}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 2.8 }}
                className="mb-3"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.38em] mb-2"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
                >
                  AI-Powered Repository Audit
                </p>
                <p
                  className="text-sm text-white/32 leading-[1.8] max-w-md"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Static analysis across every line. Honest skill assessment against your
                  actual commit history. Security findings that matter.
                  Know what your codebase really says about you.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.1 }}
                className="flex items-center gap-4 mt-10"
              >
                <AccentButton
                  onClick={() => router.push('/auth')}
                  className="px-8 py-4 text-[11px] uppercase tracking-[0.34em]"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Begin Free Audit
                </AccentButton>

                <GhostButton
                  onClick={() => router.push('/auth')}
                  className="px-8 py-4 text-[11px] uppercase tracking-[0.34em]"
                >
                  Sign In
                </GhostButton>
              </motion.div>
            </div>

            {/* Right — macOS Terminal */}
            <div className="hidden lg:block">
              <MacWindow />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            className="text-[10px] uppercase tracking-[0.44em] text-white/15"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-7 bg-gradient-to-b from-white/15 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── TECH CAROUSEL ─────────────────────────────────────────────────── */}
      <TechCarousel />

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((stat, i) => (
              <StatNumber key={stat.label} value={stat.value} label={stat.label} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p
                className="text-[10px] tracking-[0.44em] uppercase mb-4"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
              >
                Capabilities
              </p>
              <GlitchyText
                text="WHAT WE EXPOSE"
                as="h2"
                className="text-4xl md:text-6xl text-white tracking-[0.07em] uppercase"
                style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
              />
              <p
                className="text-sm text-white/28 leading-relaxed max-w-lg mt-4"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Twelve dimensions of code quality, measured with the same tools serious
                engineering teams use — not watered-down approximations.
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.tag} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p
                className="text-[10px] tracking-[0.44em] uppercase mb-4"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
              >
                Process
              </p>
              <GlitchyText
                text="THREE STEPS. FULL AUDIT."
                as="h2"
                className="text-4xl md:text-6xl text-white tracking-[0.07em] uppercase"
                style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
              />
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                step: '01',
                cmd: '$ connect --github',
                title: 'CONNECT',
                desc: 'Link your GitHub account and select repositories to include in the audit.',
              },
              {
                step: '02',
                cmd: '$ audit --deep',
                title: 'ANALYZE',
                desc: 'Our engine clones, analyzes, and scores your codebase across 12+ dimensions simultaneously.',
              },
              {
                step: '03',
                cmd: '$ export --report',
                title: 'DELIVER',
                desc: 'Receive a detailed report and shareable dashboard link within 90 seconds.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden border border-white/[0.08] p-8 transition-all duration-700 hover:border-white/[0.16]"
                style={{ borderRadius: '2px', background: 'rgba(255,255,255,0.02)' }}
              >
                <div
                  className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-700"
                  style={{ background: 'linear-gradient(90deg, var(--accent) 0%, transparent 100%)' }}
                />
                <div
                  className="text-[10px] tracking-[0.4em] mb-4 uppercase"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
                >
                  {item.step}
                </div>
                <div
                  className="text-xs mb-5 px-3 py-2 bg-white/[0.03] border border-white/[0.05]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    borderRadius: '2px',
                  }}
                >
                  {item.cmd}
                </div>
                <GlitchyText
                  text={item.title}
                  as="h3"
                  className="text-base tracking-[0.18em] text-white mb-3 uppercase block"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
                />
                <p className="text-sm text-white/30 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-32 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="text-[10px] tracking-[0.44em] uppercase mb-8"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}
            >
              Get Started
            </p>
            <h2 className="text-5xl md:text-7xl tracking-[0.05em] uppercase mb-10" style={{ fontFamily: 'var(--font-display)' }}>
              <GlitchyText
                text="READY TO SEE"
                as="span"
                triggerOnMount
                className="text-white"
              />
              {' '}
              <GlitchyText
                text="THE TRUTH?"
                as="span"
                triggerOnMount
                style={{ color: 'var(--accent)' } as React.CSSProperties}
              />
            </h2>
            <div className="mt-8 flex flex-col items-center">
              <p
                className="text-sm text-white/28 mb-10 max-w-sm mx-auto text-center leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                No credit card required. Scan up to 3 repositories for free.
                Professional reports in under 90 seconds.
              </p>
              <AccentButton
                onClick={() => router.push('/auth')}
                className="px-12 py-5 text-[11px] uppercase tracking-[0.34em]"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Begin Free Audit
              </AccentButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div
            className="text-sm tracking-[0.26em] uppercase text-white/22"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            REPOSIGHT
          </div>
          <div className="flex items-center gap-6">
            {['Features', 'How It Works', 'Sign In'].map((link) => (
              <a
                key={link}
                href={link === 'Sign In' ? '/auth' : `#${link.toLowerCase().replace(/\s/g, '')}`}
                className="text-[11px] uppercase tracking-[0.28em] text-white/18 hover:text-white/45 transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {link}
              </a>
            ))}
          </div>
          <div
            className="text-[11px] tracking-[0.2em] text-white/15"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            © 2026 — All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
