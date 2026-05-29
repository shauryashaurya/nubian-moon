// English to Egyptian Hieroglyph mapping.
// Literal: 1 ASCII letter to 1 sign.
// Phonetic: digraph-aware tokenization to phonetic signs.
// This is a deliberately simple approximation; a future build can replace
// the mapping tables with a Manuel de Codage transliteration pipeline.

import type { RenderMode } from '../types';

// Single-letter mapping (uniliteral signs and their commonly used proxies).
const LITERAL: Record<string, string> = {
  a: '\u{1313F}',
  b: '\u{130C0}',
  c: '\u{133A1}',
  d: '\u{130A7}',
  e: '\u{131CB}',
  f: '\u{13191}',
  g: '\u{133BC}',
  h: '\u{13254}',
  i: '\u{131CB}',
  j: '\u{13193}',
  k: '\u{133A1}',
  l: '\u{130EC}',
  m: '\u{13153}',
  n: '\u{13216}',
  o: '\u{13171}',
  p: '\u{132AA}',
  q: '\u{1320E}',
  r: '\u{1308B}',
  s: '\u{132F4}',
  t: '\u{133CF}',
  u: '\u{13171}',
  v: '\u{13191}',
  w: '\u{13171}',
  x: '\u{1340D}',
  y: '\u{131CC}',
  z: '\u{13283}',
};

// Digraph mapping for phonetic mode. Order matters: longest first.
const DIGRAPHS: Array<[string, string]> = [
  ['sh', '\u{13219}'],
  ['ch', '\u{13219}'],
  ['kh', '\u{1340D}'],
  ['th', '\u{133CF}\u{13254}'],
  ['ph', '\u{13191}'],
  ['gh', '\u{133BC}'],
  ['qu', '\u{1320E}\u{13171}'],
  ['ng', '\u{13216}\u{133BC}'],
  ['wh', '\u{13171}'],
  ['ck', '\u{133A1}'],
];

// Digits: small numeric set; fall back to a single stroke per digit.
const DIGITS: Record<string, string> = {
  '0': '\u{13361}',
  '1': '\u{13362}',
  '2': '\u{13363}',
  '3': '\u{13364}',
  '4': '\u{13365}',
  '5': '\u{13366}',
  '6': '\u{13367}',
  '7': '\u{13368}',
  '8': '\u{13369}',
  '9': '\u{1336A}',
};

// Space character used between rendered words. Kept as a regular space so
// CSS letter-spacing and writing-mode handle line breaks naturally.
const SPACE = ' ';

function mapDigit(c: string): string {
  return DIGITS[c] ?? '';
}

function literalMap(text: string): string {
  let out = '';
  for (const ch of text) {
    const low = ch.toLowerCase();
    if (low >= 'a' && low <= 'z') {
      out += LITERAL[low] ?? '';
    } else if (low >= '0' && low <= '9') {
      out += mapDigit(low);
    } else if (low === ' ') {
      out += SPACE;
    }
    // all other punctuation is dropped
  }
  return out;
}

function phoneticMap(text: string): string {
  let out = '';
  const lower = text.toLowerCase();
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i];
    if (ch === ' ') {
      out += SPACE;
      i += 1;
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      out += mapDigit(ch);
      i += 1;
      continue;
    }
    // try digraph first
    const pair = lower.slice(i, i + 2);
    const dg = DIGRAPHS.find(([k]) => k === pair);
    if (dg) {
      out += dg[1];
      i += 2;
      continue;
    }
    if (ch >= 'a' && ch <= 'z') {
      out += LITERAL[ch] ?? '';
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

export function render(text: string, mode: RenderMode): string {
  if (!text) return '';
  return mode === 'literal' ? literalMap(text) : phoneticMap(text);
}
