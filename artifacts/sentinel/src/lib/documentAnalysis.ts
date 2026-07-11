import type { ScanResult } from "@workspace/api-client-react";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  file: string;
  line: number;
  tool: string;
  recommendation: string;
}

export interface CodeSmell {
  id: string;
  type: string;
  file: string;
  count: number;
  severity?: SeverityLevel;
  description?: string;
  recommendation?: string;
  codeSnippet?: string;
}

export interface SkillItem {
  name: string;
  claimed: number;
  actual: number;
  trend: number;
  verdict: "overestimated" | "underestimated" | "accurate";
  evidence: string;
}

export interface DocumentAnalysis {
  overallScore: number;
  securityScore: number;
  codeQualityScore: number;
  architectureScore: number;
  skillScore: number;
  scanDate: string;
  metrics: {
    totalFiles: number;
    linesOfCode: number;
    testCoverage: number;
    avgComplexity: number;
    duplication: number;
    paragraphs: number;
  };
  findings: Finding[];
  codeSmells: CodeSmell[];
  dependencies: undefined;
  skillAssessment: SkillItem[];
  architectureDetails: {
    couplingScore: number;
    cohesionScore: number;
    layerSeparation: number;
    modularityScore: number;
    detectedPatterns: string[];
    antiPatterns: string[];
    layerBreakdown: Array<{ layer: string; files: number; score: number }>;
    couplingGraph: Array<{ from: string; to: string; strength: number }>;
  };
  codeQualityDetails: {
    lintScore: number;
    docCoverage: number;
    testQuality: number;
    consistencyScore: number;
    reviewScore: number;
    complexityDist: Array<{ range: string; count: number }>;
    testMetrics: {
      totalTests: number;
      passing: number;
      failing: number;
      flaky: number;
      avgDuration: number;
    };
  };
}

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;
const SECRET_REGEX = /\b(?:api[_-]?key|token|secret|password|sk-)\s*[:=]\s*["']?[a-zA-Z0-9_\-]{8,}\b/gi;
const URL_REGEX = /\bhttps?:\/\/[^\s]+/gi;
const DATE_REGEX = /\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
const MONEY_REGEX = /\b(?:\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+\s*(?:USD|EUR|GBP))\b/gi;
const ORG_REGEX = /\b(?:Inc\.|LLC|Ltd\.|Corp\.|Corporation|Company|Co\.|Organization|Institute|University|Agency|Department)\b/gi;

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function countMatches(text: string, regex: RegExp): number {
  return (text.match(regex) ?? []).length;
}

function lineNumber(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function splitLines(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
}

function countWords(text: string): number {
  return (text.trim().match(/\S+/g) ?? []).length;
}

function averageSentenceLength(sentences: string[]): number {
  if (sentences.length === 0) return 0;
  const words = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
  return words / sentences.length;
}

function extractFindings(text: string, filename: string): Finding[] {
  const findings: Finding[] = [];
  const seen = new Set<string>();

  const add = (
    regex: RegExp,
    severity: SeverityLevel,
    title: string,
    description: (match: string) => string,
    recommendation: string,
    tool: string,
  ) => {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const key = `${title}:${m.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({
        id: `f-${findings.length + 1}`,
        severity,
        title,
        description: description(m[0]),
        file: filename,
        line: lineNumber(text, m.index),
        tool,
        recommendation,
      });
    }
  };

  add(
    EMAIL_REGEX,
    "medium",
    "Email address exposed",
    (match) =>
      `An email address (${match}) was found in the document. This may be intended contact information, but in sensitive documents it can be used for phishing or social engineering.`,
    "Review whether the email should be public. Redact if it is personal or internal contact information.",
    "PII Detector",
  );

  add(
    PHONE_REGEX,
    "medium",
    "Phone number exposed",
    (match) =>
      `A phone number (${match}) was detected. This may be personal or organizational contact information.`,
    "Redact if personal. Consider using a contact form instead of direct numbers in public documents.",
    "PII Detector",
  );

  add(
    SSN_REGEX,
    "critical",
    "Social Security Number exposed",
    (match) =>
      `A U.S. Social Security number (${match}) was found in the document. This is highly sensitive PII.`,
    "Immediately remove this from the document and any version history. Notify the affected individual if this was accidental disclosure.",
    "PII Detector",
  );

  add(
    CREDIT_CARD_REGEX,
    "critical",
    "Potential credit card number exposed",
    (match) =>
      `A 13-16 digit number (${match}) was detected that resembles a credit card or account number.`,
    "Verify and redact if it is a payment instrument. PCI DSS requires protection of cardholder data.",
    "PII Detector",
  );

  add(
    SECRET_REGEX,
    "high",
    "Potential secret/credential exposed",
    (match) =>
      `A string matching common secret patterns (${match.slice(0, 30)}${match.length > 30 ? "..." : ""}) was found.`,
    "Rotate the credential and remove it from the document. Store secrets in a secure vault or environment variable.",
    "Secret Scanner",
  );

  return findings;
}

function extractCodeSmells(text: string, sentences: string[], paragraphs: string[]): CodeSmell[] {
  const smells: CodeSmell[] = [];
  const longSentences = sentences.filter((s) => s.split(/\s+/).length > 30);
  if (longSentences.length > 0) {
    smells.push({
      id: "cs1",
      type: "Long Sentences",
      file: "body",
      count: longSentences.length,
      severity: longSentences.length > 5 ? "high" : "medium",
      description: `${longSentences.length} sentences exceed 30 words, which reduces readability and comprehension.`,
      recommendation: "Break long sentences into shorter, focused statements. Aim for 15-25 words per sentence.",
      codeSnippet: longSentences.slice(0, 3).join("\n"),
    });
  }
  const longParagraphs = paragraphs.filter((p) => p.split(/\s+/).length > 200);
  if (longParagraphs.length > 0) {
    smells.push({
      id: "cs2",
      type: "Dense Paragraphs",
      file: "body",
      count: longParagraphs.length,
      severity: longParagraphs.length > 3 ? "high" : "medium",
      description: `${longParagraphs.length} paragraphs exceed 200 words and may overwhelm readers.`,
      recommendation: "Split dense paragraphs into smaller chunks, each with a single main idea.",
    });
  }
  const passiveCount = countMatches(
    text,
    /\b(?:was|were|been|is being|are being)\s+\w+ed\b/gi,
  );
  if (passiveCount > 0) {
    smells.push({
      id: "cs3",
      type: "Passive Voice",
      file: "body",
      count: passiveCount,
      severity: passiveCount > 10 ? "medium" : "low",
      description: `${passiveCount} passive-voice constructions detected. Active voice is usually clearer and more direct.`,
      recommendation: "Convert passive sentences to active voice where the actor is clear.",
    });
  }
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 2);
  const trigrams = new Map<string, number>();
  for (let i = 0; i < tokens.length - 2; i++) {
    const g = tokens.slice(i, i + 3).join(" ");
    trigrams.set(g, (trigrams.get(g) ?? 0) + 1);
  }
  const repeats = Array.from(trigrams.entries()).filter(([, c]) => c > 3).length;
  if (repeats > 0) {
    smells.push({
      id: "cs4",
      type: "Repeated Phrases",
      file: "body",
      count: repeats,
      severity: repeats > 10 ? "medium" : "low",
      description: `${repeats} phrases are repeated more than 3 times, which may indicate redundant or templated content.`,
      recommendation: "Remove redundant phrases or consolidate repeated points into a single clear statement.",
    });
  }
  return smells;
}

function complexityDistribution(sentences: string[]): Array<{ range: string; count: number }> {
  const ranges = ["1–5", "6–10", "11–20", "21–50", "50+"];
  const counts = [0, 0, 0, 0, 0];
  for (const s of sentences) {
    const words = s.split(/\s+/).length;
    if (words <= 5) counts[0]++;
    else if (words <= 10) counts[1]++;
    else if (words <= 20) counts[2]++;
    else if (words <= 50) counts[3]++;
    else counts[4]++;
  }
  return ranges.map((range, i) => ({ range, count: counts[i] }));
}

function detectHeadings(text: string): string[] {
  const lines = text.split("\n");
  const headings: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (/^[A-Z][A-Z\s\d\-\:()]+$/.test(t) && t.length < 80) headings.push(t);
    else if (/^\d+[\.\)]\s+[A-Z]/.test(t) && t.length < 100) headings.push(t);
    else if (t.endsWith(":") && t.split(/\s+/).length <= 6 && t.length < 80) headings.push(t);
  }
  return headings;
}

function detectSections(
  text: string,
  headings: string[],
): Array<{ layer: string; files: number; score: number }> {
  if (headings.length > 0) {
    return headings.slice(0, 8).map((h, i) => ({
      layer: h.slice(0, 40),
      files: Math.round(text.length / (headings.length + 1) / 100),
      score: clamp(85 - i * 3),
    }));
  }
  const paragraphs = splitParagraphs(text);
  const total = paragraphs.length || 1;
  return [
    { layer: "Opening", files: Math.max(1, Math.round(total * 0.2)), score: 78 },
    { layer: "Body", files: Math.max(1, Math.round(total * 0.6)), score: 72 },
    { layer: "Conclusion", files: Math.max(1, Math.round(total * 0.2)), score: 80 },
  ];
}

function detectPatterns(text: string): { detected: string[]; anti: string[] } {
  const detected: string[] = [];
  const anti: string[] = [];
  const headings = detectHeadings(text);
  if (headings.length > 0) detected.push("Headings");
  else anti.push("No Headings");
  if (countMatches(text, /\|.*\|/g) > 0) detected.push("Tables");
  if (countMatches(text, /^[-•]\s+/gm) > 0) detected.push("Bullet Lists");
  if (countMatches(text, /^\d+[\.\)]\s+/gm) > 0) detected.push("Numbered Lists");
  if (countMatches(text, /\[\d+\]|\(\w+,\s*\d{4}\)/g) > 0) detected.push("Citations");
  if (countMatches(text, URL_REGEX) > 0) detected.push("External Links");
  if (detected.length === 0) anti.push("Unstructured Text");
  if (splitParagraphs(text).some((p) => p.split(/\s+/).length > 300)) anti.push("Wall of Text");
  if (countMatches(text, /[A-Z]{4,}/g) > 20) anti.push("Heavy Jargon");
  return { detected, anti };
}

function extractSkillAssessment(text: string): SkillItem[] {
  const words = countWords(text);
  const counts = [
    { name: "Email Addresses", count: countMatches(text, EMAIL_REGEX), expected: 0 },
    { name: "URLs / Links", count: countMatches(text, URL_REGEX), expected: 2 },
    { name: "Dates", count: countMatches(text, DATE_REGEX), expected: 5 },
    { name: "Monetary Values", count: countMatches(text, MONEY_REGEX), expected: 0 },
    { name: "Organizations", count: countMatches(text, ORG_REGEX), expected: 3 },
  ];
  return counts.map(({ name, count, expected }) => {
    const density = words > 0 ? (count / words) * 1000 : 0;
    const actual = clamp(Math.round(density * 10));
    const claimed = clamp(Math.round((expected / Math.max(words, 1)) * 1000 * 10));
    const trend = actual > claimed ? 1 : actual < claimed ? -1 : 0;
    const verdict: "underestimated" | "overestimated" | "accurate" =
      actual > claimed ? "underestimated" : actual < claimed ? "overestimated" : "accurate";
    return {
      name,
      claimed,
      actual,
      trend,
      verdict,
      evidence: `${count} occurrences detected in the document (density ${density.toFixed(2)} per 1,000 words).`,
    };
  });
}

export function analyzeDocument(result: ScanResult): DocumentAnalysis {
  const text = result.text || "";
  const sentences = splitSentences(text);
  const paragraphs = splitParagraphs(text);
  const lines = splitLines(text);
  const words = countWords(text);
  const avgLen = averageSentenceLength(sentences);
  const findings = extractFindings(text, result.filename);
  const codeSmells = extractCodeSmells(text, sentences, paragraphs);
  const patterns = detectPatterns(text);
  const headings = detectHeadings(text);
  const sections = detectSections(text, headings);
  const skillAssessment = extractSkillAssessment(text);

  const qualityScore = clamp(100 - Math.abs(avgLen - 18) * 3);
  const securityScore = clamp(100 - findings.length * 8);
  const architectureScore = clamp(50 + headings.length * 8 + sections.length * 3 + patterns.detected.length * 5);
  const skillScore = clamp(
    skillAssessment.reduce((sum, s) => sum + s.actual, 0) / (skillAssessment.length || 1),
  );
  const overallScore = Math.round(
    qualityScore * 0.35 + securityScore * 0.25 + architectureScore * 0.25 + skillScore * 0.15,
  );

  return {
    overallScore,
    securityScore,
    codeQualityScore: qualityScore,
    architectureScore,
    skillScore,
    scanDate: new Date().toISOString().split("T")[0],
    metrics: {
      totalFiles: 1,
      linesOfCode: lines.length,
      testCoverage: 0,
      avgComplexity: Math.round(avgLen * 10) / 10,
      duplication: 0,
      paragraphs: paragraphs.length,
    },
    findings,
    codeSmells,
    dependencies: undefined,
    skillAssessment,
    architectureDetails: {
      couplingScore: clamp(architectureScore - 8),
      cohesionScore: clamp(architectureScore + 4),
      layerSeparation: clamp(architectureScore - 2),
      modularityScore: clamp(architectureScore + 6),
      detectedPatterns: patterns.detected,
      antiPatterns: patterns.anti,
      layerBreakdown: sections,
      couplingGraph: [
        { from: "Opening", to: "Body", strength: 70 },
        { from: "Body", to: "Conclusion", strength: 60 },
        { from: "Body", to: "References", strength: 40 },
      ],
    },
    codeQualityDetails: {
      lintScore: qualityScore,
      docCoverage: result.summary ? 100 : 0,
      testQuality: 0,
      consistencyScore: clamp(100 - (paragraphs.length > 0 ? codeSmells.length * 5 : 0)),
      reviewScore: Math.round((qualityScore + architectureScore) / 2),
      complexityDist: complexityDistribution(sentences),
      testMetrics: {
        totalTests: 0,
        passing: 0,
        failing: 0,
        flaky: 0,
        avgDuration: 0,
      },
    },
  };
}
