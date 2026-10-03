// Old Persian cuneiform (U+103A0..U+103DF).
// A semi-alphabetic script invented under Darius I (c. 522 BCE).
// 36 phonetic signs, 8 ideograms, plus a word divider.
// Each sign is CV or V; some consonants are context-limited.

export interface OPSignEntry {
  glyph: string;
  value: string;
  gloss?: string;
}

// Phonetic signs (key = ATF-ish transliteration).
export const OP_SIGNS: Record<string, OPSignEntry> = {
  'a': { glyph: '\u{103A0}', value: 'a' },
  'i': { glyph: '\u{103A1}', value: 'i' },
  'u': { glyph: '\u{103A2}', value: 'u' },
  'ka': { glyph: '\u{103A3}', value: 'ka' },
  'ku': { glyph: '\u{103A4}', value: 'ku' },
  'ga': { glyph: '\u{103A5}', value: 'ga' },
  'gu': { glyph: '\u{103A6}', value: 'gu' },
  'xa': { glyph: '\u{103A7}', value: 'xa (kh)' },
  'ca': { glyph: '\u{103A8}', value: 'ca (ch)' },
  'ci': { glyph: '\u{103A9}', value: 'ci' },
  'ja': { glyph: '\u{103AA}', value: 'ja' },
  'ji': { glyph: '\u{103AB}', value: 'ji' },
  'ta': { glyph: '\u{103AC}', value: 'ta' },
  'tu': { glyph: '\u{103AD}', value: 'tu' },
  'da': { glyph: '\u{103AE}', value: 'da' },
  'di': { glyph: '\u{103AF}', value: 'di' },
  'du': { glyph: '\u{103B0}', value: 'du' },
  'tha': { glyph: '\u{103B1}', value: 'tha' },
  'pa': { glyph: '\u{103B2}', value: 'pa' },
  'ba': { glyph: '\u{103B3}', value: 'ba' },
  'fa': { glyph: '\u{103B4}', value: 'fa' },
  'na': { glyph: '\u{103B5}', value: 'na' },
  'nu': { glyph: '\u{103B6}', value: 'nu' },
  'ma': { glyph: '\u{103B7}', value: 'ma' },
  'mi': { glyph: '\u{103B8}', value: 'mi' },
  'mu': { glyph: '\u{103B9}', value: 'mu' },
  'ya': { glyph: '\u{103BA}', value: 'ya' },
  'va': { glyph: '\u{103BB}', value: 'va' },
  'vi': { glyph: '\u{103BC}', value: 'vi' },
  'ra': { glyph: '\u{103BD}', value: 'ra' },
  'ru': { glyph: '\u{103BE}', value: 'ru' },
  'la': { glyph: '\u{103BF}', value: 'la' },
  'sa': { glyph: '\u{103C0}', value: 'sa' },
  'za': { glyph: '\u{103C1}', value: 'za' },
  'sha': { glyph: '\u{103C2}', value: 'sha' },
  'ssa': { glyph: '\u{103C3}', value: 'ssa' },
};

// Ideograms (whole-word signs).
export const OP_IDEOGRAMS: Record<string, OPSignEntry> = {
  'AURAMAZDA': { glyph: '\u{103C8}', value: 'AURAMAZDA', gloss: 'Ahura Mazda (nominative)' },
  'AURAMAZDA-GEN': { glyph: '\u{103C9}', value: 'AURAMAZDA-GEN', gloss: 'Ahura Mazda (genitive)' },
  'AM': { glyph: '\u{103CA}', value: 'AM', gloss: 'Ahura Mazda (short)' },
  'XSHAYATHIYA': { glyph: '\u{103CB}', value: 'XSHAYATHIYA', gloss: 'king' },
  'DAHYAUS': { glyph: '\u{103CC}', value: 'DAHYAUS', gloss: 'country' },
  'DAHYAVA': { glyph: '\u{103CD}', value: 'DAHYAVA', gloss: 'countries' },
  'BAGA': { glyph: '\u{103CE}', value: 'BAGA', gloss: 'god' },
  'BUMI': { glyph: '\u{103CF}', value: 'BUMI', gloss: 'earth' },
};

// Word divider.
export const OP_WORD_DIVIDER = '\u{103D0}';

// English-to-syllable mapping. Old Persian was CV-syllabic, so we split
// English words into CV chunks. Vowel-only signs handle initial vowels;
// consonant-alone signs are simulated by pairing with 'a' as default.
// Trace-carrying segment: what was consumed from the input and what sign
// it produced. Empty glyph means the segment was dropped.
export interface OPSegment {
  input: string;
  key: string;
  glyph: string;
  role: string;
}

