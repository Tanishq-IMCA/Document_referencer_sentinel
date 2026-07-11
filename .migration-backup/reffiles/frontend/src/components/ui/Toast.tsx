'use client';

import { showNotice, NoticeType } from '@/components/ui/NexusNotice';

interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'system' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

export function useToast() {
  const toast = (opts: ToastOptions) => {
    const type: NoticeType = opts.type === 'warning' ? 'info' : opts.type as NoticeType;
    showNotice(opts.title, opts.message || '', type, opts.duration);
  };
  return { toast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
