// Manuel de Codage (MdC) inspired pipeline, v2.
//
// Pipeline overview:
//
//   English input
//     |
//     v
//   Tokenizer (detects '|' quadrat splits, words)
//     |
//     v
//   Transliteration (digraphs -> Egyptian phonemes, l -> r)
//     |
//     v
//   Greedy sign matcher (tri -> bi -> uni)
//     |
//     v
//   Determinative appender (per word)
//     |
//     v
//   Quadrat layout
//
// Alternative input path: real MdC notation.
//   If the input contains any MdC operator ('-', ':', '*', '!'),
//   the entire input is parsed as raw MdC and the English pipeline
//   is skipped. Gardiner codes can be plain (N35) or bracketed (<N35>).
//
// Literal Gardiner codes can also be embedded in English mode using
// <CODE> syntax; they are tokenised as single signs.

import {
  UNILITERAL,
  BILITERAL_TRANSLIT,
  BILITERAL_UNICODE,
  TRILITERAL_TRANSLIT,
  TRILITERAL_UNICODE,
  DETERMINATIVE_BY_WORD,
  DETERMINATIVE_UNICODE,
  gardinerToUnicode,
} from './mdcSigns';

// Cells inside a quadrat. They can stack (':'), sit side by side ('*'),
// or simply sequence. Each cell holds one Unicode hieroglyph.
export interface QuadratCell {
  sign: string;
  // Trace metadata populated by the pipeline for the PipelinePanel.
  translit?: string;   // transliteration value (nfr, S29, etc.)
  role?: string;       // 'uniliteral', 'biliteral', 'triliteral', 'determinative', 'literal-code', 'digit'
  gardiner?: string;   // Gardiner code (F35, S29, etc.)
}

// A quadrat is a small group of signs rendered together. The arrangement
// hint tells the renderer how to lay them out. 'auto' lets the renderer
// pick a grid based on the cell count.
export type Arrangement = 'auto' | 'row' | 'column' | 'grid';

export interface Quadrat {
  cells: QuadratCell[];
  arrangement: Arrangement;
}

export type Group =
  | { type: 'quadrat'; quadrat: Quadrat }
  | { type: 'space' }
  | { type: 'linebreak' };

// English transliteration tables.

// Digraphs map English pairs to Egyptological transliteration tokens.
// Order matters when prefixes overlap: longest match first.
const DIGRAPH_TO_TRANSLIT: Array<[string, string]> = [
  ['sh', 'S'],
  ['ch', 'S'],
  ['kh', 'x'],
  ['th', 't'],
  ['ph', 'f'],
  ['gh', 'g'],
  ['qu', 'qw'],
  ['ng', 'ng'],
  ['ck', 'k'],
  ['wh', 'w'],
];

// Single English letter -> transliteration. 'l' becomes 'r' since Egyptian
// had no /l/. Vowels e/i and o/u collapse to the semivowel signs.
const LETTER_TO_TRANSLIT: Record<string, string> = {
  'a': '3', 'b': 'b', 'c': 'k', 'd': 'd', 'e': 'i',
  'f': 'f', 'g': 'g', 'h': 'h', 'i': 'i', 'j': 'D',
  'k': 'k', 'l': 'r', 'm': 'm', 'n': 'n', 'o': 'w',
  'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't',
  'u': 'w', 'v': 'f', 'w': 'w', 'x': 'x', 'y': 'y',
  'z': 'z',
};

const DIGIT_UNICODE: Record<string, string> = {
  '0': '\u{13361}', '1': '\u{13362}', '2': '\u{13363}', '3': '\u{13364}',
  '4': '\u{13365}', '5': '\u{13366}', '6': '\u{13367}', '7': '\u{13368}',
  '8': '\u{13369}', '9': '\u{1336A}',
};

// Step 1: English chunk -> transliteration string.
function englishToTranslit(s: string): string {
  const lower = s.toLowerCase();
  let out = '';
  let i = 0;
  while (i < lower.length) {
    const pair = lower.slice(i, i + 2);
    const dg = DIGRAPH_TO_TRANSLIT.find(([k]) => k === pair);
    if (dg) {
      out += dg[1];
      i += 2;
      continue;
    }
    const ch = lower[i];
    if (DIGIT_UNICODE[ch]) {
      out += ch;
    } else if (LETTER_TO_TRANSLIT[ch]) {
      out += LETTER_TO_TRANSLIT[ch];
    }
    i += 1;
  }
  return out;
}

