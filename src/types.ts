export type LayoutDirection =
  | 'horizontal-ltr'
  | 'horizontal-rtl'
  | 'vertical-rl'
  | 'vertical-lr'
  | 'archaic-sumerian';  // proto-cuneiform columns, signs rotated 90 CCW

export type RenderMode = 'literal' | 'phonetic' | 'mdc';

export type ScriptFamily =
  | 'hieroglyphs'
  | 'sumerian'
  | 'akkadian'
  | 'hittite'
  | 'elamite'
  | 'old-persian'
  | 'ugaritic';

export type CuneiformMode = 'english' | 'atf' | 'literal';

export interface StyleConfig {
  bgColor: string;
  textColor: string;
  fontSize: number;
  letterSpacing: number;
  padding: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  borderColor: string;
  borderWidth: number;
  fontFamily: string;
}

export interface FontOption {
  family: string;
  label: string;
  source: 'bundled' | 'remote-css' | 'remote-face' | 'user-face';
  url?: string;
  loaded: boolean;
}

// A single step in the derivation from English input to rendered glyph(s).
// Emitted by every pipeline (literal, phonetic, MdC, cuneiform, OP, UG)
// and displayed in the Translation Pipeline panel.
export interface PipelineStep {
  input: string;      // source segment as it appeared in the user input
  glyph: string;      // rendered sign(s) for this step
  role: string;       // classifier: 'uniliteral' | 'biliteral' | 'triliteral' | 'determinative' | 'logogram' | 'syllabic' | 'digit' | 'digraph' | 'literal-code' | 'letter' | 'space' | 'unknown'
  detail?: string;    // human note: Gardiner code, ATF value, gloss
  fontFamily?: string; // font override for palette glyph rendering
}

export interface AppState {
  inputText: string;
  hasRendered: boolean;
  cartouche: boolean;
  scriptFamily: ScriptFamily;
  mode: RenderMode;
  cuneiformMode: CuneiformMode;
  layout: LayoutDirection;
  style: StyleConfig;
  preset: string;
  showPipeline: boolean;
}
