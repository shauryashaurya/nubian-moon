import type { FontOption } from '../types';

// Default bundled font (always available, even offline).
export const BUNDLED_FONT: FontOption = {
  family: 'Noto Sans Egyptian Hieroglyphs',
  label: 'Noto Sans Hieroglyphs (bundled)',
  source: 'bundled',
  loaded: true,
};

// Curated runtime-loadable fonts. These are NOT shipped in the bundle.
// They are fetched only when the user selects them. Requires a network
// connection at selection time; once loaded, the browser caches them.
//
// Adding new entries: include a stable URL pointing to either a CSS file
// (source: 'remote-css', loaded via <link>) or a font binary woff2/ttf
// (source: 'remote-face', loaded via FontFace API).
export const REMOTE_FONTS: FontOption[] = [
  {
    family: 'Noto Sans Egyptian Hieroglyphs',
    label: 'Noto Sans Hieroglyphs (Google CDN)',
    source: 'remote-css',
    url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Egyptian+Hieroglyphs&display=swap',
    loaded: false,
  },
];

// Cache of URLs we have already attempted to load, to avoid duplicate work.
const loadedUrls = new Set<string>();

// Inject a <link rel="stylesheet"> for a remote CSS URL. Resolves when the
// link's load event fires.
function loadRemoteCss(url: string): Promise<void> {
  if (loadedUrls.has(url)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => {
      loadedUrls.add(url);
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load CSS at ${url}`));
    document.head.appendChild(link);
  });
}

// Register a font via the FontFace API. Works with direct .woff2 / .woff /
// .ttf / .otf URLs. Useful for users who paste their own font URLs.
async function loadFontFace(family: string, url: string): Promise<void> {
  const key = `${family}|${url}`;
  if (loadedUrls.has(key)) return;
  const face = new FontFace(family, `url(${JSON.stringify(url)})`);
  await face.load();
  document.fonts.add(face);
  loadedUrls.add(key);
}

// High-level loader: dispatch based on the font's `source` field.
export async function loadFont(font: FontOption): Promise<void> {
  if (font.source === 'bundled') return;
  if (!font.url) throw new Error('Font URL missing');
  if (font.source === 'remote-css') {
    await loadRemoteCss(font.url);
  } else {
    await loadFontFace(font.family, font.url);
  }
}