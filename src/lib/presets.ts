import type { StyleConfig } from '../types';

export const DEFAULT_FONT = 'Noto Sans Egyptian Hieroglyphs';

export const PRESETS: Record<string, StyleConfig> = {
  Gold: {
    bgColor: '#1a1208',
    textColor: '#f4c542',
    fontSize: 72,
    letterSpacing: 4,
    padding: 48,
    shadowColor: '#7a4a00',
    shadowBlur: 12,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    borderColor: '#8a6a1a',
    borderWidth: 2,
    fontFamily: DEFAULT_FONT,
  },
  Fire: {
    bgColor: '#1c0a05',
    textColor: '#ff6b1a',
    fontSize: 72,
    letterSpacing: 4,
    padding: 48,
    shadowColor: '#ffae42',
    shadowBlur: 18,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    borderColor: '#5a1a0a',
    borderWidth: 2,
    fontFamily: DEFAULT_FONT,
  },
  Sands: {
    bgColor: '#e8d6a8',
    textColor: '#5a3a1a',
    fontSize: 72,
    letterSpacing: 4,
    padding: 48,
    shadowColor: '#c4a878',
    shadowBlur: 4,
    shadowOffsetX: 1,
    shadowOffsetY: 1,
    borderColor: '#9a7a4a',
    borderWidth: 2,
    fontFamily: DEFAULT_FONT,
  },
  Lapis: {
    bgColor: '#0a1a3a',
    textColor: '#d4af37',
    fontSize: 72,
    letterSpacing: 4,
    padding: 48,
    shadowColor: '#1a3a7a',
    shadowBlur: 14,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    borderColor: '#2a4a8a',
    borderWidth: 2,
    fontFamily: DEFAULT_FONT,
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);
