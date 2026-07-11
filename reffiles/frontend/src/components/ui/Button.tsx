'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: [
      'relative overflow-hidden',
      'bg-[linear-gradient(135deg,rgba(0,217,255,0.15)_0%,rgba(167,139,250,0.15)_100%)]',
      'border border-[rgba(0,217,255,0.3)]',
      'text-white font-medium',
      'hover:bg-[linear-gradient(135deg,rgba(0,217,255,0.22)_0%,rgba(167,139,250,0.22)_100%)]',
      'hover:border-[rgba(0,217,255,0.5)]',
      'hover:shadow-[0_0_24px_rgba(0,217,255,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
      'active:scale-[0.98]',
      'backdrop-blur-md',
    ].join(' '),
    secondary: [
      'glass glass-hover',
      'text-white/80 font-medium',
      'hover:text-white',
    ].join(' '),
    ghost: [
      'bg-transparent border border-transparent',
      'text-white/60 font-medium',
      'hover:text-white hover:border-white/10 hover:bg-white/4',
    ].join(' '),
    danger: [
      'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]',
      'text-red-400 font-medium',
      'hover:bg-[rgba(239,68,68,0.18)] hover:border-[rgba(239,68,68,0.5)]',
    ].join(' '),
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : (
        icon && iconPosition === 'left' && icon
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
}
