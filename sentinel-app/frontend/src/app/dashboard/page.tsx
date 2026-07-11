'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Upload, FileText, Image as ImageIcon, CheckCircle2, 
  Loader2, AlertCircle, ChevronRight, Settings as SettingsIcon,
  BarChart3, Clock, ArrowLeft
} from 'lucide-react';
import GlitchyText from '@/components/ui/GlitchyText';

interface ScanResult {
  filename: string;
  text: string;
  summary: string;
  key_points: string[];
  word_count: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'settings'>('scan');
  
  // Browser storage metrics
  const [metrics, setMetrics] = useState({
    totalScanned: 0,
    totalWords: 0,
    storageUsed: 0
  });

  useEffect(() => {
    const stored = localStorage.getItem('sentinel_metrics');
    if (stored) setMetrics(JSON.parse(stored));
  }, []);

  const updateMetrics = (newWords: number) => {
    const updated = {
      totalScanned: metrics.totalScanned + 1,
      totalWords: metrics.totalWords + newWords,
      storageUsed: Math.round(JSON.stringify(localStorage).length / 1024)
    };
    setMetrics(updated);
    localStorage.setItem('sentinel_metrics', JSON.stringify(updated));
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
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('length', length);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/scan`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to process document');
      const data = await res.json();
      setResult(data);
      updateMetrics(data.word_count);
    } catch (err: any) {
      setError(err.message || 'Error processing file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-8" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
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
                        {['short', 'medium', 'long'].map((l) => (
                          <button
                            key={l}
                            onClick={() => setLength(l as any)}
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
                      onClick={() => setResult(null)}
                      className="text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-[var(--accent)] flex items-center gap-2 mb-4 transition-colors"
                    >
                      <ArrowLeft size={12} /> New Analysis
                    </button>
                    <h2 className="text-3xl uppercase tracking-[0.1em]">{result.filename}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Words Scanned</p>
                    <p className="text-2xl text-[var(--accent)]">{result.word_count}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Summary */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="p-8 border border-white/10 bg-white/2 relative">
                      <div className="absolute top-0 left-0 w-1 h-8 bg-[var(--accent)]" />
                      <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6">Neural Summary</h3>
                      <p className="text-white/80 leading-relaxed text-sm italic">
                        "{result.summary}"
                      </p>
                    </div>

                    <div className="p-8 border border-white/10 bg-white/2">
                       <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6">Extracted Data</h3>
                       <div className="max-h-60 overflow-y-auto pr-4 scrollbar-thin text-white/40 text-[12px] leading-relaxed font-mono">
                         {result.text}
                       </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-6">
                     <div className="p-8 border border-white/10 bg-white/5">
                        <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">Key Insights</h3>
                        <ul className="space-y-6">
                          {result.key_points.map((point, i) => (
                            <li key={i} className="flex gap-4 group">
                               <span className="text-[var(--accent)] text-[10px] mt-1">0{i+1}</span>
                               <span className="text-sm text-white/70 group-hover:text-white transition-colors">{point}</span>
                            </li>
                          ))}
                        </ul>
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
            <h2 className="text-2xl uppercase tracking-[0.2em] mb-12">System Metrics</h2>
            
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
                   localStorage.removeItem('sentinel_metrics');
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
