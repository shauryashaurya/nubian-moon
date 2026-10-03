// Cuneiform pipeline for Sumerian, Akkadian, Hittite, Elamite.
// All four share the same underlying sign block; convention differs.
//
// Two input paths:
//   1) English mode: best-effort English-to-syllable splitter.
//   2) ATF mode: raw Oracc-style tokens separated by '-'; whitespace between
//      words; {det} for determinatives; UPPERCASE for logograms; lowercase
//      for syllabic.
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

const ATF_RE = /[-{}]|[A-Z]/;

// Exported so the renderer can tell the user WHY their input produced
// nothing (ATF path triggered, no tokens matched vs English path empty).
export function isATFInput(text: string): boolean {
  return ATF_RE.test(text);
}

export function renderCuneiform(text: string, dialect: CuneiformDialect): CuneiformToken[] {
  if (!text.trim()) return [];
  if (isATFInput(text)) return parseATF(text);
  return parseEnglish(text, dialect);
}

function parseATF(text: string): CuneiformToken[] {
  const out: CuneiformToken[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ glyph: '', kind: 'space' });
    let i = 0;
    let buffer = '';
    while (i < word.length) {
      const ch = word[i];
      if (ch === '{') {
        if (buffer) { emitSigns(buffer, out); buffer = ''; }
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

function emitSigns(span: string, out: CuneiformToken[]): void {
  const parts = span.split('-').filter(Boolean);
  for (const raw of parts) {
    const glyph = lookupSign(raw) ?? lookupSign(raw.replace(/[0-9]+$/, ''));
    if (glyph) out.push({ glyph, kind: 'sign', translit: raw });
  }
}

function parseEnglish(text: string, _dialect: CuneiformDialect): CuneiformToken[] {
  const out: CuneiformToken[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ glyph: '', kind: 'space' });
    const lower = word.toLowerCase();
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
    const signs = englishToSyllables(lower);
    for (const s of signs) out.push(s);
    const detKey = DETERMINATIVE_BY_WORD[lower];
    if (detKey && DETERMINATIVE[detKey]) {
      out.push({ glyph: DETERMINATIVE[detKey].glyph, kind: 'det', translit: `{${detKey}}` });
    }
  });
  return out;
}

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
    const ch = normalized[i];
    if (SYLLABIC[ch]) {
      out.push({ glyph: SYLLABIC[ch].glyph, kind: 'sign', translit: ch });
      i += 1;
      continue;
    }
    if (NUMBER[ch]) {
      out.push({ glyph: NUMBER[ch].glyph, kind: 'sign', translit: ch });
      i += 1;
      continue;
    }
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

function normalizeEnglish(word: string): string {
  let s = word.toLowerCase();
  s = s.replace(/sh/g, 'sh');
  s = s.replace(/ch/g, 'sh');
  s = s.replace(/kh/g, 'h');
  s = s.replace(/th/g, 't');
  s = s.replace(/ph/g, 'p');
  s = s.replace(/gh/g, 'g');
  s = s.replace(/qu/g, 'ku');
  s = s.replace(/ck/g, 'k');
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

import type { PipelineStep } from '../types';
import { SYLLABIC as _SYL, LOGOGRAM as _LOG, DETERMINATIVE as _DET, NUMBER as _NUM } from './cuneiformSigns';

function glossFor(kind: 'sign' | 'det', translit: string | undefined): string | undefined {
  if (!translit) return undefined;
  if (kind === 'det') {
    const key = translit.replace(/[{}]/g, '');
    return _DET[key]?.gloss;
  }
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
