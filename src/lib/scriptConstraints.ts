// Historical constraints per script family.
//
// Layout: which reading directions are attested for a given script.
// Cartouche: only Egyptian hieroglyphs used cartouches.
// Font selector: only hieroglyphs has runtime-loadable font variants
// (the others use their single bundled Noto font).
//
// See PipelinePanel + Controls: options not in the allowed set are
// shown but disabled, so users can see what the historical script
// actually supported.

import type { LayoutDirection, ScriptFamily } from '../types';

// Allowed layout options per script family.
// - Hieroglyphs: all four orientations attested in monuments and papyri.
// - Sumerian: classical horizontal LTR (post ~2400 BCE) plus archaic
//   vertical-with-rotated-signs (Uruk/Jemdet Nasr period).
// - Akkadian, Hittite, Elamite: horizontal LTR only.
// - Old Persian: horizontal LTR only (Achaemenid inscriptions).
// - Ugaritic: horizontal LTR only.
export function allowedLayouts(family: ScriptFamily): LayoutDirection[] {
  if (family === 'hieroglyphs') {
    return ['horizontal-ltr', 'horizontal-rtl', 'vertical-rl', 'vertical-lr'];
  }
  if (family === 'sumerian') {
    return ['horizontal-ltr', 'archaic-sumerian'];
  }
  return ['horizontal-ltr'];
}

export function defaultLayout(_family: ScriptFamily): LayoutDirection {
  return 'horizontal-ltr';
}

export function isLayoutAllowed(family: ScriptFamily, layout: LayoutDirection): boolean {
  return allowedLayouts(family).includes(layout);
}

// Cartouches are strictly an Egyptian convention (an oval frame around
// royal or divine names). Enable only for hieroglyphs.
export function isCartoucheAllowed(family: ScriptFamily): boolean {
  return family === 'hieroglyphs';
}

// The font selector applies only to hieroglyphs. Other scripts use their
// dedicated bundled Noto font; runtime loading is not exposed for them.
export function isFontSelectorAllowed(family: ScriptFamily): boolean {
  return family === 'hieroglyphs';
}

// Human-readable label for each layout, used in the dropdown.
export function layoutLabel(l: LayoutDirection): string {
  switch (l) {
    case 'horizontal-ltr': return 'Horizontal, left to right';
    case 'horizontal-rtl': return 'Horizontal, right to left';
    case 'vertical-rl': return 'Vertical columns, right to left';
    case 'vertical-lr': return 'Vertical columns, left to right';
    case 'archaic-sumerian': return 'Archaic Sumerian (rotated columns)';
  }
}

// One-sentence rationale shown in the info popover for the disabled
// options, so users know why an option is greyed out.
export function layoutHistoricalNote(family: ScriptFamily): string {
  if (family === 'hieroglyphs') {
    return 'Egyptian hieroglyphs were written in all four directions depending on monument and context.';
  }
  if (family === 'sumerian') {
    return 'Classical Sumerian is horizontal LTR. Archaic Sumerian (before ~2000 BCE) used top-to-bottom columns with signs rotated 90 degrees.';
  }
  if (family === 'akkadian' || family === 'hittite' || family === 'elamite') {
    return `${family[0].toUpperCase()}${family.slice(1)} cuneiform is horizontal LTR only. Other directions are not historically attested.`;
  }
  if (family === 'old-persian') {
    return 'Old Persian was written horizontally LTR on Achaemenid monuments (Behistun, Persepolis).';
  }
  return 'Ugaritic is horizontal LTR only.';
}