export function englishToOldPersian(text: string): OPSegment[] {
  const out: OPSegment[] = [];
  const lower = text.toLowerCase();
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i];
    const raw = text[i];
    if (ch === ' ') {
      out.push({ input: ' ', key: 'sp', glyph: OP_WORD_DIVIDER, role: 'space' });
      i += 1;
      continue;
    }
    const tri = lower.slice(i, i + 3);
    if (OP_SIGNS[tri]) {
      out.push({ input: text.slice(i, i + 3), key: tri, glyph: OP_SIGNS[tri].glyph, role: 'CV-syllable' });
      i += 3;
      continue;
    }
    const two = lower.slice(i, i + 2);
    if (OP_SIGNS[two]) {
      out.push({ input: text.slice(i, i + 2), key: two, glyph: OP_SIGNS[two].glyph, role: 'CV-syllable' });
      i += 2;
      continue;
    }
    if (two === 'sh') { out.push({ input: text.slice(i, i + 2), key: 'sha', glyph: OP_SIGNS['sha'].glyph, role: 'digraph' }); i += 2; continue; }
    if (two === 'ch') { out.push({ input: text.slice(i, i + 2), key: 'ca', glyph: OP_SIGNS['ca'].glyph, role: 'digraph' }); i += 2; continue; }
    if (two === 'kh') { out.push({ input: text.slice(i, i + 2), key: 'xa', glyph: OP_SIGNS['xa'].glyph, role: 'digraph' }); i += 2; continue; }
    if (two === 'th') { out.push({ input: text.slice(i, i + 2), key: 'tha', glyph: OP_SIGNS['tha'].glyph, role: 'digraph' }); i += 2; continue; }
    if (isConsonant(ch)) {
      const next = lower[i + 1];
      if (next && isVowel(next)) {
        const key = mapConsonant(ch) + next;
        if (OP_SIGNS[key]) { out.push({ input: text.slice(i, i + 2), key, glyph: OP_SIGNS[key].glyph, role: 'CV-syllable' }); i += 2; continue; }
        const fb = mapConsonant(ch) + 'a';
        if (OP_SIGNS[fb]) { out.push({ input: text.slice(i, i + 2), key: fb, glyph: OP_SIGNS[fb].glyph, role: 'CV-fallback' }); i += 2; continue; }
      }
      const key = mapConsonant(ch) + 'a';
      if (OP_SIGNS[key]) out.push({ input: raw, key, glyph: OP_SIGNS[key].glyph, role: 'C+implicit-a' });
      else out.push({ input: raw, key: '', glyph: '', role: 'dropped' });
      i += 1;
      continue;
    }
    if (OP_SIGNS[ch]) {
      out.push({ input: raw, key: ch, glyph: OP_SIGNS[ch].glyph, role: 'vowel' });
    } else {
      out.push({ input: raw, key: '', glyph: '', role: 'dropped' });
    }
    i += 1;
  }
  return out;
}

function isVowel(c: string): boolean {
  return c === 'a' || c === 'i' || c === 'u' || c === 'e' || c === 'o';
}
function isConsonant(c: string): boolean {
  return /[a-z]/.test(c) && !isVowel(c);
}
function mapConsonant(c: string): string {
  // English letter -> Old Persian consonant letter.
  // Old Persian lacks /l/, /f/-variants, sibilant distinctions like English.
  const map: Record<string, string> = {
    'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
    'h': 'x', 'j': 'j', 'k': 'k', 'l': 'r', 'm': 'm',
    'n': 'n', 'p': 'p', 'q': 'k', 'r': 'r', 's': 's',
    't': 't', 'v': 'v', 'w': 'v', 'x': 'x', 'y': 'y',
    'z': 'z',
  };
  return map[c] || c;
}

// Palette entries for the UI.
export interface OPPaletteEntry {
  key: string;
  glyph: string;
  label: string;
}

export const OP_PALETTE: Record<string, OPPaletteEntry[]> = {
  'Vowels': ['a', 'i', 'u'].map(k => ({
    key: k, glyph: OP_SIGNS[k].glyph, label: k
  })),
  'CV signs': Object.entries(OP_SIGNS)
    .filter(([k]) => k.length > 1)
    .map(([k, v]) => ({ key: k, glyph: v.glyph, label: v.value })),
  'Ideograms': Object.entries(OP_IDEOGRAMS).map(([k, v]) => ({
    key: k, glyph: v.glyph, label: `${k} - ${v.gloss}`
  })),
};
