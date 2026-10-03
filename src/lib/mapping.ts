// English to Egyptian Hieroglyph mapping.
// Literal: 1 ASCII letter to 1 sign.
// Phonetic: digraph-aware tokenization to phonetic signs.
// Both modes also honor inline Gardiner codes written as <CODE> in the input,
// so the sign palette can insert signs into any hieroglyph mode.

import type { PipelineStep, RenderMode } from '../types';
import { gardinerToUnicode } from './mdcSigns';

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

const SPACE = ' ';
const INLINE_CODE_RE = /^<([A-Za-z]{1,3}\d+[a-z]?)>/;

function mapDigit(c: string): string {
  return DIGITS[c] ?? '';
}

function literalMap(text: string): string {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const m = text.slice(i).match(INLINE_CODE_RE);
    if (m) {
      const u = gardinerToUnicode(m[1]);
      if (u) out += u;
      i += m[0].length;
      continue;
    }
    const ch = text[i];
    const low = ch.toLowerCase();
    if (low >= 'a' && low <= 'z') out += LITERAL[low] ?? '';
    else if (low >= '0' && low <= '9') out += mapDigit(low);
    else if (low === ' ') out += SPACE;
    i += 1;
  }
  return out;
}

function phoneticMap(text: string): string {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const m = text.slice(i).match(INLINE_CODE_RE);
    if (m) {
      const u = gardinerToUnicode(m[1]);
      if (u) out += u;
      i += m[0].length;
      continue;
    }
    const ch = text[i].toLowerCase();
    if (ch === ' ') { out += SPACE; i += 1; continue; }
    if (ch >= '0' && ch <= '9') { out += mapDigit(ch); i += 1; continue; }
    const pair = text.slice(i, i + 2).toLowerCase();
    const dg = DIGRAPHS.find(([k]) => k === pair);
    if (dg) { out += dg[1]; i += 2; continue; }
    if (ch >= 'a' && ch <= 'z') { out += LITERAL[ch] ?? ''; i += 1; continue; }
    i += 1;
  }
  return out;
}

export function render(text: string, mode: RenderMode): string {
  if (!text) return '';
  return mode === 'literal' ? literalMap(text) : phoneticMap(text);
}

export function trace(text: string, mode: RenderMode): PipelineStep[] {
  if (!text) return [];
  return mode === 'literal' ? traceLiteral(text) : tracePhonetic(text);
}

function traceLiteral(text: string): PipelineStep[] {
  const steps: PipelineStep[] = [];
  let i = 0;
  while (i < text.length) {
    const m = text.slice(i).match(INLINE_CODE_RE);
    if (m) {
      const u = gardinerToUnicode(m[1]);
      steps.push({ input: m[0], glyph: u ?? '', role: 'literal-code', detail: `Gardiner ${m[1]}` });
      i += m[0].length;
      continue;
    }
    const ch = text[i];
    const low = ch.toLowerCase();
    if (low === ' ') steps.push({ input: ' ', glyph: ' ', role: 'space' });
    else if (low >= 'a' && low <= 'z' && LITERAL[low]) {
      steps.push({ input: ch, glyph: LITERAL[low], role: 'letter', detail: `Latin ${low} -> uniliteral proxy` });
    } else if (low >= '0' && low <= '9') {
      steps.push({ input: ch, glyph: DIGITS[low], role: 'digit', detail: `digit ${low}` });
    } else {
      steps.push({ input: ch, glyph: '', role: 'unknown', detail: 'dropped' });
    }
    i += 1;
  }
  return steps;
}

function tracePhonetic(text: string): PipelineStep[] {
  const steps: PipelineStep[] = [];
  let i = 0;
  while (i < text.length) {
    const m = text.slice(i).match(INLINE_CODE_RE);
    if (m) {
      const u = gardinerToUnicode(m[1]);
      steps.push({ input: m[0], glyph: u ?? '', role: 'literal-code', detail: `Gardiner ${m[1]}` });
      i += m[0].length;
      continue;
    }
    const ch = text[i].toLowerCase();
    if (ch === ' ') { steps.push({ input: ' ', glyph: ' ', role: 'space' }); i += 1; continue; }
    if (ch >= '0' && ch <= '9') { steps.push({ input: text[i], glyph: DIGITS[ch], role: 'digit', detail: `digit ${ch}` }); i += 1; continue; }
    const pair = text.slice(i, i + 2).toLowerCase();
    const dg = DIGRAPHS.find(([k]) => k === pair);
    if (dg) { steps.push({ input: text.slice(i, i + 2), glyph: dg[1], role: 'digraph', detail: `${pair} -> phonetic sign` }); i += 2; continue; }
    if (ch >= 'a' && ch <= 'z' && LITERAL[ch]) {
      steps.push({ input: text[i], glyph: LITERAL[ch], role: 'letter', detail: `Latin ${ch} -> uniliteral` });
    } else {
      steps.push({ input: text[i], glyph: '', role: 'unknown', detail: 'dropped' });
    }
    i += 1;
  }
  return steps;
}
