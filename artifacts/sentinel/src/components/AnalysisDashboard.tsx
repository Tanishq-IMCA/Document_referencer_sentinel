import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowLeft, Shield, Layout, Code2, Layers, Brain, Play,
  CheckCircle2, AlertCircle, AlertTriangle, Info,
  ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus,
  TestTube, CheckSquare, XCircle, Flame,
  BarChart3, FileCode, BookOpen, Download,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { ScanResult } from '@workspace/api-client-react';
import { analyzeDocument, type DocumentAnalysis, type SeverityLevel } from '@/lib/documentAnalysis';
import GlitchyText from '@/components/ui/GlitchyText';

// ── Rich text helpers: paragraphs, tables, citations ─────────────────────

function formatCitations(text: string): React.ReactNode[] {
  const citationRegex = /(\[\d+(?:\s*[\,\-]\s*\d+)*\])|(\(\s*[A-Z][a-zA-Z\s.&]+(?:\s+et\s+al\.)?,\s*\d{4}[a-z]?\s*\))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = citationRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(<span key={match.index} className="text-[var(--accent)] font-medium">{match[0]}</span>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : [text];
}

interface TableData {
  headers: string[];
  rows: string[][];
}

function parseTableBlock(block: string): TableData | null {
  const lines = block.split('\n').map((l) => l.trim()).filter((l) => l);
  if (lines.length < 2) return null;
  if (lines.every((l) => l.includes('|'))) {
    const cells = lines.map((l) => l.split('|').map((c) => c.trim()).filter((c) => c !== ''));
    if (cells.length >= 2 && cells.every((r) => r.length === cells[0].length && cells[0].length >= 2)) {
      const isSeparator = cells[1].every((c) => /^[-:]+$/.test(c));
      const headers = cells[0];
      const rows = isSeparator ? cells.slice(2) : cells.slice(1);
      if (rows.length >= 1) return { headers, rows };
    }
  }
  const tabRows = lines.map((l) => l.split('\t').map((c) => c.trim()).filter((c) => c !== ''));
  if (tabRows.length >= 2 && tabRows.every((r) => r.length === tabRows[0].length && tabRows[0].length >= 2)) {
    return { headers: tabRows[0], rows: tabRows.slice(1) };
  }
  const spaceRows = lines.map((l) => l.trim().split(/\s{2,}/).map((c) => c.trim()).filter((c) => c !== ''));
  if (spaceRows.length >= 2 && spaceRows.every((r) => r.length === spaceRows[0].length && spaceRows[0].length >= 2)) {
    const avg = spaceRows.flat().reduce((sum, c) => sum + c.length, 0) / spaceRows.flat().length;
    if (avg > 2) return { headers: spaceRows[0], rows: spaceRows.slice(1) };
  }
  return null;
}

function TableView({ data }: { data: TableData }) {
  return (
    <div className="overflow-x-auto my-4 border border-white/10">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            {data.headers.map((h, i) => (
              <th key={i} className="px-4 py-2 text-[var(--accent)] uppercase tracking-wider text-[10px] font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              {row.map((cell, j) => <td key={j} className="px-4 py-2 text-white/70 font-mono">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RichText({ text, mode }: { text: string; mode: 'paragraphs' | 'pre' }) {
  if (!text) return null;
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        const table = parseTableBlock(block);
        if (table) return <TableView key={idx} data={table} />;
        if (mode === 'pre') {
          return <pre key={idx} className="whitespace-pre-wrap font-mono text-white/40 text-[12px] leading-relaxed">{formatCitations(block)}</pre>;
        }
        const sentences = block.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).filter((s) => s.trim());
        if (sentences.length === 0) {
          return <p key={idx} className="text-white/80 leading-relaxed text-sm">{formatCitations(block)}</p>;
        }
        return (
          <div key={idx} className="space-y-3">
            {sentences.map((s, i) => <p key={i} className="text-white/80 leading-relaxed text-sm">{formatCitations(s)}</p>)}
          </div>
        );
      })}
    </div>
  );
}

