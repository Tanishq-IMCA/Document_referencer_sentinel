'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Github, Bell, Shield, LogOut, Save, Eye, EyeOff, Check, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { showNotice } from '@/components/ui/NexusNotice';
import GlitchyText from '@/components/ui/GlitchyText';
import { allTechOptions, getTechInfo } from '@/lib/techConfig';

const techOptions = allTechOptions;

const sections = ['Profile', 'GitHub', 'Notifications', 'Security'];

const sectionIcons: Record<string, React.ReactNode> = {
  Profile:       <User size={13} />,
  GitHub:        <Github size={13} />,
  Notifications: <Bell size={13} />,
  Security:      <Shield size={13} />,
};

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState('Profile');
  const [showPat, setShowPat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || 'Alex Chen');
  const [techStack, setTechStack] = useState<string[]>(user?.techStack || ['Python', 'TypeScript', 'React']);
  const [pat, setPat] = useState('ghp_••••••••••••••••••••');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const toggleTech = (t: string) => {
    setTechStack(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    updateUser({ name, techStack });
    showNotice('SETTINGS SAVED', 'Your profile has been updated.', 'success');
    setIsSaving(false);
  };

  const handleRevokePat = () => {
    setPat('');
    showNotice('PAT REVOKED', 'Only public repositories will be scanned.', 'info');
  };

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  const inputClass = "w-full input-glass px-4 py-3.5 text-sm text-white";

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 border transition-all duration-300"
      style={{
        borderRadius: '1px',
        backgroundColor: value ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
        borderColor: value ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.12)',
        boxShadow: value ? '0 0 16px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
      }}
    >
      {/* Track glow line */}
      <div
        className="absolute top-1/2 left-1.5 right-1.5 h-[1px] transition-opacity duration-300"
        style={{
          opacity: value ? 0.3 : 0,
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
        }}
      />
      <motion.div
        animate={{
          x: value ? 21 : 2,
          backgroundColor: value ? 'var(--accent)' : 'rgba(255,255,255,0.25)',
          boxShadow: value
            ? '0 0 10px rgba(16,185,129,0.5), 0 2px 4px rgba(0,0,0,0.3)'
            : '0 1px 3px rgba(0,0,0,0.3)',
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className="absolute top-[3px] w-[18px] h-[18px]"
        style={{ borderRadius: '1px' }}
      >
        {/* Inner notch detail */}
        <div
          className="absolute inset-[3px] transition-opacity duration-200"
          style={{
            opacity: value ? 0.4 : 0.15,
            background: value
              ? 'linear-gradient(135deg, rgba(255,255,255,0.5), transparent)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
            borderRadius: '1px',
          }}
        />
      </motion.div>
    </button>
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'var(--font-display)' }}>
      {/* Header */}
      <header className="border-b border-white/[0.05] sticky top-0 z-40 backdrop-blur-md bg-[rgba(5,8,22,0.7)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-1.5 text-white/25 hover:text-white/60 transition-colors">
              <ArrowLeft size={14} />
            </Link>
            <div className="w-px h-4 bg-white/[0.08]" />
            <a href="/" className="text-sm uppercase tracking-[0.22em] text-white/40 hover:text-white/70 transition-colors smooth-glow">
              REPOSIGHT
            </a>
            <div className="text-white/15 text-sm">·</div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>Settings</span>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/25 hover:text-red-400/70 transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}>
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-[180px_1fr] gap-8">

          {/* Sidebar */}
          <nav className="space-y-0.5">
            {sections.map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs text-left transition-all duration-200 border"
                style={{
                  borderRadius: '1px',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.1em',
                  backgroundColor: activeSection === s ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderColor: activeSection === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: activeSection === s ? 'white' : 'rgba(255,255,255,0.35)',
                }}>
                {sectionIcons[s]}
                {s}
              </button>
            ))}
            <div className="pt-4 border-t border-white/[0.06]">
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-red-400/50 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/15 hover:bg-red-500/[0.04]"
                style={{ borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          </nav>

          {/* Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >

            {activeSection === 'Profile' && (
              <div className="glass border border-white/[0.07] p-8" style={{ borderRadius: '1px' }}>
                <GlitchyText text="PROFILE" as="h2"
                  className="text-xl text-white tracking-[0.12em] mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  Your identity used for audit calibration.
                </p>

                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 flex items-center justify-center text-2xl border border-white/[0.1] bg-white/[0.04]"
                      style={{ borderRadius: '1px', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                      {name[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="text-sm text-white" style={{ fontFamily: 'var(--font-display)' }}>{name}</p>
                      <p className="text-[11px] text-white/30 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                        {user?.email || 'demo@reposight.dev'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Display Name
                    </label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Email
                    </label>
                    <input type="email" value={user?.email || 'demo@reposight.dev'} className={`${inputClass} opacity-40`} disabled />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-3 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Tech Stack
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {techOptions.map(t => {
                        const sel = techStack.includes(t);
                        const info = getTechInfo(t);
                        return (
                          <motion.button key={t} onClick={() => toggleTech(t)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs transition-all duration-200 border"
                            style={{
                              borderRadius: '1px',
                              fontFamily: 'var(--font-mono)',
                              borderColor: sel ? info.color : 'rgba(255,255,255,0.07)',
                              backgroundColor: sel ? info.bg : 'rgba(255,255,255,0.02)',
                              color: sel ? info.color : 'rgba(255,255,255,0.35)',
                              boxShadow: sel ? `0 0 12px ${info.bg}` : 'none',
                            }}>
                            <motion.div
                              animate={{ scale: sel ? 1 : 0.8, opacity: sel ? 1 : 0.5 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              style={{ color: sel ? info.color : 'rgba(255,255,255,0.3)' }}
                            >
                              {info.icon}
                            </motion.div>
                            {t}
                            <AnimatePresence>
                              {sel && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                >
                                  <Check size={9} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button onClick={handleSave} disabled={isSaving}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition-all duration-200 disabled:opacity-60"
                      style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
                      {isSaving ? <RefreshCw size={13} className="animate-spin text-black/70" /> : <Save size={13} />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'GitHub' && (
              <div className="glass border border-white/[0.07] p-8" style={{ borderRadius: '1px' }}>
                <GlitchyText text="GITHUB CONNECTION" as="h2"
                  className="text-xl text-white tracking-[0.12em] mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  Manage your GitHub access and repository permissions.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-5 border border-emerald-500/[0.15] bg-emerald-500/[0.05]" style={{ borderRadius: '1px' }}>
                    <Github size={15} className="text-emerald-400/70" />
                    <div>
                      <p className="text-sm text-white" style={{ fontFamily: 'var(--font-display)' }}>
                        Connected as{' '}
                        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                          @{user?.githubUsername || 'alexchen'}
                        </span>
                      </p>
                      <p className="text-[11px] text-white/30 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>Public repositories accessible</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Personal Access Token
                    </label>
                    <div className="relative">
                      <input type={showPat ? 'text' : 'password'}
                        value={pat} onChange={e => setPat(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        className={`${inputClass} font-mono pr-12`} />
                      <button type="button" onClick={() => setShowPat(!showPat)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                        {showPat ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-white/20 mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
                      Requires <span className="text-white/35">repo:read</span> scope only
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-black transition-all duration-200"
                      style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
                      <Save size={12} /> Update Token
                    </motion.button>
                    <button onClick={handleRevokePat}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs text-red-400/55 border border-red-500/[0.15] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.05] transition-all duration-200"
                      style={{ borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
                      <Trash2 size={12} /> Revoke
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'Notifications' && (
              <div className="glass border border-white/[0.07] p-8" style={{ borderRadius: '1px' }}>
                <GlitchyText text="NOTIFICATIONS" as="h2"
                  className="text-xl text-white tracking-[0.12em] mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  Control when and how we reach you.
                </p>

                <div className="space-y-3">
                  {[
                    { label: 'Scan complete alerts', desc: 'Email when a repository scan finishes', value: emailAlerts, onChange: setEmailAlerts },
                    { label: 'Weekly digest', desc: 'Summary of new findings every Monday', value: weeklyDigest, onChange: setWeeklyDigest },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.06]" style={{ borderRadius: '1px' }}>
                      <div>
                        <p className="text-sm text-white" style={{ fontFamily: 'var(--font-display)' }}>{item.label}</p>
                        <p className="text-[11px] text-white/30 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>{item.desc}</p>
                      </div>
                      <Toggle value={item.value} onChange={item.onChange} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'Security' && (
              <div className="glass border border-white/[0.07] p-8" style={{ borderRadius: '1px' }}>
                <GlitchyText text="SECURITY" as="h2"
                  className="text-xl text-white tracking-[0.12em] mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  Manage your account security settings.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Current Password
                    </label>
                    <input type="password" placeholder="••••••••" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      New Password
                    </label>
                    <input type="password" placeholder="••••••••" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Confirm New Password
                    </label>
                    <input type="password" placeholder="••••••••" className={inputClass} />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => showNotice('PASSWORD UPDATED', 'Your password has been changed.', 'success')}
                    className="flex items-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition-all duration-200"
                    style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
                    <Shield size={13} /> Update Password
                  </motion.button>

                  <div className="pt-6 border-t border-white/[0.06]">
                    <h3 className="text-xs uppercase tracking-[0.28em] text-red-400/70 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                      Danger Zone
                    </h3>
                    <p className="text-xs text-white/25 mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 text-xs text-red-400/55 border border-red-500/[0.18] hover:text-red-400 hover:border-red-500/35 hover:bg-red-500/[0.05] transition-all duration-200"
                      style={{ borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
                      <Trash2 size={12} /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
