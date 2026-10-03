# A Nubian Moon (v0.6)

Browser-only app that renders text as ancient scripts. Vite + React + TypeScript.

## What's new in v0.6

Historical-accuracy pass on layout and script-specific controls:

- **Per-family layout constraints.** The layout dropdown shows all five
  options for every script but disables the ones not historically attested.
  Hieroglyphs get all four horizontal/vertical variants. Sumerian gets
  horizontal LTR plus the new archaic mode. Akkadian, Hittite, Elamite,
  Old Persian, Ugaritic get horizontal LTR only.
- **Archaic Sumerian mode.** A new layout option that approximates
  proto-cuneiform (Uruk / Jemdet Nasr period): signs rotated 90 degrees
  counter-clockwise, columns flowing top-to-bottom and right-to-left.
  This mirrors the pre-2000-BCE reading direction before the 90-degree
  rotation of the sign forms became standard.
- **Cartouche disabled outside hieroglyphs.** The oval frame is strictly
  an Egyptian convention. The checkbox now greys out with a
  "(Egyptian only)" note when a cuneiform-family script is selected.
- **Auto-clamp on script change.** Switching script family resets layout
  and cartouche to values valid for the new script.
- New `src/lib/scriptConstraints.ts` centralises all "what is this script
  allowed to do" logic.

## What's new in v0.5

Translation Pipeline panel. Every render now includes a step-by-step trace
showing how the English (or ATF) input became the final signs:

- One row per step with columns: input segment, glyph, role, detail
- Roles are colour-coded badges: uniliteral, biliteral, triliteral,
  determinative, logogram, syllabic, ideogram, digraph, letter, number, etc.
- Two views: detailed table + compact chip list (toggle in the header)
- Toggle on/off via the "Show translation pipeline" checkbox in Controls
- Works for all 7 script families and all modes

The panel makes it clear when the pipeline auto-adds a determinative,
when a digraph was matched over single letters, when English `l` became `r`,
and when a fallback substitution was used.

## What's new in v0.4

Cuneiform support across seven script families:

- Egyptian Hieroglyphs (unchanged from v0.3)
- Sumerian, Akkadian, Hittite, Elamite (shared Unicode Cuneiform block U+12000..U+123FF)
- Old Persian cuneiform (U+103A0..U+103DF, ~36 signs, semi-alphabetic)
- Ugaritic alphabet (U+10380..U+1039F, 30 consonantal signs)

Script family selector added above the mode selector. Each family has its
own pipeline, own sign palette, and its own bundled Noto font.

## Local dev

```
npm install
npm run dev
```

## Production build

```
npm run build
```

Output: `dist/`. Total bundle: ~1.6 MB uncompressed (fonts dominate).

## Cuneiform input syntax

Common to Sumerian, Akkadian, Hittite, Elamite:

- English mode (default): tries a small logogram dictionary (`king` -> LUGAL),
  else splits into CV/VC/CVC syllables via a greedy matcher.
  Determinatives from a small English-noun dictionary are auto-appended
  where they add information beyond the logogram.
- ATF mode (auto-detected when the input contains `-`, `{`, `}`, or any uppercase):
  - lowercase = syllabic reading (`lu-gal`)
  - UPPERCASE = logogram (`LUGAL`)
  - `{d}`, `{m}`, `{f}`, `{kur}`, `{uru}`, `{gish}` etc. = determinatives
  - Example: `{d}en-lil` for "the god Enlil"

Old Persian:

- English mode: CV syllable splitter over ~36 signs
- Manual ATF: use `-` or `.` between sign keys

Ugaritic:

- English mode: consonantal mapping (dropping vowels in the abjad style)
- Manual ATF: use `-` between letter keys

## Font handling

All four scripts have their font bundled:

- Noto Sans Egyptian Hieroglyphs (~400 KB woff2)
- Noto Sans Cuneiform (~470 KB woff2)
- Noto Sans Old Persian (~15 KB woff2)
- Noto Sans Ugaritic (~15 KB woff2)

Custom font URLs still work in hieroglyph mode via the "+ Add custom font" form.

## Inventory sizes

- Hieroglyphs: 25 uniliterals + ~80 biliterals + ~40 triliterals + ~20 determinatives
- Cuneiform: ~200 syllabic values + ~90 logograms + 20 determinatives + numbers
- Old Persian: 36 phonetic signs + 8 ideograms
- Ugaritic: 30 letters

## Honest limitations

- Cuneiform sign inventory is a well-documented subset, not the full ~900 signs
  of the block. Adding more is a matter of extending `src/lib/cuneiformSigns.ts`.
- English-to-cuneiform is a heuristic. Sumerian is a language isolate and
  Akkadian is Semitic; neither maps well from English orthography. For accurate
  transliterations use raw ATF.
- Old Persian and Ugaritic pipelines drop unmapped characters silently.
- No cartouche variant exists for cuneiform in real inscriptions; the CSS
  cartouche frame still wraps if enabled, purely as decoration.
