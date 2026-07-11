'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'purple' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function GlassCard({
  children,
  className,
  hover = false,
  glow = 'none',
  padding = 'md',
  ...props
}: GlassCardProps) {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const glowMap = {
    none: '',
    blue: 'shadow-[0_0_40px_rgba(0,217,255,0.08)]',
    purple: 'shadow-[0_0_40px_rgba(167,139,250,0.08)]',
  };

  return (
    <motion.div
      className={clsx(
        'glass rounded-2xl',
        paddingMap[padding],
        glowMap[glow],
        hover && 'glass-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
