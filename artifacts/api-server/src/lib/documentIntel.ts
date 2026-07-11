// Lightweight, fully-offline document intelligence utilities:
// sentence splitting, frequency-based extractive summarization, and key
// point extraction. No external ML model downloads required.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "are", "was", "were", "be", "been",
  "being", "it", "its", "this", "that", "these", "those", "we", "you", "he",
  "she", "they", "i", "his", "her", "their", "our", "your", "not", "no",
  "so", "than", "then", "there", "here", "which", "who", "whom", "what",
  "when", "where", "why", "how", "can", "could", "will", "would", "should",
  "shall", "may", "might", "must", "do", "does", "did", "have", "has", "had",
  "also", "into", "about", "up", "down", "out", "over", "under", "again",
  "further", "once", "just", "only", "very", "such", "each", "some", "any",
  "all", "most", "other", "one", "two", "more",
]);

export function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const rawSentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return rawSentences.length > 0 ? rawSentences : [normalized];
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter(
    (w) => w.length > 2 && !STOPWORDS.has(w),
  );
}

function wordFrequencies(sentences: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const sentence of sentences) {
    for (const word of tokenize(sentence)) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return freq;
}

function scoreSentences(
  sentences: string[],
  freq: Map<string, number>,
): number[] {
  return sentences.map((sentence, index) => {
    const words = tokenize(sentence);
    if (words.length === 0) return 0;
    const raw = words.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0);
    const lengthNormalized = raw / Math.sqrt(words.length);
    // Slight boost for early sentences (leads carry more weight in most docs).
    const positionBoost = index < 3 ? 1.15 : 1;
    return lengthNormalized * positionBoost;
  });
}

export type SummaryLength = "short" | "medium" | "long";

const TARGET_SENTENCE_COUNT: Record<SummaryLength, (total: number) => number> = {
  short: (total) => Math.max(2, Math.round(total * 0.12)),
  medium: (total) => Math.max(3, Math.round(total * 0.22)),
  long: (total) => Math.max(5, Math.round(total * 0.35)),
};

export function summarizeText(
  text: string,
  length: SummaryLength = "medium",
): { summary: string; keyPoints: string[] } {
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) {
    return { summary: "", keyPoints: [] };
  }

  const freq = wordFrequencies(sentences);
  const scores = scoreSentences(sentences, freq);

  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, score: scores[index] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const summaryCount = Math.min(
    sentences.length,
    TARGET_SENTENCE_COUNT[length](sentences.length),
  );

  const summarySentences = ranked
    .slice(0, summaryCount)
    .sort((a, b) => a.index - b.index)
    .map((r) => r.sentence);

  const keyPointCount = Math.min(5, ranked.length);
  const keyPoints = ranked
    .slice(0, keyPointCount)
    .sort((a, b) => a.index - b.index)
    .map((r) => r.sentence);

  return {
    summary: summarySentences.join(" "),
    keyPoints,
  };
}

export function countWords(text: string): number {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}
