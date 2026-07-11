import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  Upload, Loader2, AlertCircle, ArrowLeft,
  BarChart3, Clock,
} from 'lucide-react';
import GlitchyText from '@/components/ui/GlitchyText';
import { useScanDocument } from '@workspace/api-client-react';
import type { ScanResult } from '@workspace/api-client-react';

// --- Rich text helpers: paragraphs, tables, citations ------------------------

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

  // Markdown-style tables
  if (lines.every((l) => l.includes('|'))) {
    const cells = lines.map((l) => l.split('|').map((c) => c.trim()).filter((c) => c !== ''));
    if (cells.length >= 2 && cells.every((r) => r.length === cells[0].length && cells[0].length >= 2)) {
      const isSeparator = cells[1].every((c) => /^[-:]+$/.test(c));
      const headers = cells[0];
      const rows = isSeparator ? cells.slice(2) : cells.slice(1);
      if (rows.length >= 1) return { headers, rows };
    }
  }

  // Tab-delimited
  const tabRows = lines.map((l) => l.split('\t').map((c) => c.trim()).filter((c) => c !== ''));
  if (tabRows.length >= 2 && tabRows.every((r) => r.length === tabRows[0].length && tabRows[0].length >= 2)) {
    return { headers: tabRows[0], rows: tabRows.slice(1) };
  }

  // Space-aligned tables (2 or more spaces between columns)
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

const METRICS_KEY = 'sentinel_metrics';

interface Metrics {
  totalScanned: number;
  totalWords: number;
  storageUsed: number;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'settings'>('scan');

  const scanMutation = useScanDocument();
  const loading = scanMutation.isPending;

  // Browser-local storage metrics
  const [metrics, setMetrics] = useState<Metrics>({
    totalScanned: 0,
    totalWords: 0,
    storageUsed: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(METRICS_KEY);
    if (stored) setMetrics(JSON.parse(stored));
  }, []);

  const updateMetrics = (newWords: number) => {
    setMetrics((prev) => {
      const updated = {
        totalScanned: prev.totalScanned + 1,
        totalWords: prev.totalWords + newWords,
        storageUsed: Math.round(JSON.stringify(localStorage).length / 1024),
      };
      localStorage.setItem(METRICS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type.startsWith('image/'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF or Image (JPG, PNG)');
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setError(null);

    try {
      const data = await scanMutation.mutateAsync({
        data: { file: file as unknown as string, length },
      });
      setResult(data);
      updateMetrics(data.wordCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing file');
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-8" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] font-bold">S</div>
          <h1 className="text-xl uppercase tracking-[0.3em]">Sentinel <span className="text-white/20">Dashboard</span></h1>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${activeTab === 'scan' ? 'text-[var(--accent)]' : 'text-white/40'}`}
          >
            Scanner
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${activeTab === 'settings' ? 'text-[var(--accent)]' : 'text-white/40'}`}
          >
            Settings
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto">
        {activeTab === 'scan' ? (
          <div className="space-y-8">
            {!result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Upload Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="border-2 border-dashed border-white/10 bg-white/5 p-20 rounded-lg text-center hover:border-[var(--accent)] transition-colors cursor-pointer relative overflow-hidden"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="mx-auto mb-6 text-white/20" size={48} />
                  <p className="text-lg uppercase tracking-[0.2em] mb-2">
                    {file ? file.name : 'Drag & Drop Document'}
                  </p>
                  <p className="text-xs text-white/30 uppercase tracking-[0.1em]">
                    PDF, JPG, PNG Supported
                  </p>
                </div>

                {/* Options */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-6 border border-white/5 bg-white/2">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Summary Length:</span>
                    <div className="flex gap-2">
                      {(['short', 'medium', 'long'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLength(l)}
                          className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] border ${length === l ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-white/10 text-white/40'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!file || loading}
                    onClick={handleUpload}
                    className="px-10 py-3 bg-[var(--accent)] text-black text-[11px] uppercase tracking-[0.3em] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'Initialize Scan'}
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Result Header */}
                <div className="flex justify-between items-end border-b border-white/10 pb-6">
                  <div>
                    <button
                      onClick={() => { setResult(null); setFile(null); }}
                      className="text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-[var(--accent)] flex items-center gap-2 mb-4 transition-colors"
                    >
                      <ArrowLeft size={12} /> New Analysis
                    </button>
                    <h2 className="text-3xl uppercase tracking-[0.1em]">{result.filename}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Words Scanned</p>
                    <p className="text-2xl text-[var(--accent)]">{result.wordCount}</p>
                  </div>
                </div>

                <div className="space-y-8">
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
                      {result.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-4 group">
                          <span className="text-[var(--accent)] text-[10px] mt-1 shrink-0">0{i + 1}</span>
                          <span className="text-sm text-white/70 group-hover:text-white transition-colors">{formatCitations(point)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Extracted Data */}
                  <div className="p-8 border border-white/10 bg-white/2">
                    <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6">Extracted Data</h3>
                    <div className="max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
                      <RichText text={result.text} mode="pre" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <GlitchyText
              text="SYSTEM METRICS"
              as="h2"
              className="text-2xl uppercase tracking-[0.2em] mb-12 block"
              style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 border border-white/5 bg-white/2">
                <Clock className="text-[var(--accent)] mb-4" size={24} />
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">Total Scanned</p>
                <p className="text-4xl">{metrics.totalScanned}</p>
              </div>
              <div className="p-8 border border-white/5 bg-white/2">
                <BarChart3 className="text-[var(--accent)] mb-4" size={24} />
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">Words Processed</p>
                <p className="text-4xl">{metrics.totalWords.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-8 border border-white/5 bg-white/2">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">Browser Cache Usage</p>
                <p className="text-xs text-white/40">{metrics.storageUsed} KB / 5120 KB</p>
              </div>
              <div className="h-1 bg-white/10 w-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(metrics.storageUsed / 5120) * 100}%` }}
                  className="h-full bg-[var(--accent)]"
                />
              </div>
            </div>

            <div className="p-8 border border-red-500/10 bg-red-500/2 mt-12">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-red-500/50 mb-4">Danger Zone</h3>
              <button
                onClick={() => {
                  localStorage.removeItem(METRICS_KEY);
                  setMetrics({ totalScanned: 0, totalWords: 0, storageUsed: 0 });
                }}
                className="px-6 py-2 border border-red-500/20 text-red-500/50 text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
              >
                Clear Session Data
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
