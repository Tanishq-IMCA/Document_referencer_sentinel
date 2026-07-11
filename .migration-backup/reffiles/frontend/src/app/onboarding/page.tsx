'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, ChevronLeft, Eye, EyeOff, AlertTriangle, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { showNotice } from '@/components/ui/NexusNotice';
import { OnboardingData, ExperienceLevel } from '@/types';
import GlitchyText from '@/components/ui/GlitchyText';
import { SegmentBar } from '@/components/ui/SegmentBar';
import { allTechOptions, getTechInfo } from '@/lib/techConfig';

const TOTAL_STEPS = 4;

const occupations: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'student',      label: 'Student',      desc: 'Learning the craft' },
  { value: 'junior',       label: 'Junior Dev',   desc: '0–2 years experience' },
  { value: 'professional', label: 'Professional', desc: '2–8 years experience' },
  { value: 'senior',       label: 'Senior',       desc: '8+ years experience' },
  { value: 'freelancer',   label: 'Freelancer',   desc: 'Independent contractor' },
];

const techOptions = allTechOptions;

const stepSlide = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 32, filter: 'blur(4px)' }),
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit:    (dir: number) => ({ opacity: 0, x: dir * -32, filter: 'blur(4px)' }),
};

const STEP_LABELS = ['Profile', 'Tech Stack', 'Skills', 'GitHub'];

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPat, setShowPat] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    name: '',
    age: undefined,
    occupation: 'professional',
    techStack: [],
    resumeText: '',
    linkedinUrl: '',
    githubUsername: '',
    githubPat: '',
  });

  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const toggleTech = (name: string) => {
    setData(d => ({
      ...d,
      techStack: d.techStack.includes(name)
        ? d.techStack.filter(t => t !== name)
        : [...d.techStack, name],
    }));
  };

  const handleFinish = async () => {
    if (!data.githubUsername.trim()) {
      showNotice('GITHUB REQUIRED', 'We need your username to fetch repositories.', 'error');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    updateUser({ name: data.name, occupation: data.occupation, techStack: data.techStack, githubUsername: data.githubUsername });
    showNotice('PROFILE CONFIGURED', 'Fetching your repositories...', 'success');
    router.push('/dashboard');
  };

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  const inputClass = "w-full input-glass px-4 py-3.5 text-sm text-white";

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 relative overflow-hidden" style={{ fontFamily: 'var(--font-display)' }}>
      <div className="relative z-10 w-full max-w-2xl mx-auto">

        {/* Logo */}
        <div className="mb-12">
          <a href="/" className="text-sm uppercase tracking-[0.24em] text-white/40 hover:text-white/70 transition-colors smooth-glow">
            REPOSIGHT
          </a>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-[11px] uppercase tracking-[0.28em] text-white/25" style={{ fontFamily: 'var(--font-mono)' }}>
              {STEP_LABELS[step - 1]}
            </span>
          </div>
          <SegmentBar value={progressPct} segments={TOTAL_STEPS * 6} segmentHeight={4} showValue={false} />
          <div className="flex justify-between mt-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 transition-all duration-300"
                style={{
                  backgroundColor: i + 1 <= step ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass border border-white/[0.07] p-8 overflow-hidden" style={{ borderRadius: '1px' }}>
          <AnimatePresence mode="wait" custom={direction}>

            {/* STEP 1 — Profile */}
            {step === 1 && (
              <motion.div key="step1" custom={direction} variants={stepSlide}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <GlitchyText text="ABOUT YOU" as="h2" triggerOnMount
                  className="text-xl text-white tracking-[0.12em] uppercase mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  This shapes the tone and depth of your audit results.
                </p>

                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                        Full Name
                      </label>
                      <input type="text" placeholder="Your name" value={data.name}
                        onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                        Age <span className="text-white/15">(opt)</span>
                      </label>
                      <input type="number" placeholder="25" min="15" max="80"
                        value={data.age || ''}
                        onChange={e => setData(d => ({ ...d, age: parseInt(e.target.value) || undefined }))}
                        className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-3 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Role
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {occupations.map(occ => (
                        <button key={occ.value}
                          onClick={() => setData(d => ({ ...d, occupation: occ.value }))}
                          className="relative p-4 text-left transition-all duration-200 border"
                          style={{
                            borderRadius: '1px',
                            borderColor: data.occupation === occ.value ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)',
                            backgroundColor: data.occupation === occ.value ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.02)',
                          }}>
                          {data.occupation === occ.value && (
                            <div className="absolute top-2.5 right-2.5 w-4 h-4 flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                              <Check size={9} style={{ color: 'var(--accent)' }} />
                            </div>
                          )}
                          <div className="text-sm text-white mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{occ.label}</div>
                          <div className="text-[11px] text-white/30" style={{ fontFamily: 'var(--font-body)' }}>{occ.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Tech Stack */}
            {step === 2 && (
              <motion.div key="step2" custom={direction} variants={stepSlide}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <GlitchyText text="TECH STACK" as="h2" triggerOnMount
                  className="text-xl text-white tracking-[0.12em] uppercase mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                  Select everything relevant. The AI uses this to calibrate its assessment.
                </p>
                <p className="text-[11px] uppercase tracking-[0.28em] mb-8" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  {data.techStack.length} selected
                </p>

                <div className="flex flex-wrap gap-2">
                  {techOptions.map(tech => {
                    const selected = data.techStack.includes(tech);
                    const info = getTechInfo(tech);
                    return (
                      <motion.button key={tech}
                        onClick={() => toggleTech(tech)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs transition-all duration-200 border"
                        style={{
                          borderRadius: '1px',
                          fontFamily: 'var(--font-mono)',
                          borderColor: selected ? info.color : 'rgba(255,255,255,0.07)',
                          backgroundColor: selected ? info.bg : 'rgba(255,255,255,0.02)',
                          color: selected ? info.color : 'rgba(255,255,255,0.35)',
                          boxShadow: selected ? `0 0 12px ${info.bg}` : 'none',
                        }}>
                        <motion.div
                          animate={{ scale: selected ? 1 : 0.8, opacity: selected ? 1 : 0.5 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          style={{ color: selected ? info.color : 'rgba(255,255,255,0.3)' }}
                        >
                          {info.icon}
                        </motion.div>
                        {tech}
                        <AnimatePresence>
                          {selected && (
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
              </motion.div>
            )}

            {/* STEP 3 — Skills */}
            {step === 3 && (
              <motion.div key="step3" custom={direction} variants={stepSlide}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <GlitchyText text="WHAT YOU CLAIM" as="h2" triggerOnMount
                  className="text-xl text-white tracking-[0.12em] uppercase mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  Paste your resume or describe your experience. The AI will cross-reference this against your actual code.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Skills &amp; Experience
                    </label>
                    <textarea
                      placeholder={"Paste your resume text, or describe your skills and experience level...\n\ne.g. 5 years of Python, built production FastAPI services, familiar with microservices and Docker..."}
                      value={data.resumeText}
                      onChange={e => setData(d => ({ ...d, resumeText: e.target.value }))}
                      rows={7}
                      className={`${inputClass} resize-none leading-relaxed`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      LinkedIn <span className="text-white/15">(optional)</span>
                    </label>
                    <input type="url" placeholder="https://linkedin.com/in/yourprofile"
                      value={data.linkedinUrl}
                      onChange={e => setData(d => ({ ...d, linkedinUrl: e.target.value }))}
                      className={inputClass} />
                  </div>

                  <button className="flex items-center gap-3 w-full p-4 border border-dashed border-white/[0.08] text-white/25 hover:border-white/18 hover:text-white/45 transition-all duration-200 text-xs"
                    style={{ borderRadius: '1px', fontFamily: 'var(--font-mono)' }}>
                    <Upload size={14} />
                    Upload resume PDF / DOCX — coming soon
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — GitHub */}
            {step === 4 && (
              <motion.div key="step4" custom={direction} variants={stepSlide}
                initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <GlitchyText text="CONNECT GITHUB" as="h2" triggerOnMount
                  className="text-xl text-white tracking-[0.12em] uppercase mb-1"
                  style={{ fontFamily: 'var(--font-display)' } as React.CSSProperties} />
                <p className="text-xs text-white/30 mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  Your username gives us access to public repos. Add a PAT to include private ones.
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      GitHub Username <span style={{ color: 'var(--accent)' }}>*</span>
                    </label>
                    <input type="text" placeholder="your-github-username"
                      value={data.githubUsername}
                      onChange={e => setData(d => ({ ...d, githubUsername: e.target.value }))}
                      className={`${inputClass} font-mono`} />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-white/30 mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
                      Personal Access Token <span className="text-white/18">(optional — private repos)</span>
                    </label>
                    <div className="relative">
                      <input type={showPat ? 'text' : 'password'}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={data.githubPat}
                        onChange={e => setData(d => ({ ...d, githubPat: e.target.value }))}
                        className={`${inputClass} font-mono pr-12`} />
                      <button type="button" onClick={() => setShowPat(!showPat)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                        {showPat ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border border-yellow-500/[0.15] bg-yellow-500/[0.05]" style={{ borderRadius: '1px' }}>
                    <AlertTriangle size={13} className="text-yellow-400/60 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white/35 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      Your PAT is encrypted and never stored in plaintext. We only request{' '}
                      <span className="text-white/55" style={{ fontFamily: 'var(--font-mono)' }}>repo:read</span> scope. Revoke anytime from settings.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={goPrev} disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-0"
            style={{ fontFamily: 'var(--font-mono)' }}>
            <ChevronLeft size={14} />
            Back
          </button>

          {step < TOTAL_STEPS ? (
            <motion.button onClick={goNext}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-7 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition-all duration-200"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
              Continue
              <ChevronRight size={14} />
            </motion.button>
          ) : (
            <motion.button onClick={handleFinish} disabled={isSubmitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-7 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition-all duration-200 disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent)', borderRadius: '1px', fontFamily: 'var(--font-display)' }}>
              {isSubmitting ? (
                <span className="animate-pulse">Configuring...</span>
              ) : (
                <><Check size={14} /> Launch Dashboard</>
              )}
            </motion.button>
          )}
        </div>

      </div>
    </div>
  );
}
