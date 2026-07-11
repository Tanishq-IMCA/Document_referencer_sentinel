'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showNotice } from '@/components/ui/NexusNotice';
import GlitchyText from '@/components/ui/GlitchyText';

function AuthContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGithub } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      showNotice('ACCESS GRANTED', 'Initializing your workspace...', 'success');
      router.push('/dashboard');
    } catch {
      showNotice('AUTH FAILED', 'Invalid credentials. Try demo@reposight.dev', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithub = async () => {
    try {
      await loginWithGithub();
      showNotice('GITHUB CONNECTED', 'Importing your repositories...', 'success');
      router.push('/onboarding');
    } catch {
      showNotice('CONNECTION FAILED', 'GitHub auth could not complete.', 'error');
    }
  };

  const fillDemo = () => {
    setEmail('demo@reposight.dev');
    setPassword('audit2026');
    setMode('signin');
  };

  const inputClass = "w-full input-glass px-4 py-3.5 text-sm text-white placeholder-white/20";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ fontFamily: 'var(--font-display)' }}>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <a href="/" className="text-base uppercase tracking-[0.24em] text-white/60 hover:text-white transition-colors smooth-glow">
          REPOSIGHT
        </a>
      </motion.div>

      {/* Demo credentials hint */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm mb-6 p-4 border border-white/[0.08] bg-white/[0.02] flex items-start gap-3"
        style={{ borderRadius: '1px' }}
      >
        <div className="w-[3px] h-full min-h-[28px] flex-shrink-0 self-stretch" style={{ backgroundColor: 'var(--accent)' }} />
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/40 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
            Demo Access
          </div>
          <div className="text-[11px] text-white/30 leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
            <span className="text-white/50">email</span>{'   '}demo@reposight.dev<br />
            <span className="text-white/50">pass</span>{'    '}audit2026
          </div>
          <button
            onClick={fillDemo}
            className="mt-2.5 text-[11px] uppercase tracking-[0.28em] transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
          >
            {'> use demo credentials'}
          </button>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-sm glass border border-white/[0.07] p-8"
        style={{ borderRadius: '1px' }}
      >
        {/* Mode toggle */}
        <div className="flex mb-8 border border-white/[0.07] p-0.5" style={{ borderRadius: '1px' }}>
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2.5 text-[11px] uppercase tracking-[0.28em] transition-all duration-200"
              style={{
                fontFamily: 'var(--font-display)',
                borderRadius: '1px',
                backgroundColor: mode === m ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.3)',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Heading */}
            <div className="mb-6">
              <GlitchyText
                text={mode === 'signin' ? 'WELCOME BACK.' : 'CREATE ACCOUNT.'}
                as="h2"
                triggerOnMount
                className="text-xl text-white tracking-[0.1em] uppercase"
                style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties}
              />
              <p className="text-[11px] text-white/30 mt-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                {mode === 'signin' ? 'Enter your credentials to continue.' : 'Set up your audit account.'}
              </p>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 text-[12px] uppercase tracking-[0.28em] text-black font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 mt-6"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin text-black/70" />
              ) : (
                mode === 'signin' ? '> Sign In' : '> Create Account'
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/20" style={{ fontFamily: 'var(--font-mono)' }}>or</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* GitHub */}
        <motion.button
          type="button"
          onClick={handleGithub}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/[0.1] text-white/50 text-[11px] uppercase tracking-[0.28em] transition-all duration-200 hover:border-white/20 hover:text-white/80 hover:bg-white/[0.03]"
          style={{ borderRadius: '1px', fontFamily: 'var(--font-display)' }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-8 text-[11px] text-white/20 text-center"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        By continuing, you agree to our Terms of Service.
      </motion.p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
