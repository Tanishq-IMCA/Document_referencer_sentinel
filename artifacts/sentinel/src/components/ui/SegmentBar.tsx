import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface SegmentBarProps {
  value: number;
  segments?: number;
  color?: string;
  segmentHeight?: number;
  label?: string;
  labelWidth?: number;
  showValue?: boolean;
  delay?: number;
  countUp?: boolean;
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
        // Ease-out: fast start, decelerates to end (satisfying)
        const t = step / steps;
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(target * eased));
        if (step >= steps) {
          setCount(Math.round(target));
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

export function SegmentBar({
  value,
  segments = 32,
  color = '#a855f7',
  segmentHeight = 3,
  label,
  labelWidth = 120,
  showValue = true,
  delay = 0,
  countUp = true,
}: SegmentBarProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const filled = Math.round((value / 100) * segments);
  const count = useCountUp(value, delay + 0.05, 1.2);
  const displayValue = countUp ? count : Math.round(value);

  return (
    <div ref={ref} className="flex items-center gap-3 w-full">
      {label && (
        <span
          className="flex-shrink-0 text-[11px] uppercase tracking-[0.14em] text-white/30"
          style={{ fontFamily: 'var(--font-mono)', width: labelWidth }}
        >
          {label}
        </span>
      )}

      {/* Bar track */}
      <div className="relative flex gap-[2px] flex-1 items-center">
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled;
          const isLeading = i === filled - 1;
          // Progress within filled segments: 0 at left, 1 at leading edge
          const progress = filled > 1 ? i / (filled - 1) : 1;
          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={inView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{
                delay: delay + i * 0.016,
                duration: 0.22,
                // Slight spring overshoot on the last few segments for punch
                ease: i >= filled - 3
                  ? [0.34, 1.56, 0.64, 1]
                  : [0.22, 0.61, 0.36, 1],
              }}
              style={{
                height: segmentHeight,
                flex: 1,
                transformOrigin: 'left center',
                borderRadius: 0,
                backgroundColor: isFilled ? color : 'rgba(255,255,255,0.05)',
                // Ramp opacity: dim at left, full-bright at leading edge
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
        <span
          className="flex-shrink-0 text-[11px] tabular-nums"
          style={{
            fontFamily: 'var(--font-mono)',
            color: color,
            width: 24,
            textAlign: 'right',
          }}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}