// ── Visualisation components (adapted from the RepoSight dashboard) ────────

const TABS = ['Overview', 'Privacy', 'Clarity', 'Structure', 'Entities'] as const;
type Tab = typeof TABS[number];

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

const tabIcons: Record<Tab, React.ElementType> = {
  Overview: Layout,
  Privacy: Shield,
  Clarity: Code2,
  Structure: Layers,
  Entities: Brain,
};

const ACCENT = [168, 85, 247] as const;

function downloadReport(result: ScanResult, scan: DocumentAnalysis) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const setPurple = () => doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
  const setWhite = () => doc.setTextColor(255, 255, 255);
  const setGray = (level: number) => doc.setTextColor(level, level, level);

  const drawLine = (yy: number) => {
    doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.setLineWidth(0.35);
    doc.line(margin, yy, pageW - margin, yy);
  };

  const drawProgress = (label: string, value: number, yy: number) => {
    doc.setFontSize(8);
    setWhite();
    doc.text(label, margin, yy);
    doc.text(`${Math.round(value)}`, pageW - margin, yy, { align: 'right' });
    const barY = yy + 2;
    doc.setFillColor(255, 255, 255);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.setFillColor(255, 255, 255);
    doc.setFillColor(255, 255, 255);
    doc.setFillColor(30, 30, 35);
    doc.roundedRect(margin, barY, contentW, 3, 0.5, 0.5, 'F');
    const fillW = (contentW * Math.min(value, 100)) / 100;
    doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.roundedRect(margin, barY, fillW, 3, 0.5, 0.5, 'F');
    return yy + 8;
  };

  const addWrapped = (text: string, yy: number, size = 9, lineHeight = 4.5, color = 200) => {
    doc.setFontSize(size);
    setGray(color);
    const split = doc.splitTextToSize(text, contentW);
    doc.text(split, margin, yy);
    return yy + split.length * lineHeight;
  };

  const addSectionTitle = (title: string, yy: number) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setWhite();
    doc.text(title.toUpperCase(), margin, yy);
    doc.setFont('helvetica', 'normal');
    drawLine(yy + 2);
    return yy + 7;
  };

  // Header
  doc.setFillColor(5, 8, 22);
  doc.rect(0, 0, pageW, pageH, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setPurple();
  doc.text('S', margin, y + 2);
  doc.setFontSize(14);
  setWhite();
  doc.text('SENTINEL', margin + 7, y + 2);
  doc.setFontSize(8);
  setGray(120);
  doc.text('DOCUMENT INTELLIGENCE REPORT', pageW - margin, y + 2, { align: 'right' });
  y += 10;
  drawLine(y);
  y += 8;

  // Document info
  doc.setFontSize(10);
  setWhite();
  doc.setFont('helvetica', 'bold');
  doc.text(result.filename, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setGray(140);
  doc.text(`Scanned on ${scan.scanDate} · ${result.wordCount.toLocaleString()} words · ${Math.max(1, Math.round(result.wordCount / 200))} min read`, margin, y + 4.5);
  y += 12;

  // Score overview
  y = addSectionTitle('Document Scores', y);
  y = drawProgress('Overall', scan.overallScore, y);
  y = drawProgress('Privacy', scan.securityScore, y);
  y = drawProgress('Clarity', scan.codeQualityScore, y);
  y = drawProgress('Structure', scan.architectureScore, y);
  y = drawProgress('Entities', scan.skillScore, y);
  y += 4;

  // Summary
  y = addSectionTitle('Neural Summary', y);
  y = addWrapped(result.summary, y, 9, 4.5, 190);
  y += 4;

  // Key Insights
  if (result.keyPoints.length > 0) {
    y = addSectionTitle('Key Insights', y);
    result.keyPoints.filter((p) => p && p.trim()).forEach((point, i) => {
      if (y > pageH - margin - 20) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(8);
      setPurple();
      doc.text(`${String(i + 1).padStart(2, '0')}`, margin, y);
      y = addWrapped(point, y, 8.5, 4, 200);
      y += 2;
    });
    y += 4;
  }

  // Sensitivity
  if (scan.findings.length > 0) {
    if (y > pageH - margin - 40) {
      doc.addPage();
      y = margin;
    }
    y = addSectionTitle('Sensitivity Findings', y);
    scan.findings.forEach((finding) => {
      if (y > pageH - margin - 25) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setWhite();
      doc.text(`${finding.severity.toUpperCase()} — ${finding.title}`, margin, y);
      doc.setFont('helvetica', 'normal');
      y = addWrapped(finding.description, y + 3.5, 8, 3.5, 170);
      y += 3;
    });
  }

  // Footer / page numbers
  const totalPages = (doc.internal.pages.length || 1) - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    setGray(100);
    doc.text('SENTINEL DOCUMENT INTELLIGENCE', margin, pageH - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
    drawLine(pageH - 12);
  }

  doc.save(`sentinel-report-${result.filename.replace(/\.[^/.]+$/, '')}.pdf`);
}

function useCountUp(target: number, delay: number, duration = 1.2) {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCount(0);
    timeoutRef.current = setTimeout(() => {
      const steps = 52;
      const stepDuration = (duration * 1000) / steps;
      let step = 0;
      intervalRef.current = setInterval(() => {
        step++;
        const t = step / steps;
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(target * eased));
        if (step >= steps) {
          setCount(target);
          clearInterval(intervalRef.current!);
        }
      }, stepDuration);
    }, delay * 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target, delay, duration]);
  return count;
}

