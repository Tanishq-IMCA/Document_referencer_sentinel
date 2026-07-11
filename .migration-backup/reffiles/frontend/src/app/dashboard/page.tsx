'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Settings, LogOut, Play, CheckCircle2, Clock, AlertCircle,
  Star, GitFork, Shield, Zap, Brain, Layout,
  TrendingUp, TrendingDown, Minus, Code2, Lock,
  AlertTriangle, Info, ChevronDown, FileCode, TestTube,
  BarChart3, Layers, GitPullRequest, BookOpen, ShieldAlert,
  ChevronRight, XCircle, CheckSquare, Flame, Cpu,
  Terminal, GitBranch, Box, Workflow, Hexagon,
} from 'lucide-react';
import { useScan } from '@/hooks/useScan';
import { useAuth } from '@/hooks/useAuth';
import { showNotice } from '@/components/ui/NexusNotice';
import { mockRepos } from '@/lib/queryClient';
import { Repository, SeverityLevel, CodeSmell } from '@/types';
import { SegmentBar } from '@/components/ui/SegmentBar';
import GlitchyText from '@/components/ui/GlitchyText';
import Link from 'next/link';

const BRAILLE_SPINNER = [
  String.fromCharCode(0x2807), String.fromCharCode(0x280F),
  String.fromCharCode(0x2817), String.fromCharCode(0x2837),
  String.fromCharCode(0x2836), String.fromCharCode(0x2826),
  String.fromCharCode(0x2806), String.fromCharCode(0x2802),
];

function CliSpinner() {
  const [frame, setFrame] = useState(0);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setFrame(f => (f + 1) % BRAILLE_SPINNER.length);
    }, 65);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);

  return (
    <motion.span
      key={frame}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.05 }}
    >
      {BRAILLE_SPINNER[frame]}
    </motion.span>
  );
}

const TABS = ['Overview', 'Security', 'Code Quality', 'Architecture', 'Skills'] as const;
type Tab = typeof TABS[number];

const langColors: Record<string, string> = {
  Python: '#fbbf24', TypeScript: '#10b981', JavaScript: '#f59e0b',
  Go: '#00add8', Rust: '#f97316', Ruby: '#dc2626',
};

const severityConfig: Record<SeverityLevel, { color: string; bg: string; border: string; icon: React.ElementType; label: string }> = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.18)', icon: AlertCircle, label: 'Critical' },
  high:     { color: '#fb923c', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.18)', icon: AlertTriangle, label: 'High' },
  medium:   { color: '#facc15', bg: 'rgba(250,204,21,0.07)', border: 'rgba(250,204,21,0.18)', icon: AlertTriangle, label: 'Medium' },
  low:      { color: '#4ade80', bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.18)', icon: Info, label: 'Low' },
  info:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.18)', icon: Info, label: 'Info' },
};

const verdictConfig = {
  overestimated: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: TrendingDown },
  underestimated:{ color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: TrendingUp },
  accurate:       { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', icon: Minus },
};

const trendIcon = (v: number) =>
  v > 0 ? <TrendingUp size={12} className="text-emerald-400" /> :
  v < 0 ? <TrendingDown size={12} className="text-red-400" /> :
  <Minus size={12} className="text-white/30" />;

