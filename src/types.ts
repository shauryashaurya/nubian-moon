export type LayoutDirection =
  | 'horizontal-ltr'
  | 'horizontal-rtl'
  | 'vertical-rl'
  | 'vertical-lr'
  | 'archaic-sumerian';

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

export type InputFont = 'cinzel' | 'mono';

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

export interface PipelineStep {
  input: string;
  glyph: string;
  role: string;
  detail?: string;
  fontFamily?: string;
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
  inputFont: InputFont;
}