function SegmentBar({
  value,
  segments = 32,
  color = 'var(--accent)',
  segmentHeight = 3,
  label,
  labelWidth = 120,
  showValue = true,
  delay = 0,
  countUp = true,
}: {
  value: number;
  segments?: number;
  color?: string;
  segmentHeight?: number;
  label?: string;
  labelWidth?: number;
  showValue?: boolean;
  delay?: number;
  countUp?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const filled = Math.round((value / 100) * segments);
  const count = useCountUp(value, delay + 0.05, 1.2);
  const displayValue = countUp ? count : Math.round(value);
  return (
    <div ref={ref} className="flex items-center gap-3 w-full">
      {label && (
        <span className="flex-shrink-0 text-[11px] uppercase tracking-[0.14em] text-white/30" style={{ fontFamily: 'var(--font-mono)', width: labelWidth }}>
          {label}
        </span>
      )}
      <div className="relative flex gap-[2px] flex-1 items-center">
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled;
          const isLeading = i === filled - 1;
          const progress = filled > 1 ? i / (filled - 1) : 1;
          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={inView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{
                delay: delay + i * 0.016,
                duration: 0.22,
                ease: i >= filled - 3 ? [0.34, 1.56, 0.64, 1] : [0.22, 0.61, 0.36, 1],
              }}
              style={{
                height: segmentHeight,
                flex: 1,
                transformOrigin: 'left center',
                borderRadius: 0,
                backgroundColor: isFilled ? color : 'rgba(255,255,255,0.05)',
                opacity: isFilled ? 0.18 + progress * 0.82 : 1,
                boxShadow: isLeading
                  ? `0 0 10px ${color}, 0 0 22px ${color}66, 0 0 3px ${color}`
                  : i >= filled - 4 && isFilled
                  ? `0 0 4px ${color}40`
                  : undefined,
              }}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="flex-shrink-0 text-[11px] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color, width: 24, textAlign: 'right' }}>
          {displayValue}
        </span>
      )}
    </div>
  );
}