// Step 2: Greedy multi-letter sign matcher on the transliteration string.
// Returns richer cells with translit/role/gardiner for the pipeline panel.
function translitToCells(t: string): QuadratCell[] {
  const cells: QuadratCell[] = [];
  let i = 0;
  while (i < t.length) {
    if (DIGIT_UNICODE[t[i]]) {
      cells.push({ sign: DIGIT_UNICODE[t[i]], translit: t[i], role: 'digit' });
      i += 1;
      continue;
    }
    const tri = t.slice(i, i + 3);
    if (tri.length === 3 && TRILITERAL_TRANSLIT[tri]) {
      const code = TRILITERAL_TRANSLIT[tri];
      const u = gardinerToUnicode(code);
      if (u) {
        cells.push({ sign: u, translit: tri, role: 'triliteral', gardiner: code });
        i += 3;
        continue;
      }
    }
    const bi = t.slice(i, i + 2);
    if (bi.length === 2 && BILITERAL_TRANSLIT[bi]) {
      const code = BILITERAL_TRANSLIT[bi];
      const u = gardinerToUnicode(code);
      if (u) {
        cells.push({ sign: u, translit: bi, role: 'biliteral', gardiner: code });
        i += 2;
        continue;
      }
    }
    const ch = t[i];
    const uniCode = findUniByValue(ch);
    if (uniCode) {
      const u = gardinerToUnicode(uniCode);
      if (u) cells.push({ sign: u, translit: ch, role: 'uniliteral', gardiner: uniCode });
    }
    i += 1;
  }
  return cells;
}

function findUniByValue(ch: string): string | null {
  for (const code in UNILITERAL) {
    if (transliterationValueOf(code) === ch) return code;
  }
  return null;
}

// Helper: map a uniliteral Gardiner code back to its translit symbol.
// This stays in sync with the table in mdcSigns.ts.
const UNI_VALUE: Record<string, string> = {
  'G1': '3', 'M17': 'i', 'M17a': 'y', 'D36': 'a', 'G43': 'w', 'D58': 'b',
  'Q3': 'p', 'I9': 'f', 'G17': 'm', 'N35': 'n', 'D21': 'r', 'O4': 'h',
  'V28': 'H', 'Aa1': 'x', 'F32': 'X', 'S29': 's', 'O34': 'z', 'N37': 'S',
  'N29': 'q', 'V31': 'k', 'W11': 'g', 'X1': 't', 'V13': 'T', 'D46': 'd',
  'I10': 'D',
};
function transliterationValueOf(code: string): string {
  return UNI_VALUE[code] || '';
}

// Inline Gardiner literal: <CODE> in input.
const INLINE_CODE_RE = /<([A-Za-z]{1,3}\d+[a-z]?)>/;

// Tokenise a single English chunk (post-pipe-split). Splits on inline
// <CODE> tags so they pass through untouched while the surrounding letters
// run through the transliteration pipeline. Returns cells with trace info.
function chunkToCells(chunk: string): QuadratCell[] {
  const cells: QuadratCell[] = [];
  let rest = chunk;
  while (rest.length > 0) {
    const m = rest.match(INLINE_CODE_RE);
    if (!m || m.index === undefined) {
      cells.push(...translitToCells(englishToTranslit(rest)));
      break;
    }
    const before = rest.slice(0, m.index);
    if (before) cells.push(...translitToCells(englishToTranslit(before)));
    const u = gardinerToUnicode(m[1]);
    if (u) cells.push({ sign: u, translit: m[1], role: 'literal-code', gardiner: m[1] });
    rest = rest.slice(m.index + m[0].length);
  }
  return cells;
}

// MdC operator detection. Any of these in the input flips parsing to raw.
const MDC_OPS = /[-:*!]/;
function looksLikeMdC(input: string): boolean {
  return MDC_OPS.test(input);
}

