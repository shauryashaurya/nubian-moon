// Cuneiform pipeline for Sumerian, Akkadian, Hittite, Elamite.
// All four share the same underlying sign block; convention differs.
//
// Two input paths:
//   1) English mode: best-effort English-to-syllable splitter.
//      Applies dictionary lookups for common words to logograms first,
//      then falls back to CV/VC/CVC syllable splitting.
//   2) ATF mode: raw Oracc-style ATF tokens separated by '-' between
//      signs in a word; whitespace between words; {det} for determinatives;
//      UPPERCASE for logograms; lowercase for syllabic.
//
// Detection: if input contains '-', '{', '}', or any uppercase letter,
// parse as ATF. Otherwise treat as English.

import {
  SYLLABIC,
  LOGOGRAM,
  DETERMINATIVE,
  NUMBER,
  DETERMINATIVE_BY_WORD,
  LOGOGRAM_BY_ENGLISH,
  lookupSign,
} from './cuneiformSigns';

export interface CuneiformToken {
  glyph: string;
  kind: 'sign' | 'det' | 'space' | 'divider';
  translit?: string;
}

export type CuneiformDialect = 'sumerian' | 'akkadian' | 'hittite' | 'elamite';

// Detect ATF: contains '-', '{', '}', digits attached to letters (kur3),
// or has any uppercase.
const ATF_RE = /[-{}]|[A-Z]/;

export function renderCuneiform(text: string, dialect: CuneiformDialect): CuneiformToken[] {
  if (!text.trim()) return [];
  if (ATF_RE.test(text)) return parseATF(text);
  return parseEnglish(text, dialect);
}

// ATF parser. Words separated by whitespace, signs within a word by '-'.
// Determinatives are {d}, {m}, {kur}, etc. and attach to the following sign.
function parseATF(text: string): CuneiformToken[] {
  const out: CuneiformToken[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ glyph: '', kind: 'space' });
    // Extract {det} tokens plus the rest, keeping order.
    // Split the word into segments: {det} or plain-sign.
    let i = 0;
    let buffer = '';
    while (i < word.length) {
      const ch = word[i];
      if (ch === '{') {
        // flush buffer as sign(s)
        if (buffer) {
          emitSigns(buffer, out);
          buffer = '';
        }
        const close = word.indexOf('}', i);
        if (close === -1) { i += 1; continue; }
        const detKey = word.slice(i + 1, close);
        const detGlyph = DETERMINATIVE[detKey]?.glyph;
        if (detGlyph) out.push({ glyph: detGlyph, kind: 'det', translit: `{${detKey}}` });
        i = close + 1;
        if (word[i] === '-') i += 1;
        continue;
      }
      buffer += ch;
      i += 1;
    }
    if (buffer) emitSigns(buffer, out);
  });
  return out;
}

// Emit signs for a hyphen-separated span (e.g. "lu-gal", "LUGAL", "an").
function emitSigns(span: string, out: CuneiformToken[]): void {
  const parts = span.split('-').filter(Boolean);
  for (const raw of parts) {
    // Strip trailing digits that mark homophone index (bad3 -> bad).
    // ATF also uses sub-numbers for signs; we don't discriminate readings,
    // but we still try the full form first, then the stripped form.
    const glyph = lookupSign(raw) ?? lookupSign(raw.replace(/[0-9]+$/, ''));
    if (glyph) out.push({ glyph, kind: 'sign', translit: raw });
  }
}

// English pipeline. Split on whitespace, look up each word.
// Order of resolution per word:
//   1) Explicit logogram dictionary (king -> LUGAL)
//   2) Determinative dictionary (attaches before the syllabic spelling)
//   3) Syllable split of the English word into CV/VC/CVC signs
function parseEnglish(text: string, _dialect: CuneiformDialect): CuneiformToken[] {
  const out: CuneiformToken[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ glyph: '', kind: 'space' });
    const lower = word.toLowerCase();
    // Explicit logogram. If the logogram already carries semantic meaning
    // that a determinative would clarify, we skip the redundant det.
    // A det is added only when its sign differs from the logogram's sign.
    const logoKey = LOGOGRAM_BY_ENGLISH[lower];
    if (logoKey && LOGOGRAM[logoKey]) {
      const logoGlyph = LOGOGRAM[logoKey].glyph;
      const detKey = DETERMINATIVE_BY_WORD[lower];
      if (detKey && DETERMINATIVE[detKey] && DETERMINATIVE[detKey].glyph !== logoGlyph) {
        out.push({ glyph: DETERMINATIVE[detKey].glyph, kind: 'det', translit: `{${detKey}}` });
      }
      out.push({ glyph: logoGlyph, kind: 'sign', translit: logoKey });
      return;
    }
    // Syllabic split
    const signs = englishToSyllables(lower);
    for (const s of signs) out.push(s);
    // Optional trailing determinative for common nouns
    const detKey = DETERMINATIVE_BY_WORD[lower];
    if (detKey && DETERMINATIVE[detKey]) {
      out.push({ glyph: DETERMINATIVE[detKey].glyph, kind: 'det', translit: `{${detKey}}` });
    }
  });
  return out;
}

