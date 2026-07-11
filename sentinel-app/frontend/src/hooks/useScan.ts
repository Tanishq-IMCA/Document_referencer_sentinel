'use client';

import { useState, useCallback, useRef } from 'react';
import { LastScan } from '@/types';
import { mockNeuralSearchScan } from '@/lib/scanData';

export interface ScanStep {
  name: string;
  status: 'done' | 'running' | 'pending';
}

export interface ScanState {
  steps: ScanStep[];
  progress: number;
  stage: string;
  message: string;
}

const STAGES = [
  { name: 'Fetching repository metadata', message: 'Connecting to GitHub API...' },
  { name: 'Cloning repository', message: 'Pulling source tree...' },
  { name: 'Running Semgrep', message: 'Scanning for security vulnerabilities...' },
  { name: 'Running Bandit', message: 'Analyzing Python security patterns...' },
  { name: 'Running Ruff', message: 'Checking code quality and style...' },
  { name: 'Computing complexity', message: 'Running radon cyclomatic analysis...' },
  { name: 'AI analysis', message: 'Sending curated findings to Claude...' },
  { name: 'Cross-referencing skills', message: 'Comparing stated vs. actual expertise...' },
  { name: 'Generating report', message: 'Compiling final assessment...' },
];

// Reuse the rich mock data from scanData.ts so live scans have the same depth
const mockScanResult: LastScan = {
  ...mockNeuralSearchScan,
  scanDate: new Date().toISOString(),
};

export function useScan() {
  const [scanState, setScanState] = useState<ScanState | null>(null);
  const [result, setResult] = useState<LastScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = useCallback(async (repoId: string, repoName?: string) => {
    setIsScanning(true);
    setResult(null);

    let stageIndex = 0;
    let stageProgress = 0;

    const buildSteps = (currentIdx: number): ScanStep[] =>
      STAGES.map((s, i) => ({
        name: s.name,
        status: i < currentIdx ? 'done' : i === currentIdx ? 'running' : 'pending',
      }));

    setScanState({
      steps: buildSteps(0),
      progress: 0,
      stage: STAGES[0].name,
      message: STAGES[0].message,
    });

    intervalRef.current = setInterval(() => {
      stageProgress += Math.random() * 18 + 7;

      if (stageProgress >= 100) {
        stageProgress = 0;
        stageIndex++;
      }

      if (stageIndex >= STAGES.length) {
        clearInterval(intervalRef.current!);
        setScanState(null);
        setIsScanning(false);
        setResult({ ...mockScanResult, scanDate: new Date().toISOString() });
        return;
      }

      const globalProgress =
        (stageIndex / STAGES.length) * 100 + stageProgress / STAGES.length;

      setScanState({
        steps: buildSteps(stageIndex),
        progress: Math.min(globalProgress, 99),
        stage: STAGES[stageIndex].name,
        message: STAGES[stageIndex].message,
      });
    }, 220);
  }, []);

  const cancelScan = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsScanning(false);
    setScanState(null);
  }, []);

  return { scanState, result, isScanning, startScan, cancelScan };
}
