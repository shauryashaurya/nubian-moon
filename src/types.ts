// import type { CSSProperties } from 'react';

export type LayoutDirection = 'horizontal-ltr' | 'horizontal-rtl' | 'vertical-rl' | 'vertical-lr';

// ADDED 'mdc' to the RenderMode union
export type RenderMode = 'literal' | 'phonetic' | 'mdc';

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

export interface AppState {
  inputText: string;
  hasRendered: boolean; // FIXED: changed from `rendered: string` to match App.tsx
  cartouche: boolean;
  mode: RenderMode;
  layout: LayoutDirection;
  style: StyleConfig;
  preset: string;
}