// CV/VC/CVC greedy splitter.
// Preference order:
//   1) 3-char CVC (bad, gal, kur)
//   2) 2-char CV or VC (ka, ab, in)
//   3) 1-char V (a, e, i, u)
// Unknown consonants map through a simplification table (l -> l falls through,
// v -> b, w -> u, y -> i, etc.).
function englishToSyllables(word: string): CuneiformToken[] {
  const out: CuneiformToken[] = [];
  const normalized = normalizeEnglish(word);
  let i = 0;
  while (i < normalized.length) {
    const three = normalized.slice(i, i + 3);
    if (three.length === 3 && SYLLABIC[three]) {
      out.push({ glyph: SYLLABIC[three].glyph, kind: 'sign', translit: three });
      i += 3;
      continue;
    }
    const two = normalized.slice(i, i + 2);
    if (two.length === 2 && SYLLABIC[two]) {
      out.push({ glyph: SYLLABIC[two].glyph, kind: 'sign', translit: two });
      i += 2;
      continue;
    }
    // Try consonant + implicit 'a' fallback
    const ch = normalized[i];
    if (SYLLABIC[ch]) {
      out.push({ glyph: SYLLABIC[ch].glyph, kind: 'sign', translit: ch });
      i += 1;
      continue;
    }
    // number
    if (NUMBER[ch]) {
      out.push({ glyph: NUMBER[ch].glyph, kind: 'sign', translit: ch });
      i += 1;
      continue;
    }
    // Consonant + 'a' construction as last resort
    if (isConsonant(ch)) {
      const key = ch + 'a';
      if (SYLLABIC[key]) {
        out.push({ glyph: SYLLABIC[key].glyph, kind: 'sign', translit: key });
      }
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

// Normalize English into the reduced phoneme space cuneiform can approximate.
// Keeps CVC pairs recognizable; simplifies English orthography's quirks.
function normalizeEnglish(word: string): string {
  let s = word.toLowerCase();
  // Compound digraphs first
  s = s.replace(/sh/g, 'sh');   // keep
  s = s.replace(/ch/g, 'sh');   // no /ch/ affricate in Sumerian
  s = s.replace(/kh/g, 'h');    // Akkadian /h/
  s = s.replace(/th/g, 't');
  s = s.replace(/ph/g, 'p');
  s = s.replace(/gh/g, 'g');
  s = s.replace(/qu/g, 'ku');
  s = s.replace(/ck/g, 'k');
  // Letter simplifications (Akkadian lacks /o/, English /v/ etc.)
  s = s.replace(/o/g, 'u');
  s = s.replace(/v/g, 'b');
  s = s.replace(/w/g, 'u');
  s = s.replace(/y/g, 'i');
  s = s.replace(/c/g, 'k');
  s = s.replace(/f/g, 'p');
  s = s.replace(/j/g, 'z');
  s = s.replace(/x/g, 'ks');
  return s;
}

function isConsonant(c: string): boolean {
  return /[a-z]/.test(c) && !'aeiou'.includes(c);
}

// Flatten CuneiformToken[] into PipelineStep[] for the pipeline panel.
// Attaches glosses from the sign tables where available.
import type { PipelineStep } from '../types';
import { SYLLABIC as _SYL, LOGOGRAM as _LOG, DETERMINATIVE as _DET, NUMBER as _NUM } from './cuneiformSigns';

function glossFor(kind: 'sign' | 'det', translit: string | undefined): string | undefined {
  if (!translit) return undefined;
  if (kind === 'det') {
    const key = translit.replace(/[{}]/g, '');
    return _DET[key]?.gloss;
  }
  // Try syllabic, then logogram (uppercase), then number.
  const lower = translit.toLowerCase();
  if (_SYL[lower]?.gloss) return _SYL[lower].gloss;
  if (_LOG[translit]?.gloss) return _LOG[translit].gloss;
  if (_LOG[translit.toUpperCase()]?.gloss) return _LOG[translit.toUpperCase()].gloss;
  if (_NUM[translit]?.gloss) return _NUM[translit].gloss;
  return undefined;
}

export function traceCuneiform(tokens: CuneiformToken[]): PipelineStep[] {
  const steps: PipelineStep[] = [];
  for (const t of tokens) {
    if (t.kind === 'space') {
      steps.push({ input: ' ', glyph: ' ', role: 'space' });
      continue;
    }
    const role = t.kind === 'det' ? 'determinative'
      : (t.translit && /^[A-Z]/.test(t.translit)) ? 'logogram'
      : /^[0-9]+$/.test(t.translit ?? '') ? 'number'
      : 'syllabic';
    const gloss = (t.kind === 'sign' || t.kind === 'det') ? glossFor(t.kind, t.translit) : undefined;
    steps.push({
      input: t.translit ?? '',
      glyph: t.glyph,
      role,
      detail: gloss,
    });
  }
  return steps;
}