function AnimatedScoreDisplay({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
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
        if (s >= steps) { setDisplayVal(Math.round(value)); clearInterval(iv); }
      }, stepMs);
      return () => clearInterval(iv);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline gap-3">
        <motion.span className="text-4xl text-white" style={{ fontFamily: 'var(--font-display)' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}>
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

function MiniBar({ label, value, max, color, delay = 0 }: { label: string; value: number; max: number; color: string; delay?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] text-white/30 w-16 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
      <div className="flex-1 h-[6px] bg-white/[0.05] overflow-hidden" style={{ borderRadius: '1px' }}>
        <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }} style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}66` }} />
      </div>
      <span className="text-[11px] text-white/40 w-8 text-right tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function ComplexityMiniChart({ dist, delay = 0 }: { dist: Array<{ range: string; count: number }>; delay?: number }) {
  const max = Math.max(...dist.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {dist.map((d, i) => (
        <div key={d.range} className="flex items-center gap-2.5">
          <span className="text-[11px] text-white/30 w-12 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>{d.range}</span>
          <div className="flex-1 h-[5px] bg-white/[0.04] overflow-hidden" style={{ borderRadius: '1px' }}>
            <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: `${(d.count / max) * 100}%` }} transition={{ delay: delay + i * 0.06, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }} style={{ backgroundColor: i < 2 ? 'var(--accent)' : i === 2 ? '#facc15' : '#ef4444', opacity: 0.7 + (1 - i / dist.length) * 0.3 }} />
          </div>
          <span className="text-[11px] text-white/40 w-6 text-right tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function TestMetricCard({ icon: Icon, label, value, sub, color, delay = 0 }: { icon: React.ElementType; label: string; value: string; sub: string; color: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }} className="p-4 bg-white/[0.02] border border-white/[0.05] text-center" style={{ borderRadius: '1px' }}>
      <Icon size={16} style={{ color }} className="mx-auto mb-2" />
      <div className="text-lg text-white mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{value}</div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>{label}</div>
      <div className="text-[11px] text-white/20 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{sub}</div>
    </motion.div>
  );
}

// ── Main dashboard component ───────────────────────────────────────────────

interface AnalysisDashboardProps {
  result: ScanResult;
  onReset: () => void;
}

export default function AnalysisDashboard({ result, onReset }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [expanded, setExpanded] = useState<string | null>(null);
  const scan = useMemo(() => analyzeDocument(result), [result]);

  const readingTime = Math.max(1, Math.round(result.wordCount / 200));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <button
            onClick={onReset}
            className="text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-[var(--accent)] flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft size={12} /> New Analysis
          </button>
          <GlitchyText
            text={result.filename.toUpperCase()}
            as="h2"
            triggerOnMount
            className="text-2xl md:text-3xl text-white tracking-[0.1em]"
            style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
          />
          <p className="text-xs text-white/30 mt-1" style={{ fontFamily: 'var(--font-body)' }}>
            Document scan complete · {scan.scanDate}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => downloadReport(result, scan)}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--accent)]/10 transition-colors"
            style={{ borderRadius: '1px' }}
          >
            <Download size={14} /> Report
          </button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Words Scanned</p>
            <p className="text-2xl text-[var(--accent)]">{result.wordCount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Reading Time</p>
            <p className="text-2xl text-white">{readingTime}m</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/[0.06]">
        {TABS.map((tab) => {
          const Icon = tabIcons[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 md:px-6 py-3 text-[11px] uppercase tracking-[0.24em] transition-all duration-200 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-mono)',
                color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.28)',
              }}
            >
              <Icon size={12} />
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ backgroundColor: 'var(--accent)' }} />
              )}
            </button>
          );
        })}
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
          {activeTab === 'Overview' && (
            <div className="space-y-5">
              {/* Score grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Overall', value: Math.round(scan.overallScore), delay: 0 },
                  { label: 'Privacy', value: Math.round(scan.securityScore), delay: 0.06 },
                  { label: 'Clarity', value: Math.round(scan.codeQualityScore), delay: 0.12 },
                  { label: 'Structure', value: Math.round(scan.architectureScore), delay: 0.18 },
                  { label: 'Entities', value: Math.round(scan.skillScore), delay: 0.24 },
                ].map((item) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="glass border border-white/[0.07] p-5"
                  style={{ borderRadius: '1px' }}
                >
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                    Document Metrics
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Sections', value: scan.architectureDetails.layerBreakdown.length },
                      { label: 'Lines', value: scan.metrics.linesOfCode.toLocaleString() },
                      { label: 'Clarity', value: `${Math.round(scan.codeQualityScore)}%` },
                      { label: 'Avg Sentence', value: scan.metrics.avgComplexity.toFixed(1) },
                      { label: 'Paragraphs', value: scan.metrics.paragraphs },
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
                      { label: 'Overall', value: Math.round(scan.overallScore) },
                      { label: 'Privacy', value: Math.round(scan.securityScore) },
                      { label: 'Clarity', value: Math.round(scan.codeQualityScore) },
                      { label: 'Structure', value: Math.round(scan.architectureScore) },
                      { label: 'Entities', value: Math.round(scan.skillScore) },
                    ].map((s, i) => (
                      <SegmentBar key={s.label} label={s.label} value={s.value} segments={16} segmentHeight={7} delay={0.3 + i * 0.06} labelWidth={80} />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Finding summary */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="glass border border-white/[0.07] p-5"
                style={{ borderRadius: '1px' }}
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                  Sensitivity Summary
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {(['critical', 'high', 'medium', 'low'] as SeverityLevel[]).map((sev) => {
                    const cfg = severityConfig[sev];
                    const count = scan.findings.filter((f) => f.severity === sev).length;
                    return (
                      <motion.div
                        key={sev}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + ['critical', 'high', 'medium', 'low'].indexOf(sev) * 0.06, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
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

              {/* Neural Summary */}
              <div className="p-8 border border-white/10 bg-white/2 relative">
                <div className="absolute top-0 left-0 w-1 h-8 bg-[var(--accent)]" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6">Neural Summary</h3>
                <RichText text={result.summary} mode="paragraphs" />
              </div>

              {/* Key Insights */}
              <div className="p-8 border border-white/10 bg-white/5">
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6">Key Insights</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {result.keyPoints.filter((p) => p && p.trim()).map((point, i) => (
                    <li key={i} className="flex gap-4 group">
                      <span className="text-[var(--accent)] text-[10px] mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors">{formatCitations(point)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'Privacy' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] uppercase tracking-[0.28em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
                  {scan.findings.length} findings detected
                </span>
                <div className="flex-1 h-px bg-white/[0.05]" />
                <span className="text-[11px] text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>
                  Sensitive Data Scanner
                </span>
              </div>
              {scan.findings.length === 0 && (
                <div className="glass border border-white/[0.07] p-8 text-center" style={{ borderRadius: '1px' }}>
                  <Shield className="mx-auto mb-3 text-emerald-400/60" size={24} />
                  <div className="text-sm text-white/50" style={{ fontFamily: 'var(--font-display)' }}>No sensitive items detected</div>
                  <div className="text-[11px] text-white/20 mt-1" style={{ fontFamily: 'var(--font-mono)' }}>No emails, phone numbers, SSNs, cards, or secret-like strings were found.</div>
                </div>
              )}
              {scan.findings.map((finding) => {
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
                      <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 border" style={{ color: cfg.color, borderColor: cfg.border, borderRadius: '1px', fontFamily: 'var(--font-mono)' }}>
                        {finding.tool}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border" style={{ color: cfg.color, borderColor: cfg.border, borderRadius: '1px', fontFamily: 'var(--font-mono)' }}>
                        {finding.severity}
                      </span>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
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
          {activeTab === 'Clarity' && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass border border-white/[0.07] p-5"
                style={{ borderRadius: '1px' }}
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                  Clarity Metrics
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Clarity', value: Math.round(scan.codeQualityScore) },
                    { label: 'Coverage', value: Math.round(scan.codeQualityDetails.docCoverage) },
                    { label: 'Consistency', value: Math.round(scan.codeQualityDetails.consistencyScore) },
                    { label: 'Quality', value: Math.round(scan.codeQualityDetails.reviewScore) },
                    { label: 'Balance', value: Math.round(scan.codeQualityDetails.testQuality) },
                  ].map((m, i) => (
                    <SegmentBar key={m.label} label={m.label} value={m.value} segments={24} segmentHeight={8} delay={i * 0.07} labelWidth={120} />
                  ))}
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="glass border border-white/[0.07] p-5"
                  style={{ borderRadius: '1px' }}
                >
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                    Sentence Complexity
                  </div>
                  <ComplexityMiniChart dist={scan.codeQualityDetails.complexityDist} delay={0.15} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="glass border border-white/[0.07] p-5"
                  style={{ borderRadius: '1px' }}
                >
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                    Document Health
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <TestMetricCard icon={BarChart3} label="Sentences" value={`${scan.codeQualityDetails.complexityDist.reduce((a, b) => a + b.count, 0)}`} sub="total" color="var(--accent)" delay={0.2} />
                    <TestMetricCard icon={CheckSquare} label="Paragraphs" value={`${scan.metrics.paragraphs}`} sub="blocks" color="#4ade80" delay={0.25} />
                    <TestMetricCard icon={FileCode} label="Avg Words" value={`${scan.metrics.avgComplexity.toFixed(1)}`} sub="per sentence" color="#facc15" delay={0.3} />
                    <TestMetricCard icon={BookOpen} label="Doc Score" value={`${Math.round(scan.codeQualityScore)}`} sub="/100" color="#60a5fa" delay={0.35} />
                  </div>
                </motion.div>
              </div>

              {scan.codeSmells.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="glass border border-white/[0.07] p-5"
                  style={{ borderRadius: '1px' }}
                >
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                    Clarity Issues
                  </div>
                  <div className="space-y-2.5">
                    {scan.codeSmells.map((smell, i) => {
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
                          <button onClick={() => setExpanded(isOpen ? null : smell.id)} className="w-full flex items-center gap-3 p-3 text-left">
                            <span className="text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 border flex-shrink-0" style={{ color: cfg.color, borderColor: cfg.border, borderRadius: '1px', fontFamily: 'var(--font-mono)' }}>
                              {sev}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-white/60" style={{ fontFamily: 'var(--font-display)' }}>{smell.type}</div>
                              <div className="text-[11px] text-white/25 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{smell.file}</div>
                            </div>
                            <span className="text-sm text-white/40 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>×{smell.count}</span>
                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
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
          {activeTab === 'Structure' && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass border border-white/[0.07] p-5"
                style={{ borderRadius: '1px' }}
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                  Structure Health
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: 'Overall', value: scan.architectureScore },
                    { label: 'Coupling', value: scan.architectureDetails.couplingScore },
                    { label: 'Cohesion', value: scan.architectureDetails.cohesionScore },
                    { label: 'Modularity', value: scan.architectureDetails.modularityScore },
                  ].map((s, i) => (
                    <div key={s.label} className="text-center">
                      <motion.span className="text-3xl text-white block mb-1" style={{ fontFamily: 'var(--font-display)' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                        {Math.round(s.value)}
                      </motion.span>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                      <div className="mt-2">
                        <SegmentBar value={s.value} segments={12} segmentHeight={4} showValue={false} delay={i * 0.06} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <MiniBar label="Layer Sep" value={scan.architectureDetails.layerSeparation} max={100} color="var(--accent)" delay={0.25} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="glass border border-white/[0.07] p-5"
                style={{ borderRadius: '1px' }}
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                  Section Breakdown
                </div>
                <div className="space-y-2.5">
                  {scan.architectureDetails.layerBreakdown.map((layer, i) => (
                    <div key={layer.layer} className="flex items-center gap-3">
                      <span className="text-[11px] text-white/40 w-32 md:w-48 flex-shrink-0 truncate" style={{ fontFamily: 'var(--font-mono)' }}>{layer.layer}</span>
                      <div className="flex-1 h-[6px] bg-white/[0.04] overflow-hidden" style={{ borderRadius: '1px' }}>
                        <motion.div
                          className="h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${layer.score}%` }}
                          transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
                          style={{ backgroundColor: layer.score > 75 ? 'var(--accent)' : layer.score > 50 ? '#facc15' : '#ef4444', opacity: 0.8, boxShadow: layer.score > 75 ? '0 0 6px var(--accent)44' : undefined }}
                        />
                      </div>
                      <span className="text-[11px] text-white/30 w-8 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{layer.files}</span>
                      <span className="text-[11px] text-white/40 w-6 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(layer.score)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {scan.architectureDetails.couplingGraph.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="glass border border-white/[0.07] p-5"
                  style={{ borderRadius: '1px' }}
                >
                  <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                    Section Flow
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
                            style={{ backgroundColor: edge.strength > 75 ? '#ef4444' : edge.strength > 50 ? '#facc15' : 'var(--accent)', opacity: 0.7 }}
                          />
                        </div>
                        <span className="text-[11px] text-white/30 w-8 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{edge.strength}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scan.architectureDetails.detectedPatterns.length > 0 && (
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
                          transition={{ delay: 0.25 + i * 0.05, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                          className="text-[11px] px-2.5 py-1 border"
                          style={{ borderRadius: '1px', color: 'var(--accent)', borderColor: 'rgba(168,85,247,0.2)', backgroundColor: 'rgba(168,85,247,0.05)', fontFamily: 'var(--font-mono)' }}
                        >
                          {p}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
                {scan.architectureDetails.antiPatterns.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="glass border border-white/[0.07] p-5"
                    style={{ borderRadius: '1px' }}
                  >
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
                      Weak Signals
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scan.architectureDetails.antiPatterns.map((p, i) => (
                        <motion.span
                          key={p}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                          className="text-[11px] px-2.5 py-1 border"
                          style={{ borderRadius: '1px', color: '#fb923c', borderColor: 'rgba(251,146,60,0.2)', backgroundColor: 'rgba(251,146,60,0.05)', fontFamily: 'var(--font-mono)' }}
                        >
                          {p}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ── SKILLS TAB ── */}
          {activeTab === 'Entities' && (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass border border-white/[0.07] p-5"
                style={{ borderRadius: '1px' }}
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/25 mb-5" style={{ fontFamily: 'var(--font-mono)' }}>
                  Entity & Topic Density
                </div>
                <div className="space-y-5">
                  {scan.skillAssessment.map((skill, i) => {
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
                        <button onClick={() => setExpanded(isOpen ? null : `skill-${skill.name}`)} className="w-full p-4 text-left">
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-white/70" style={{ fontFamily: 'var(--font-display)' }}>{skill.name}</span>
                              <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 border" style={{ borderRadius: '1px', color: verdict.color, borderColor: verdict.border, backgroundColor: verdict.bg, fontFamily: 'var(--font-mono)' }}>
                                <VerdictIcon size={10} />
                                {skill.verdict}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {trendIcon(skill.trend)}
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                <ChevronDown size={12} className="text-white/25" />
                              </motion.div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase tracking-[0.14em] text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>Expected</span>
                                <span className="text-[11px] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>{skill.claimed}</span>
                              </div>
                              <div className="h-[4px] bg-white/[0.05] overflow-hidden" style={{ borderRadius: '1px' }}>
                                <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: `${skill.claimed}%` }} transition={{ delay: 0.15 + i * 0.07, duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-400/50" style={{ fontFamily: 'var(--font-mono)' }}>Actual</span>
                                <span className="text-[11px] text-emerald-400" style={{ fontFamily: 'var(--font-mono)' }}>{skill.actual}</span>
                              </div>
                              <div className="h-[4px] bg-white/[0.05] overflow-hidden" style={{ borderRadius: '1px' }}>
                                <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: `${skill.actual}%` }} transition={{ delay: 0.25 + i * 0.07, duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }} style={{ backgroundColor: 'var(--accent)', boxShadow: skill.actual >= skill.claimed ? '0 0 8px rgba(168,85,247,0.4)' : undefined }} />
                              </div>
                            </div>
                          </div>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }} className="border-t border-white/[0.06] overflow-hidden">
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
