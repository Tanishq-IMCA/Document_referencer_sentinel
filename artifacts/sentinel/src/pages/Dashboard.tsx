import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  Upload, Loader2, AlertCircle, ArrowLeft,
  BarChart3, Clock, FileText, Zap, Shield, Brain,
} from 'lucide-react';
import GlitchyText from '@/components/ui/GlitchyText';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import { useScanDocument } from '@workspace/api-client-react';
import type { ScanResult } from '@workspace/api-client-react';

const METRICS_KEY = 'sentinel_metrics';

interface Metrics {
  totalScanned: number;
  totalWords: number;
  storageUsed: number;
}

const PROCESS_LOGS = [
  { t: 0.0, text: '> ingesting document...' },
  { t: 0.15, text: '> extracting text layer...' },
  { t: 0.35, text: '> running neural OCR fallback...' },
  { t: 0.55, text: '> analyzing sentence structure...' },
  { t: 0.70, text: '> detecting entities & topics...' },
  { t: 0.82, text: '> scanning for sensitive data...' },
  { t: 0.92, text: '> generating neural summary...' },
  { t: 1.0, text: '> compiling results...' },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'settings'>('scan');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scanMutation = useScanDocument();
  const loading = scanMutation.isPending || processing;

  const [metrics, setMetrics] = useState<Metrics>({
    totalScanned: 0,
    totalWords: 0,
    storageUsed: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(METRICS_KEY);
    if (stored) setMetrics(JSON.parse(stored));
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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
    setIsDragging(false);
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
    setProcessing(true);
    setProgress(0);
    setLogs([]);

    let apiDone = false;
    let apiResult: ScanResult | null = null;
    let apiError: Error | null = null;

    // API call
    scanMutation.mutateAsync({ data: { file: file as unknown as string, length } })
      .then((data) => { apiResult = data; apiDone = true; })
      .catch((err) => { apiError = err instanceof Error ? err : new Error('Error processing file'); apiDone = true; });

    // 4.5s animated progress + live logs
    const duration = 4500;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct * 100);

      const visible = PROCESS_LOGS.filter((l) => l.t <= pct).map((l) => l.text);
      setLogs((prev) => {
        const next = [...prev];
        visible.forEach((text) => { if (!next.includes(text)) next.push(text); });
        return next;
      });

      if (pct < 1) {
        requestAnimationFrame(tick);
      } else if (apiDone) {
        finish(apiResult, apiError);
      } else {
        setLogs((prev) => [...prev, '> It\'s taking longer than anticipated.. please wait']);
        const wait = setInterval(() => {
          if (apiDone) {
            clearInterval(wait);
            finish(apiResult, apiError);
          }
        }, 50);
      }
    };
    requestAnimationFrame(tick);
  };

  const finish = (data: ScanResult | null, err: Error | null) => {
    setProcessing(false);
    setProgress(100);
    if (err) {
      setError(err.message);
    } else if (data) {
      setResult(data);
      updateMetrics(data.wordCount);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-8" style={{ fontFamily: 'var(--font-display)' }}>
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] font-bold transition-colors group-hover:bg-[var(--accent)] group-hover:text-black">
            S
          </div>
          <h1 className="text-xl uppercase tracking-[0.3em]">
            Sentinel <span className="text-white/20">Dashboard</span>
          </h1>
        </div>

        <div className="flex gap-4">
          {(['scan', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${activeTab === t ? 'text-[var(--accent)]' : 'text-white/40 hover:text-white/70'}`}
            >
              {t}
            </button>
          ))}
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
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${isDragging ? 'border-[var(--accent)] bg-[rgba(168,85,247,0.07)]' : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'}`}
                  style={{ border: '1px dashed', borderRadius: '1px', padding: '4.5rem 2rem' }}
                >
                  <AnimatePresence>
                    {isDragging && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)' }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative text-center space-y-4">
                    <motion.div
                      animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="inline-flex items-center justify-center w-16 h-16 border border-white/10"
                      style={{ borderRadius: '1px' }}
                    >
                      <Upload className={`transition-colors ${isDragging ? 'text-[var(--accent)]' : 'text-white/20'}`} size={32} />
                    </motion.div>

                    <div>
                      <p className={`text-lg uppercase tracking-[0.2em] mb-2 transition-colors ${isDragging ? 'text-[var(--accent)]' : 'text-white'}`}>
                        {file ? file.name : isDragging ? 'Release to Scan' : 'Drag & Drop Document'}
                      </p>
                      <p className="text-xs text-white/30 uppercase tracking-[0.1em]">
                        PDF, JPG, PNG Supported
                      </p>
                    </div>

                    {file && !loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] uppercase tracking-[0.2em]"
                        style={{ borderRadius: '1px' }}
                      >
                        <FileText size={12} />
                        {file.name}
                      </motion.div>
                    )}
                  </div>

                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => { setFile(e.target.files?.[0] || null); setError(null); }}
                  />
                </div>

                {/* Processing panel */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass overflow-hidden"
                      style={{ borderRadius: '1px' }}
                    >
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-[0.28em] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
                            Processing
                          </span>
                          <span className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <div className="h-[2px] w-full bg-white/[0.05] overflow-hidden">
                          <motion.div
                            className="h-full"
                            style={{
                              width: `${progress}%`,
                              background: 'linear-gradient(90deg, rgba(168,85,247,0.5) 0%, #a855f7 100%)',
                              boxShadow: '0 0 8px rgba(168,85,247,0.6)',
                            }}
                            transition={{ duration: 0.05 }}
                          />
                        </div>

                        <div className="space-y-1 max-h-32 overflow-y-auto" style={{ fontFamily: 'var(--font-mono)' }}>
                          {logs.map((text, i) => (
                            <motion.div
                              key={`${text}-${i}`}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[11px] text-white/40"
                            >
                              {text}
                            </motion.div>
                          ))}
                          <div ref={logEndRef} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Options */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-6 glass" style={{ borderRadius: '1px' }}>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Summary Length:</span>
                    <div className="flex gap-2">
                      {(['short', 'medium', 'long'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={(e) => { e.stopPropagation(); setLength(l); }}
                          className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] border transition-colors ${length === l ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                          style={{ borderRadius: '1px' }}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!file || loading}
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    className="px-10 py-3 bg-[var(--accent)] text-black text-[11px] uppercase tracking-[0.3em] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-transform active:scale-95"
                    style={{ borderRadius: '1px' }}
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                    {loading ? 'Processing' : 'Initialize Scan'}
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] uppercase tracking-[0.2em] flex items-center gap-3" style={{ borderRadius: '1px' }}>
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
              </motion.div>
            ) : (
              <AnalysisDashboard
                result={result}
                onReset={() => { setResult(null); setFile(null); setProgress(0); setLogs([]); }}
              />
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
              <div className="p-8 glass" style={{ borderRadius: '1px' }}>
                <Clock className="text-[var(--accent)] mb-4" size={24} />
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">Total Scanned</p>
                <p className="text-4xl">{metrics.totalScanned}</p>
              </div>
              <div className="p-8 glass" style={{ borderRadius: '1px' }}>
                <BarChart3 className="text-[var(--accent)] mb-4" size={24} />
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">Words Processed</p>
                <p className="text-4xl">{metrics.totalWords.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-8 glass" style={{ borderRadius: '1px' }}>
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

            <div className="p-8 border border-red-500/10 bg-red-500/2 mt-12" style={{ borderRadius: '1px' }}>
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-red-500/50 mb-4">Danger Zone</h3>
              <button
                onClick={() => {
                  localStorage.removeItem(METRICS_KEY);
                  setMetrics({ totalScanned: 0, totalWords: 0, storageUsed: 0 });
                }}
                className="px-6 py-2 border border-red-500/20 text-red-500/50 text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
                style={{ borderRadius: '1px' }}
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
