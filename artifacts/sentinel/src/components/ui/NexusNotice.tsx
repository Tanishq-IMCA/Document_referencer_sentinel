import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

export type NoticeType = 'success' | 'error' | 'system' | 'info';

export interface Notice {
  id: string;
  title: string;
  message: string;
  type: NoticeType;
  duration?: number;
}

let addNoticeGlobal: (notice: Omit<Notice, 'id'>) => void = () => {};

export const showNotice = (
  title: string,
  message: string,
  type: NoticeType = 'info',
  duration = 4000
) => {
  addNoticeGlobal({ title, message, type, duration });
};

export function NexusNoticeContainer() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const addNotice = useCallback((notice: Omit<Notice, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotices((prev) => [...prev, { ...notice, id }]);

    if (notice.duration !== Infinity) {
      setTimeout(() => {
        setNotices((prev) => prev.filter((n) => n.id !== id));
      }, notice.duration || 4000);
    }
  }, []);

  useEffect(() => {
    addNoticeGlobal = addNotice;
  }, [addNotice]);

  return (
    <div
      className="fixed top-5 left-5 z-[10000] flex flex-col gap-3 pointer-events-none"
      style={{ perspective: '1000px' }}
    >
      <AnimatePresence>
        {notices.map((notice) => {
          const isError = notice.type === 'error';
          const barColor = isError ? '#ff4444' : 'var(--accent, #a855f7)';
          const barShadow = isError
            ? '0 0 15px rgba(255, 68, 68, 0.5)'
            : '0 0 15px rgba(168, 85, 247, 0.5)';

          return (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: -80, scale: 0.92, marginTop: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, scale: 1, marginTop: 0, height: 'auto' }}
              exit={{ opacity: 0, x: -100, scale: 0.85, marginTop: -12, height: 0 }}
              transition={{
                x: { type: 'spring', stiffness: 320, damping: 28 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.35 },
                height: { duration: 0.25 },
              }}
              className="relative bg-white/[0.04] backdrop-blur-2xl saturate-[180%] p-2.5 pr-6 text-white flex items-center gap-4 w-fit min-w-[280px] border border-white/[0.09] shadow-[0_15px_35px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto"
              style={{ borderRadius: '1px' }}
            >
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  background:
                    'linear-gradient(135deg, transparent 0%, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%, transparent 100%)',
                  backgroundSize: '300% 300%',
                  backgroundPosition: '100% 100%',
                  animation: 'slowReflection 8s infinite linear',
                }}
              />
              <div
                className="relative w-[3px] h-8 overflow-hidden z-10 flex-shrink-0"
                style={{ backgroundColor: barColor, boxShadow: barShadow }}
              >
                <div
                  className="absolute left-0 w-full h-full bg-white opacity-30"
                  style={{ animation: 'barSlideUp 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </div>
              <div className="flex flex-col justify-center z-10 relative">
                <div
                  className="text-sm tracking-widest text-white leading-tight uppercase"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {notice.title}
                </div>
                <div
                  className="text-xs text-white/70 tracking-wide mt-0.5"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {notice.message}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