function AnimatedScoreDisplay({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const ref = useRef(null);
  const [displayVal, setDisplayVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const steps = 40;
      const stepMs = 28;
      let s = 0;
      const iv = setInterval(() => {
        s++;
        const t = s / steps;
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayVal(Math.round(value * eased));
        if (s >= steps) { setDisplayVal(value); clearInterval(iv); }
      }, stepMs);
      return () => clearInterval(iv);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline gap-3">
        <motion.span
          className="text-4xl text-white"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {displayVal}
        </motion.span>
        <span className="text-xs text-white/30 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)' }}>/100</span>
      </div>
      <SegmentBar value={value} segments={20} segmentHeight={7} showValue={false} delay={delay} />
      <div className="text-[11px] uppercase tracking-[0.2em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
    </div>
  );
}

function RepoCard({
  repo, isSelected, onSelect, onScan,
}: {
  repo: Repository; isSelected: boolean; onSelect: () => void; onScan: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onSelect}
      className="p-5 border cursor-pointer transition-all duration-300 group"
      style={{
        borderRadius: '1px',
        backgroundColor: isSelected ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
        borderColor: isSelected ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)',
      }}
      whileHover={{ scale: 1.005 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {repo.name}
            </span>
            {repo.private && (
              <Lock size={10} className="text-white/25 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-white/30 truncate leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            {repo.description}
          </p>
        </div>
        <div className="ml-3 flex-shrink-0">
          {repo.lastScan ? (
            <div className="text-right">
              <div className="text-lg text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {repo.lastScan.overallScore}
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>score</div>
            </div>
          ) : (
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/20 border border-white/[0.07] px-2 py-1" style={{ fontFamily: 'var(--font-mono)', borderRadius: '1px' }}>
              unscanned
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[repo.language] || '#ffffff40' }} />
            <span className="text-[11px] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-white/20">
          <Star size={10} />
          <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>{repo.stars}</span>
        </div>
        <div className="flex items-center gap-1 text-white/20">
          <GitFork size={10} />
          <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>{repo.forks}</span>
        </div>
      </div>

      {repo.lastScan && (
        <SegmentBar value={repo.lastScan.overallScore} segments={16} segmentHeight={4} showValue={false} />
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 text-white/20">
          {repo.lastScan ? <CheckCircle2 size={10} className="text-emerald-400/60" /> : <Clock size={10} />}
          <span className="text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
            {repo.lastScan ? `scanned ${repo.lastScan.scanDate}` : 'not scanned'}
          </span>
        </div>
        <motion.button
          onClick={e => { e.stopPropagation(); onScan(); }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 border transition-all duration-200 group-hover:border-white/18"
          style={{
            fontFamily: 'var(--font-mono)',
            borderRadius: '1px',
            color: 'var(--accent)',
            borderColor: 'rgba(16,185,129,0.2)',
            backgroundColor: 'rgba(16,185,129,0.05)',
          }}
        >
          <Play size={9} fill="currentColor" />
          {repo.lastScan ? 'Rescan' : 'Scan'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function MiniBar({ label, value, max, color, delay = 0 }: { label: string; value: number; max: number; color: string; delay?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] text-white/30 w-16 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
      <div className="flex-1 h-[6px] bg-white/[0.05] overflow-hidden" style={{ borderRadius: '1px' }}>
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}66` }}
        />
      </div>
      <span className="text-[11px] text-white/40 w-8 text-right tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function ComplexityMiniChart({ dist, delay = 0 }: { dist: Array<{ range: string; count: number }>; delay?: number }) {
  const max = Math.max(...dist.map(d => d.count), 1);
  return (
    <div className="space-y-2">
      {dist.map((d, i) => (
        <div key={d.range} className="flex items-center gap-2.5">
          <span className="text-[11px] text-white/30 w-12 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{d.range}</span>
          <div className="flex-1 h-[5px] bg-white/[0.04] overflow-hidden" style={{ borderRadius: '1px' }}>
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(d.count / max) * 100}%` }}
              transition={{ delay: delay + i * 0.06, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
              style={{
                backgroundColor: i < 2 ? 'var(--accent)' : i === 2 ? '#facc15' : '#ef4444',
                opacity: 0.7 + (1 - i / dist.length) * 0.3,
              }}
            />
          </div>
          <span className="text-[11px] text-white/40 w-6 text-right tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function TestMetricCard({ icon: Icon, label, value, sub, color, delay = 0 }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      className="p-4 bg-white/[0.02] border border-white/[0.05] text-center"
      style={{ borderRadius: '1px' }}
    >
      <Icon size={16} style={{ color }} className="mx-auto mb-2" />
      <div className="text-lg text-white mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{value}</div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div className="text-[11px] text-white/20 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{sub}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedRepo, setSelectedRepo] = useState<Repository>(mockRepos[0]);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const { startScan, scanState, isScanning, result: scanResult } = useScan();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleScan = (repo: Repository) => {
    setSelectedRepo(repo);
    startScan(repo.id, repo.name);
    showNotice('SCAN INITIATED', `Analyzing ${repo.name}...`, 'system');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const scan = scanResult ?? selectedRepo.lastScan;

  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Header */}
      <header className="border-b border-white/[0.05] sticky top-0 z-40 backdrop-blur-md bg-[rgba(5,8,22,0.7)]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="text-sm uppercase tracking-[0.22em] text-white/50 hover:text-white transition-colors smooth-glow">
              REPOSIGHT
            </a>
            <div className="w-px h-4 bg-white/[0.1]" />
            <div className="flex items-center gap-2 text-white/25">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: 'var(--font-mono)' }}>
                {user?.githubUsername || 'dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="p-2 text-white/30 hover:text-white/60 transition-colors">
                <Settings size={15} />
              </motion.button>
            </Link>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/25 hover:text-red-400/70 transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}>
              <LogOut size={13} />
              Exit
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-[320px_1fr] gap-6">

          {/* —— SIDEBAR —— */}
          <aside>
            <div className="flex items-center justify-between mb-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
                Repositories
              </div>
              <div className="text-[11px] text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>
                {mockRepos.length} total
              </div>
            </div>
            <div className="space-y-2">
              {mockRepos.map(repo => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  isSelected={selectedRepo.id === repo.id}
                  onSelect={() => setSelectedRepo(repo)}
                  onScan={() => handleScan(repo)}
                />
              ))}
            </div>
          </aside>

          {/* —— MAIN PANEL —— */}
          <main>
            {/* Repo header */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <GlitchyText
                    text={selectedRepo.name.toUpperCase()}
                    as="h1"
                    triggerOnMount
                    className="text-2xl text-white tracking-[0.1em]"
                    style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
                  />
                  <p className="text-xs text-white/30 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
                    {selectedRepo.description}
                  </p>
                </div>
                <motion.button
                  onClick={() => handleScan(selectedRepo)}
                  disabled={isScanning}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-black transition-all duration-200 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}
                >
                  <Play size={11} fill="currentColor" />
                  {isScanning ? 'Scanning...' : 'Run Scan'}
                </motion.button>
              </div>
            </div>

            {/* Scan progress */}
            <AnimatePresence>
              {isScanning && scanState && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 glass border border-white/[0.07] overflow-hidden"
                  style={{ borderRadius: '1px' }}
                >
                  <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
                    <span className="text-[11px] uppercase tracking-[0.28em] text-white/40" style={{ fontFamily: 'var(--font-mono)' }}>
                      Audit Engine Active
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="space-y-1.5 mb-4">
                      {scanState.steps.map((step: { name: string; status: string }, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="text-[11px] w-3 text-center" style={{ fontFamily: 'var(--font-mono)', color: step.status === 'done' ? 'var(--accent)' : step.status === 'running' ? '#facc15' : 'rgba(255,255,255,0.2)' }}>
                            {step.status === 'done' ? (
                              <span>✓</span>
                            ) : step.status === 'running' ? (
                              <CliSpinner />
                            ) : (
                              <span>○</span>
                            )}
                          </div>
                          <div className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: step.status === 'done' ? 'rgba(255,255,255,0.45)' : step.status === 'running' ? 'white' : 'rgba(255,255,255,0.2)' }}>
                            {step.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-white/25 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                        PROGRESS
                      </span>
                      <span className="text-[11px] flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                        {Math.round(scanState.progress)}%
                      </span>
                      <div className="h-[2px] flex-1 bg-white/[0.05] overflow-hidden">
                        <motion.div
                          className="h-full"
                          style={{
                            width: `${scanState.progress}%`,
                            background: 'linear-gradient(90deg, rgba(16,185,129,0.5) 0%, #10b981 100%)',
                            boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                          }}
                          transition={{ duration: 0.15 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-white/[0.06] mb-6">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative px-5 py-3 text-[11px] uppercase tracking-[0.24em] transition-all duration-200"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.28)',
                  }}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[1px]"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'Overview' && scan && (
                  <div className="space-y-5">
                    {/* Score grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Overall Score', value: scan.overallScore, delay: 0 },
                        { label: 'Security', value: scan.securityScore ?? 0, delay: 0.06 },
                        { label: 'Code Quality', value: scan.codeQualityScore ?? 0, delay: 0.12 },
                        { label: 'Architecture', value: scan.architectureScore ?? 0, delay: 0.18 },
                      ].map(item => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: item.delay * 0.5, duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                          className="glass border border-white/[0.07] p-5"
                          style={{ borderRadius: '1px' }}
                        >
                          <AnimatedScoreDisplay label={item.label} value={item.value} delay={item.delay} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Metrics */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="glass border border-white/[0.07] p-5"
                        style={{ borderRadius: '1px' }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                          Code Metrics
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: 'Total Files', value: (scan.metrics?.totalFiles ?? 0).toLocaleString() },
                            { label: 'Lines of Code', value: (scan.metrics?.linesOfCode ?? 0).toLocaleString() },
                            { label: 'Test Coverage', value: `${scan.metrics?.testCoverage ?? 0}%` },
                            { label: 'Avg Complexity', value: scan.metrics?.avgComplexity ?? 0 },
                            { label: 'Duplication', value: `${scan.metrics?.duplication ?? 0}%` },
                          ].map((m, i) => (
                            <motion.div
                              key={m.label}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 + i * 0.05, duration: 0.35 }}
                              className="flex justify-between items-center"
                            >
                              <span className="text-[11px] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>{m.label}</span>
                              <span className="text-sm text-white" style={{ fontFamily: 'var(--font-display)' }}>{m.value}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Score breakdown bars */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                        className="glass border border-white/[0.07] p-5"
                        style={{ borderRadius: '1px' }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                          Score Breakdown
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: 'Overall', value: scan.overallScore },
                            { label: 'Security', value: scan.securityScore ?? 0 },
                            { label: 'Quality', value: scan.codeQualityScore ?? 0 },
                            { label: 'Arch', value: scan.architectureScore ?? 0 },
                            { label: 'Skills', value: scan.skillScore ?? 78 },
                          ].map((s, i) => (
                            <SegmentBar key={s.label} label={s.label} value={s.value} segments={16} segmentHeight={7} delay={0.3 + i * 0.06} labelWidth={64} />
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Findings summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="glass border border-white/[0.07] p-5"
                      style={{ borderRadius: '1px' }}
                    >
                      <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                        Finding Summary
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {(['critical', 'high', 'medium', 'low'] as SeverityLevel[]).map(sev => {
                          const cfg = severityConfig[sev];
                          const count = (scan.findings ?? []).filter((f: { severity: string }) => f.severity === sev).length;
                          return (
                            <motion.div
                              key={sev}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + ['critical','high','medium','low'].indexOf(sev) * 0.06, duration: 0.35, ease: [0.34,1.56,0.64,1] }}
                              className="p-4 border text-center"
                              style={{ borderRadius: '1px', backgroundColor: cfg.bg, borderColor: cfg.border }}
                            >
                              <div className="text-2xl mb-1" style={{ color: cfg.color, fontFamily: 'var(--font-display)' }}>{count}</div>
                              <div className="text-[11px] uppercase tracking-[0.2em] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>{sev}</div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === 'Security' && scan && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
                        {(scan.findings ?? []).length} findings detected
                      </span>
                      <div className="flex-1 h-px bg-white/[0.05]" />
                      <span className="text-[11px] text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>
                        by Semgrep + Bandit
                      </span>
                    </div>
                    {(scan.findings ?? []).map((finding: { id: string; severity: SeverityLevel; title: string; description: string; file: string; line: number; tool: string; recommendation: string }) => {
                      const cfg = severityConfig[finding.severity];
                      const Icon = cfg.icon;
                      const isOpen = expanded === finding.id;
                      return (
                        <motion.div
                          key={finding.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
                          className="border overflow-hidden"
                          style={{ borderRadius: '1px', backgroundColor: cfg.bg, borderColor: cfg.border }}
                        >
                          <button
                            onClick={() => setExpanded(isOpen ? null : finding.id)}
                            className="w-full flex items-center gap-4 p-4 text-left"
                          >
                            <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white/80" style={{ fontFamily: 'var(--font-display)' }}>{finding.title}</div>
                              <div className="text-[11px] text-white/30 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                                {finding.file}:{finding.line}
                              </div>
                            </div>
                            <span
                              className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 border"
                              style={{ color: cfg.color, borderColor: cfg.border, borderRadius: '1px', fontFamily: 'var(--font-mono)' }}
                            >
                              {finding.tool}
                            </span>
                            <span
                              className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border"
                              style={{ color: cfg.color, borderColor: cfg.border, borderRadius: '1px', fontFamily: 'var(--font-mono)' }}
                            >
                              {finding.severity}
                            </span>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            >
                              <ChevronDown size={12} className="text-white/25 flex-shrink-0" />
                            </motion.div>
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                                className="border-t border-white/[0.06] overflow-hidden"
                              >
                                <div className="px-4 py-4 space-y-3">
                                  <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{finding.description}</p>
                                  <div className="p-3 bg-white/[0.03] border border-white/[0.05]" style={{ borderRadius: '1px' }}>
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/20 mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>Recommendation</div>
                                    <p className="text-xs text-white/55 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{finding.recommendation}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* ── CODE QUALITY TAB ── */}
                {activeTab === 'Code Quality' && scan && (
                  <div className="space-y-4">
                    {/* Quality Metrics bars */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="glass border border-white/[0.07] p-5"
                      style={{ borderRadius: '1px' }}
                    >
                      <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                        Quality Metrics
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: 'Maintainability', value: scan.codeQualityScore ?? 0 },
                          { label: 'Lint Score', value: scan.codeQualityDetails?.lintScore ?? 0 },
                          { label: 'Doc Coverage', value: scan.codeQualityDetails?.docCoverage ?? 0 },
                          { label: 'Test Quality', value: scan.codeQualityDetails?.testQuality ?? 0 },
                          { label: 'Consistency', value: scan.codeQualityDetails?.consistencyScore ?? 0 },
                        ].map((m, i) => (
                          <SegmentBar key={m.label} label={m.label} value={m.value} segments={24} segmentHeight={8} delay={i * 0.07} labelWidth={120} />
                        ))}
                      </div>
                    </motion.div>

                    {/* Complexity + Test metrics side-by-side */}
                    <div className="grid grid-cols-2 gap-4">
                      {scan.codeQualityDetails?.complexityDist && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.4 }}
                          className="glass border border-white/[0.07] p-5"
                          style={{ borderRadius: '1px' }}
                        >
                          <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                            Complexity Distribution
                          </div>
                          <ComplexityMiniChart dist={scan.codeQualityDetails.complexityDist} delay={0.15} />
                        </motion.div>
                      )}

                      {scan.codeQualityDetails?.testMetrics && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.4 }}
                          className="glass border border-white/[0.07] p-5"
                          style={{ borderRadius: '1px' }}
                        >
                          <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                            Test Health
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <TestMetricCard icon={TestTube} label="Total" value={`${scan.codeQualityDetails.testMetrics.totalTests}`} sub="tests" color="var(--accent)" delay={0.2} />
                            <TestMetricCard icon={CheckSquare} label="Passing" value={`${scan.codeQualityDetails.testMetrics.passing}`} sub={`${Math.round(scan.codeQualityDetails.testMetrics.passing / scan.codeQualityDetails.testMetrics.totalTests * 100)}%`} color="#4ade80" delay={0.25} />
                            <TestMetricCard icon={XCircle} label="Failing" value={`${scan.codeQualityDetails.testMetrics.failing}`} sub="need attention" color="#ef4444" delay={0.3} />
                            <TestMetricCard icon={Flame} label="Flaky" value={`${scan.codeQualityDetails.testMetrics.flaky}`} sub={`${scan.codeQualityDetails.testMetrics.avgDuration}s avg`} color="#facc15" delay={0.35} />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Code Smells — expandable */}
                    {scan.codeSmells && scan.codeSmells.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="glass border border-white/[0.07] p-5"
                        style={{ borderRadius: '1px' }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                          Code Smells
                        </div>
                        <div className="space-y-2.5">
                          {scan.codeSmells.map((smell: CodeSmell, i: number) => {
                            const isOpen = expanded === smell.id;
                            const sev = smell.severity ?? 'medium';
                            const cfg = severityConfig[sev];
                            return (
                              <motion.div
                                key={smell.id}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.04, duration: 0.3 }}
                                className="border overflow-hidden"
                                style={{ borderRadius: '1px', backgroundColor: 'rgba(255,255,255,0.02)', borderColor: cfg.border }}
                              >
                                <button
                                  onClick={() => setExpanded(isOpen ? null : smell.id)}
                                  className="w-full flex items-center gap-3 p-3 text-left"
                                >
                                  <span
                                    className="text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 border flex-shrink-0"
                                    style={{ color: cfg.color, borderColor: cfg.border, borderRadius: '1px', fontFamily: 'var(--font-mono)' }}
                                  >
                                    {sev}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-white/60" style={{ fontFamily: 'var(--font-display)' }}>{smell.type}</div>
                                    <div className="text-[11px] text-white/25 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{smell.file}</div>
                                  </div>
                                  <span className="text-sm text-white/40 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>×{smell.count}</span>
                                  <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                  >
                                    <ChevronDown size={12} className="text-white/25 flex-shrink-0" />
                                  </motion.div>
                                </button>
                                <AnimatePresence initial={false}>
                                  {isOpen && smell.description && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                                      className="border-t border-white/[0.06] overflow-hidden"
                                    >
                                      <div className="px-3 py-3 space-y-2.5">
                                        <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{smell.description}</p>
                                        {smell.codeSnippet && (
                                          <div className="p-2.5 bg-black/40 border border-white/[0.06]" style={{ borderRadius: '1px' }}>
                                            <pre className="text-[11px] text-white/35 leading-relaxed overflow-x-auto" style={{ fontFamily: 'var(--font-mono)' }}>
                                              <code>{smell.codeSnippet}</code>
                                            </pre>
                                          </div>
                                        )}
                                        {smell.recommendation && (
                                          <div className="p-2.5 bg-white/[0.02] border border-white/[0.05]" style={{ borderRadius: '1px' }}>
                                            <div className="text-[10px] uppercase tracking-[0.22em] text-white/20 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Fix</div>
                                            <p className="text-xs text-white/50 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{smell.recommendation}</p>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── ARCHITECTURE TAB ── */}
                {activeTab === 'Architecture' && scan && (
                  <div className="space-y-4">
                    {/* Architecture score + sub-scores */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="glass border border-white/[0.07] p-5"
                      style={{ borderRadius: '1px' }}
                    >
                      <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                        Architecture Health
                      </div>
                      <div className="grid grid-cols-4 gap-4 mb-5">
                        {[
                          { label: 'Overall', value: scan.architectureScore ?? 0 },
                          { label: 'Coupling', value: scan.architectureDetails?.couplingScore ?? 0 },
                          { label: 'Cohesion', value: scan.architectureDetails?.cohesionScore ?? 0 },
                          { label: 'Modularity', value: scan.architectureDetails?.modularityScore ?? 0 },
                        ].map((s, i) => (
                          <div key={s.label} className="text-center">
                            <motion.span
                              className="text-3xl text-white block mb-1"
                              style={{ fontFamily: 'var(--font-display)' }}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06, duration: 0.4 }}
                            >
                              {s.value}
                            </motion.span>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                            <div className="mt-2">
                              <SegmentBar value={s.value} segments={12} segmentHeight={4} showValue={false} delay={i * 0.06} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <MiniBar label="Layer Sep" value={scan.architectureDetails?.layerSeparation ?? 0} max={100} color="var(--accent)" delay={0.25} />
                      </div>
                    </motion.div>

                    {/* Layer breakdown */}
                    {scan.architectureDetails?.layerBreakdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="glass border border-white/[0.07] p-5"
                        style={{ borderRadius: '1px' }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                          Layer Breakdown
                        </div>
                        <div className="space-y-2.5">
                          {scan.architectureDetails.layerBreakdown.map((layer, i) => (
                            <div key={layer.layer} className="flex items-center gap-3">
                              <span className="text-[11px] text-white/40 w-28 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{layer.layer}</span>
                              <div className="flex-1 h-[6px] bg-white/[0.04] overflow-hidden" style={{ borderRadius: '1px' }}>
                                <motion.div
                                  className="h-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${layer.score}%` }}
                                  transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
                                  style={{
                                    backgroundColor: layer.score > 75 ? 'var(--accent)' : layer.score > 50 ? '#facc15' : '#ef4444',
                                    opacity: 0.8,
                                    boxShadow: layer.score > 75 ? `0 0 6px var(--accent)44` : undefined,
                                  }}
                                />
                              </div>
                              <span className="text-[11px] text-white/30 w-8 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{layer.files}</span>
                              <span className="text-[11px] text-white/40 w-6 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{layer.score}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Coupling graph */}
                    {scan.architectureDetails?.couplingGraph && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        className="glass border border-white/[0.07] p-5"
                        style={{ borderRadius: '1px' }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                          Coupling Graph
                        </div>
                        <div className="space-y-2">
                          {scan.architectureDetails.couplingGraph.map((edge, i) => (
                            <div key={`${edge.from}-${edge.to}`} className="flex items-center gap-2">
                              <span className="text-[11px] text-white/40" style={{ fontFamily: 'var(--font-mono)' }}>{edge.from}</span>
                              <ChevronRight size={10} className="text-white/15" />
                              <span className="text-[11px] text-white/40" style={{ fontFamily: 'var(--font-mono)' }}>{edge.to}</span>
                              <div className="flex-1 h-[4px] bg-white/[0.04] overflow-hidden" style={{ borderRadius: '1px' }}>
                                <motion.div
                                  className="h-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${edge.strength}%` }}
                                  transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                                  style={{
                                    backgroundColor: edge.strength > 75 ? '#ef4444' : edge.strength > 50 ? '#facc15' : 'var(--accent)',
                                    opacity: 0.7,
                                  }}
                                />
                              </div>
                              <span className="text-[11px] text-white/30 w-8 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{edge.strength}%</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Patterns + Anti-patterns */}
                    <div className="grid grid-cols-2 gap-4">
                      {scan.architectureDetails?.detectedPatterns && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                          className="glass border border-white/[0.07] p-5"
                          style={{ borderRadius: '1px' }}
                        >
                          <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                            Detected Patterns
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scan.architectureDetails.detectedPatterns.map((p, i) => (
                              <motion.span
                                key={p}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.25 + i * 0.05, duration: 0.3, ease: [0.34,1.56,0.64,1] }}
                                className="text-[11px] px-2.5 py-1 border"
                                style={{
                                  borderRadius: '1px',
                                  color: 'var(--accent)',
                                  borderColor: 'rgba(16,185,129,0.2)',
                                  backgroundColor: 'rgba(16,185,129,0.05)',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                {p}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {scan.architectureDetails?.antiPatterns && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25, duration: 0.4 }}
                          className="glass border border-white/[0.07] p-5"
                          style={{ borderRadius: '1px' }}
                        >
                          <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                            Anti-Patterns
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {scan.architectureDetails.antiPatterns.map((p, i) => (
                              <motion.span
                                key={p}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease: [0.34,1.56,0.64,1] }}
                                className="text-[11px] px-2.5 py-1 border"
                                style={{
                                  borderRadius: '1px',
                                  color: '#fb923c',
                                  borderColor: 'rgba(251,146,60,0.2)',
                                  backgroundColor: 'rgba(251,146,60,0.05)',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                {p}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Dependency health */}
                    {scan.dependencies && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="glass border border-white/[0.07] p-5"
                        style={{ borderRadius: '1px' }}
                      >
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                          Dependency Health
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Up to date', value: scan.dependencies.upToDate, color: 'var(--accent)' },
                            { label: 'Outdated', value: scan.dependencies.outdated, color: '#facc15' },
                            { label: 'Vulnerable', value: scan.dependencies.vulnerable, color: '#ef4444' },
                          ].map((d, i) => (
                            <motion.div
                              key={d.label}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.35 + i * 0.06, duration: 0.35, ease: [0.34,1.56,0.64,1] }}
                              className="text-center p-4 bg-white/[0.02] border border-white/[0.05]"
                              style={{ borderRadius: '1px' }}
                            >
                              <div className="text-2xl mb-1" style={{ color: d.color, fontFamily: 'var(--font-display)' }}>{d.value}</div>
                              <div className="text-[11px] uppercase tracking-[0.2em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>{d.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── SKILLS TAB ── */}
                {activeTab === 'Skills' && scan && (
                  <div className="space-y-4">
                    {/* Skills score card */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="glass border border-white/[0.07] p-5"
                      style={{ borderRadius: '1px' }}
                    >
                      <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                        Skill Assessment
                      </div>
                      <div className="space-y-5">
                        {(scan.skillAssessment || []).map((skill, i) => {
                          const verdict = verdictConfig[skill.verdict];
                          const VerdictIcon = verdict.icon;
                          const isOpen = expanded === `skill-${skill.name}`;
                          return (
                            <motion.div
                              key={skill.name}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.07, duration: 0.35 }}
                              className="border overflow-hidden"
                              style={{ borderRadius: '1px', backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                            >
                              <button
                                onClick={() => setExpanded(isOpen ? null : `skill-${skill.name}`)}
                                className="w-full p-4 text-left"
                              >
                                <div className="flex items-center justify-between mb-2.5">
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-white/70" style={{ fontFamily: 'var(--font-display)' }}>{skill.name}</span>
                                    <span
                                      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 border"
                                      style={{
                                        borderRadius: '1px',
                                        color: verdict.color,
                                        borderColor: verdict.border,
                                        backgroundColor: verdict.bg,
                                        fontFamily: 'var(--font-mono)',
                                      }}
                                    >
                                      <VerdictIcon size={10} />
                                      {skill.verdict}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {trendIcon(skill.trend)}
                                    <motion.div
                                      animate={{ rotate: isOpen ? 180 : 0 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    >
                                      <ChevronDown size={12} className="text-white/25" />
                                    </motion.div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  {/* Claimed bar */}
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] uppercase tracking-[0.14em] text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>Claimed</span>
                                      <span className="text-[11px] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>{skill.claimed}</span>
                                    </div>
                                    <div className="h-[4px] bg-white/[0.05] overflow-hidden" style={{ borderRadius: '1px' }}>
                                      <motion.div
                                        className="h-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.claimed}%` }}
                                        transition={{ delay: 0.15 + i * 0.07, duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
                                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                                      />
                                    </div>
                                  </div>
                                  {/* Actual bar */}
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-400/50" style={{ fontFamily: 'var(--font-mono)' }}>Actual</span>
                                      <span className="text-[11px] text-emerald-400" style={{ fontFamily: 'var(--font-mono)' }}>{skill.actual}</span>
                                    </div>
                                    <div className="h-[4px] bg-white/[0.05] overflow-hidden" style={{ borderRadius: '1px' }}>
                                      <motion.div
                                        className="h-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.actual}%` }}
                                        transition={{ delay: 0.25 + i * 0.07, duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
                                        style={{
                                          backgroundColor: 'var(--accent)',
                                          boxShadow: skill.actual >= skill.claimed ? '0 0 8px rgba(16,185,129,0.4)' : undefined,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </button>

                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                                    className="border-t border-white/[0.06] overflow-hidden"
                                  >
                                    <div className="px-4 py-3">
                                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/20 mb-1.5" style={{ fontFamily: 'var(--font-mono)' }}>Evidence</div>
                                      <p className="text-xs text-white/45 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{skill.evidence}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}

                {!scan && !isScanning && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-[11px] uppercase tracking-[0.4em] text-white/15 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                      No scan data
                    </div>
                    <p className="text-sm text-white/25 mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                      Run a scan to see results for this repository.
                    </p>
                    <motion.button
                      onClick={() => handleScan(selectedRepo)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-black"
                      style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}
                    >
                      <Play size={11} fill="currentColor" />
                      Run First Scan
                    </motion.button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