// Raw MdC parser.
//
// Accepts a string of Gardiner codes separated by:
//   '-'   sequence (next quadrat)
//   ':'   stack vertically inside current quadrat
//   '*'   place side by side inside current quadrat
//   '!'   line break
//   ' '   word separator
//
// Codes can be written plain (N35) or in angle brackets (<N35>).
// Unknown codes are silently dropped.
function parseMdC(input: string): Group[] {
  const out: Group[] = [];
  // word splitting first, MdC handles operators within a word
  const words = input.split(/\s+/).filter(w => w.length > 0);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ type: 'space' });
    // line break operator '!' splits at the top level
    const lines = word.split('!');
    lines.forEach((line, li) => {
      if (li > 0) out.push({ type: 'linebreak' });
      // sequence operator '-' separates quadrats
      const quadratStrs = line.split('-').filter(s => s.length > 0);
      for (const qs of quadratStrs) {
        const q = parseQuadrat(qs);
        if (q.cells.length > 0) {
          out.push({ type: 'quadrat', quadrat: q });
        }
      }
    });
  });
  return out;
}

// Parse one quadrat string. Operators ':' and '*' are mixed via a simple
// rule: if both appear, layout is 'grid'; if only ':', 'column'; if only
// '*', 'row'; if neither, single-cell.
function parseQuadrat(qs: string): Quadrat {
  const hasStack = qs.includes(':');
  const hasSide = qs.includes('*');
  const arrangement: Arrangement = hasStack && hasSide
    ? 'grid'
    : hasStack
      ? 'column'
      : hasSide
        ? 'row'
        : 'auto';
  const parts = qs.split(/[:*]/).filter(s => s.length > 0);
  const cells: QuadratCell[] = [];
  for (const p of parts) {
    const clean = p.replace(/[<>]/g, '');
    const u = gardinerToUnicode(clean);
    if (u) cells.push({ sign: u, translit: clean, role: 'literal-code', gardiner: clean });
  }
  return { cells, arrangement };
}

// English pipeline entry. Splits on whitespace into words, then on '|' into
// quadrats. Each quadrat goes through transliteration and greedy matching.
// Determinative is appended once per word, after the last quadrat of the word.
function parseEnglish(input: string): Group[] {
  const out: Group[] = [];
  const words = input.split(/\s+/).filter(w => w.length > 0);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ type: 'space' });
    const chunks = word.split('|').filter(c => c.length > 0);
    chunks.forEach(chunk => {
      const cells = chunkToCells(chunk);
      if (cells.length > 0) {
        out.push({ type: 'quadrat', quadrat: { cells, arrangement: 'auto' } });
      }
    });
    // Append determinative after the final phonetic content of the word.
    const wordForDet = word.replace(/<[^>]+>/g, '').replace(/\|/g, '').toLowerCase();
    const detCode = DETERMINATIVE_BY_WORD[wordForDet];
    if (detCode) {
      const det = gardinerToUnicode(detCode);
      if (det) {
        out.push({
          type: 'quadrat',
          quadrat: {
            cells: [{ sign: det, translit: wordForDet, role: 'determinative', gardiner: detCode }],
            arrangement: 'auto',
          },
        });
      }
    }
  });
  return out;
}

// Main entry: pick the path based on the input.
export function renderMdC(text: string): Group[] {
  if (!text) return [];
  if (looksLikeMdC(text)) return parseMdC(text);
  return parseEnglish(text);
}

// Re-export commonly used items so the renderer/UI can avoid a second import.
export { UNILITERAL, BILITERAL_UNICODE, TRILITERAL_UNICODE, DETERMINATIVE_UNICODE };

// Flatten Group[] into a linear PipelineStep list for the pipeline panel.
import type { PipelineStep } from '../types';

export function tracePipelineFromGroups(groups: Group[]): PipelineStep[] {
  const steps: PipelineStep[] = [];
  for (const g of groups) {
    if (g.type === 'space') { steps.push({ input: ' ', glyph: ' ', role: 'space' }); continue; }
    if (g.type === 'linebreak') { steps.push({ input: '!', glyph: '', role: 'linebreak' }); continue; }
    for (const c of g.quadrat.cells) {
      steps.push({
        input: c.translit ?? '',
        glyph: c.sign,
        role: c.role ?? 'sign',
        detail: c.gardiner ? `Gardiner ${c.gardiner}` : undefined,
      });
    }
  }
  return steps;
}
