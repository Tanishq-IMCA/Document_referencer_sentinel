'use client';

import { motion } from 'framer-motion';

interface CodeLine {
  tokens: { text: string; type: 'keyword' | 'string' | 'comment' | 'function' | 'number' | 'type' | 'plain' | 'operator' }[];
}

interface CodeBlock {
  title: string;
  lines: CodeLine[];
  x: string;
  y: string;
  delay: number;
  rotate: number;
  width: string;
}

const codeBlocks: CodeBlock[] = [
  {
    title: 'security_scan.py',
    x: '-5%',
    y: '15%',
    delay: 0.2,
    rotate: -2,
    width: '320px',
    lines: [
      { tokens: [{ text: 'def ', type: 'keyword' }, { text: 'analyze_risk', type: 'function' }, { text: '(repo):', type: 'plain' }] },
      { tokens: [{ text: '  findings ', type: 'plain' }, { text: '= ', type: 'operator' }, { text: '[]', type: 'plain' }] },
      { tokens: [{ text: '  for ', type: 'keyword' }, { text: 'file ', type: 'plain' }, { text: 'in ', type: 'keyword' }, { text: 'repo.files:', type: 'plain' }] },
      { tokens: [{ text: '    score ', type: 'plain' }, { text: '= ', type: 'operator' }, { text: 'semgrep', type: 'function' }, { text: '(file)', type: 'plain' }] },
      { tokens: [{ text: '    if ', type: 'keyword' }, { text: 'score.critical ', type: 'plain' }, { text: '> ', type: 'operator' }, { text: '0', type: 'number' }, { text: ':', type: 'plain' }] },
      { tokens: [{ text: '      findings', type: 'plain' }, { text: '.append(', type: 'plain' }, { text: 'score', type: 'function' }, { text: ')', type: 'plain' }] },
      { tokens: [{ text: '  return ', type: 'keyword' }, { text: 'RiskReport', type: 'type' }, { text: '(findings)', type: 'plain' }] },
    ],
  },
  {
    title: 'audit_result.json',
    x: '62%',
    y: '10%',
    delay: 0.5,
    rotate: 2,
    width: '280px',
    lines: [
      { tokens: [{ text: '{', type: 'plain' }] },
      { tokens: [{ text: '  ', type: 'plain' }, { text: '"score"', type: 'string' }, { text: ': ', type: 'plain' }, { text: '74', type: 'number' }, { text: ',', type: 'plain' }] },
      { tokens: [{ text: '  ', type: 'plain' }, { text: '"critical"', type: 'string' }, { text: ': ', type: 'plain' }, { text: '2', type: 'number' }, { text: ',', type: 'plain' }] },
      { tokens: [{ text: '  ', type: 'plain' }, { text: '"verdict"', type: 'string' }, { text: ': ', type: 'plain' }, { text: '"overestimated"', type: 'string' }] },
      { tokens: [{ text: '}', type: 'plain' }] },
    ],
  },
  {
    title: 'skill_check.ts',
    x: '68%',
    y: '55%',
    delay: 0.8,
    rotate: -1.5,
    width: '300px',
    lines: [
      { tokens: [{ text: 'type ', type: 'keyword' }, { text: 'Assessment', type: 'type' }, { text: ' = {', type: 'plain' }] },
      { tokens: [{ text: '  skill', type: 'plain' }, { text: ': ', type: 'plain' }, { text: 'string', type: 'type' }, { text: ';', type: 'plain' }] },
      { tokens: [{ text: '  claimed', type: 'plain' }, { text: ': ', type: 'plain' }, { text: 'number', type: 'type' }, { text: ';', type: 'plain' }] },
      { tokens: [{ text: '  actual', type: 'plain' }, { text: ': ', type: 'plain' }, { text: 'number', type: 'type' }, { text: ';', type: 'plain' }] },
      { tokens: [{ text: '  verdict', type: 'plain' }, { text: ': ', type: 'plain' }, { text: 'Verdict', type: 'type' }, { text: ';', type: 'plain' }] },
      { tokens: [{ text: '}', type: 'plain' }] },
    ],
  },
];

const typeColors: Record<string, string> = {
  keyword: '#a78bfa',
  string: '#86efac',
  comment: 'rgba(255,255,255,0.3)',
  function: '#00d9ff',
  number: '#fbbf24',
  type: '#fb923c',
  plain: 'rgba(255,255,255,0.75)',
  operator: 'rgba(255,255,255,0.4)',
};

export function FloatingCode() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {codeBlocks.map((block, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: block.delay, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            left: block.x,
            top: block.y,
            width: block.width,
            rotate: block.rotate,
          }}
          className="animate-float"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [block.rotate, block.rotate + 0.4, block.rotate] }}
            transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
            className="glass rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-white/30 text-xs font-mono ml-1">{block.title}</span>
            </div>
            {/* Code */}
            <div className="p-4 space-y-1">
              {block.lines.map((line, li) => (
                <div key={li} className="text-xs font-mono flex flex-wrap leading-relaxed">
                  {line.tokens.map((token, ti) => (
                    <span key={ti} style={{ color: typeColors[token.type] }}>
                      {token.text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
