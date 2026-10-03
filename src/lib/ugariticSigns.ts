// Ugaritic (U+10380..U+1039F).
// A cuneiform alphabet with 30 consonantal signs, used in Ugarit
// (Ras Shamra) in the 14th-12th centuries BCE. Structurally an abjad;
// visually cuneiform (impressed wedges on clay).
//
// Names in Unicode follow the reconstructed Ugaritic letter names.

export interface UGSignEntry {
  glyph: string;
  translit: string;
  gloss?: string;
}

export const UG_LETTERS: Record<string, UGSignEntry> = {
  'a': { glyph: '\u{10380}', translit: 'a (alpa)', gloss: 'glottal + a' },
  'b': { glyph: '\u{10381}', translit: 'b (beta)' },
  'g': { glyph: '\u{10382}', translit: 'g (gamla)' },
  'kh': { glyph: '\u{10383}', translit: 'kh (khenna)' },
  'd': { glyph: '\u{10384}', translit: 'd (delta)' },
  'h': { glyph: '\u{10385}', translit: 'h (ho)' },
  'w': { glyph: '\u{10386}', translit: 'w (wo)' },
  'z': { glyph: '\u{10387}', translit: 'z (zeta)' },
  'H': { glyph: '\u{10388}', translit: 'H (hota, h-dot)' },
  'T': { glyph: '\u{10389}', translit: 'T (tet, emphatic)' },
  'y': { glyph: '\u{1038A}', translit: 'y (yod)' },
  'k': { glyph: '\u{1038B}', translit: 'k (kaf)' },
  'sh': { glyph: '\u{1038C}', translit: 'sh (shin)' },
  'l': { glyph: '\u{1038D}', translit: 'l (lamda)' },
  'm': { glyph: '\u{1038E}', translit: 'm (mem)' },
  'dh': { glyph: '\u{1038F}', translit: 'dh (dhal)' },
  'n': { glyph: '\u{10390}', translit: 'n (nun)' },
  'z2': { glyph: '\u{10391}', translit: 'z2 (zu)' },
  's': { glyph: '\u{10392}', translit: 's (samka)' },
  'A': { glyph: '\u{10393}', translit: 'A (ain, glottal)' },
  'p': { glyph: '\u{10394}', translit: 'p (pu)' },
  'S': { glyph: '\u{10395}', translit: 'S (sade, emphatic)' },
  'q': { glyph: '\u{10396}', translit: 'q (qopa)' },
  'r': { glyph: '\u{10397}', translit: 'r (rasha)' },
  'th': { glyph: '\u{10398}', translit: 'th (thanna)' },
  'gh': { glyph: '\u{10399}', translit: 'gh (ghain)' },
  't': { glyph: '\u{1039A}', translit: 't (to)' },
  'i': { glyph: '\u{1039B}', translit: 'i (glottal + i)' },
  'u': { glyph: '\u{1039C}', translit: 'u (glottal + u)' },
  'ss': { glyph: '\u{1039D}', translit: 'ss (ssu)' },
};

export const UG_WORD_DIVIDER = '\u{1039F}';

// English letter -> Ugaritic letter key.
const EN_TO_UG: Record<string, string> = {
  'a': 'a', 'b': 'b', 'c': 'k', 'd': 'd', 'e': 'i',
  'f': 'p', 'g': 'g', 'h': 'h', 'i': 'i', 'j': 'y',
  'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'u',
  'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't',
  'u': 'u', 'v': 'w', 'w': 'w', 'x': 'kh', 'y': 'y',
  'z': 'z',
};

// English digraphs.
const EN_DIGRAPH_UG: Array<[string, string]> = [
  ['sh', 'sh'],
  ['ch', 'sh'],
  ['kh', 'kh'],
  ['th', 'th'],
  ['ph', 'p'],
  ['gh', 'gh'],
  ['dh', 'dh'],
];

export interface UGSegment {
  input: string;
  key: string;
  glyph: string;
  role: string;
  translit?: string;
}

export function englishToUgaritic(text: string): UGSegment[] {
  const out: UGSegment[] = [];
  const lower = text.toLowerCase();
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i];
    const raw = text[i];
    if (ch === ' ') {
      out.push({ input: ' ', key: 'sp', glyph: UG_WORD_DIVIDER, role: 'space' });
      i += 1;
      continue;
    }
    const two = lower.slice(i, i + 2);
    const dg = EN_DIGRAPH_UG.find(([k]) => k === two);
    if (dg) {
      const sign = UG_LETTERS[dg[1]];
      if (sign) out.push({ input: text.slice(i, i + 2), key: dg[1], glyph: sign.glyph, role: 'digraph', translit: sign.translit });
      i += 2;
      continue;
    }
    const key = EN_TO_UG[ch];
    if (key && UG_LETTERS[key]) {
      out.push({ input: raw, key, glyph: UG_LETTERS[key].glyph, role: 'letter', translit: UG_LETTERS[key].translit });
    } else {
      out.push({ input: raw, key: '', glyph: '', role: 'dropped' });
    }
    i += 1;
  }
  return out;
}

export interface UGPaletteEntry {
  key: string;
  glyph: string;
  label: string;
}

export const UG_PALETTE: Record<string, UGPaletteEntry[]> = {
  'Consonants': Object.entries(UG_LETTERS).map(([k, v]) => ({
    key: k, glyph: v.glyph, label: v.translit
  })),
};
