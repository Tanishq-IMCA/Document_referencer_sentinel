import { useState, useRef, useCallback, useEffect } from 'react';

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*><_';

function getGlitchChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

interface GlitchyTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'label';
  speed?: number;
  revealOffset?: number;
  preserveSpaces?: boolean;
  triggerOnMount?: boolean;
  delay?: number;
}

export default function GlitchyText({
  text,
  className = '',
  style,
  as: Tag = 'span',
  speed = 22,
  revealOffset = 2,
  preserveSpaces = true,
  triggerOnMount = false,
  delay = 0,
}: GlitchyTextProps) {
  const [displayText, setDisplayText] = useState(
    triggerOnMount
      ? Array.from({ length: text.length }, (_, i) => (preserveSpaces && text[i] === ' ' ? ' ' : '\u00A0')).join('')
      : text
  );
  const intervalRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const runAnimation = useCallback(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);

    let iteration = 0;
    const target = text;

    intervalRef.current = window.setInterval(() => {
      const next = target
        .split('')
        .map((char: string, index: number): string => {
          if (preserveSpaces && char === ' ') return ' ';
          if (index < iteration) return target[index];
          if (index < iteration + revealOffset) return getGlitchChar();
          return '\u00A0';
        })
        .join('');

      setDisplayText(next);
      iteration += 1;

      if (iteration >= target.length + revealOffset) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(target);
      }
    }, speed);
  }, [text, speed, revealOffset, preserveSpaces]);

  useEffect(() => {
    if (triggerOnMount) {
      const timeout = setTimeout(runAnimation, delay);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [triggerOnMount, runAnimation, delay]);

  useEffect(() => {
    if (triggerOnMount) return;
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(runAnimation, delay);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runAnimation, triggerOnMount, delay]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag
      ref={elementRef as any}
      className={`inline-block ${className}`}
      style={{ minHeight: '1em', ...style }}
    >
      {displayText}
    </Tag>
  );
}
