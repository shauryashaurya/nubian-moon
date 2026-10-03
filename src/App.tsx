import { useCallback, useRef, useState } from 'react';
import Banner from './components/Banner';
import Controls from './components/Controls';
import RenderPanel from './components/RenderPanel';
import SignPalette from './components/SignPalette';
import PipelinePanel from './components/PipelinePanel';
import { render as renderLiteralOrPhonetic, trace as traceLiteralOrPhonetic } from './lib/mapping';
import { renderMdC, tracePipelineFromGroups, type Group } from './lib/mdc';
import {
  renderCuneiform,
  traceCuneiform,
  type CuneiformToken,
  type CuneiformDialect,
} from './lib/cuneiform';
import {
  englishToOldPersian,
  OP_SIGNS,
  OP_IDEOGRAMS,
  OP_WORD_DIVIDER,
  type OPSegment,
} from './lib/oldPersianSigns';
import {
  englishToUgaritic,
  UG_LETTERS,
  UG_WORD_DIVIDER,
  type UGSegment,
} from './lib/ugariticSigns';
import { PRESETS } from './lib/presets';
import { downloadImage } from './lib/exportImage';
import { BUNDLED_FONT, REMOTE_FONTS, loadFont } from './lib/fontLoader';
import type { AppState, FontOption, PipelineStep, ScriptFamily } from './types';

const INITIAL: AppState = {
  inputText: '',
  hasRendered: false,
  cartouche: false,
  scriptFamily: 'hieroglyphs',
  mode: 'literal',
  cuneiformMode: 'english',
  layout: 'horizontal-ltr',
  preset: 'Gold',
  style: { ...PRESETS.Gold },
  showPipeline: true,
  inputFont: 'mono',
};

export function fontFamilyFor(family: ScriptFamily, styleFontFamily: string): string {
  if (family === 'hieroglyphs') return styleFontFamily;
  if (family === 'old-persian') return 'Noto Sans Old Persian';
  if (family === 'ugaritic') return 'Noto Sans Ugaritic';
  return 'Noto Sans Cuneiform';
}

function dialectFor(family: ScriptFamily): CuneiformDialect {
  switch (family) {
    case 'sumerian': return 'sumerian';
    case 'akkadian': return 'akkadian';
    case 'hittite': return 'hittite';
    case 'elamite': return 'elamite';
    default: return 'akkadian';
  }
}

function opSegments(text: string): OPSegment[] {
  const hasATF = /[-.]|[A-Z]/.test(text);
  if (!hasATF) return englishToOldPersian(text);
  const out: OPSegment[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ input: ' ', key: 'sp', glyph: OP_WORD_DIVIDER, role: 'space' });
    const parts = word.split(/[-.]/).filter(Boolean);
    for (const p of parts) {
      if (OP_IDEOGRAMS[p]) {
        out.push({ input: p, key: p, glyph: OP_IDEOGRAMS[p].glyph, role: 'ideogram' });
        continue;
      }
      const key = p.toLowerCase();
      if (OP_SIGNS[key]) {
        out.push({ input: p, key, glyph: OP_SIGNS[key].glyph, role: 'ATF-syllable' });
      } else {
        out.push({ input: p, key: '', glyph: '', role: 'unknown' });
      }
    }
  });
  return out;
}

function ugSegments(text: string): UGSegment[] {
  const hasATF = /-/.test(text);
  if (!hasATF) return englishToUgaritic(text);
  const out: UGSegment[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    if (wi > 0) out.push({ input: ' ', key: 'sp', glyph: UG_WORD_DIVIDER, role: 'space' });
    const parts = word.split('-').filter(Boolean);
    for (const p of parts) {
      if (UG_LETTERS[p]) {
        out.push({ input: p, key: p, glyph: UG_LETTERS[p].glyph, role: 'letter', translit: UG_LETTERS[p].translit });
      } else {
        out.push({ input: p, key: '', glyph: '', role: 'unknown' });
      }
    }
  });
  return out;
}

function segmentsToString<T extends { glyph: string }>(segs: T[]): string {
  return segs.map(s => s.glyph).join('');
}

function opTrace(segs: OPSegment[]): PipelineStep[] {
  return segs.map(s => ({
    input: s.input,
    glyph: s.glyph,
    role: s.role,
    detail: s.key ? `sign ${s.key}` : undefined,
  }));
}

function ugTrace(segs: UGSegment[]): PipelineStep[] {
  return segs.map(s => ({
    input: s.input,
    glyph: s.glyph,
    role: s.role,
    detail: s.translit ?? (s.key ? `letter ${s.key}` : undefined),
  }));
}

// Non-hieroglyph scripts need a '-' separator between consecutive signs
// so that ATF parsing can see each token as a unit.
// A separator is added only if adjacent character is a letter/digit.
function needsSeparator(ch: string | undefined): boolean {
  if (!ch) return false;
  if (ch === '-' || ch === '{' || ch === '}') return false;
  if (/\s/.test(ch)) return false;
  return true;
}

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL);
  const [fonts, setFonts] = useState<FontOption[]>([BUNDLED_FONT, ...REMOTE_FONTS]);
  const renderRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const update = useCallback((patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  function doRender() {
    setState((s) => ({ ...s, hasRendered: true }));
  }

  async function onLoadFont(font: FontOption): Promise<void> {
    await loadFont(font);
    setFonts((list) =>
      list.map((f) =>
        f.family === font.family && f.label === font.label ? { ...f, loaded: true } : f
      )
    );
  }

  async function onAddCustomFont(family: string, url: string): Promise<void> {
    const next: FontOption = { family, label: family + ' (custom)', source: 'user-face', url, loaded: false };
    await loadFont(next);
    next.loaded = true;
    setFonts((list) => [...list, next]);
    setState((s) => ({ ...s, style: { ...s.style, fontFamily: family } }));
  }

  function onSelectFont(family: string) {
    setState((s) => ({ ...s, style: { ...s.style, fontFamily: family } }));
  }

  // Insert a palette sign at the caret with family-appropriate wrapping and
  // separator rules. Auto-renders so the user sees live feedback as they
  // click signs; if the resulting input produces no output, the diagnostic
  // in RenderPanel explains why.
  function onInsertCode(rawToken: string) {
    const family = state.scriptFamily;
    const ta = textareaRef.current;
    setState((s) => {
      const cur = s.inputText;
      const focused = ta && document.activeElement === ta;
      const start = focused ? (ta.selectionStart ?? cur.length) : cur.length;
      const end = focused ? (ta.selectionEnd ?? cur.length) : cur.length;

      const base = family === 'hieroglyphs' ? `<${rawToken}>` : rawToken;

      let insertion = base;
      if (family !== 'hieroglyphs') {
        const prev = start > 0 ? cur[start - 1] : undefined;
        const nextCh = end < cur.length ? cur[end] : undefined;
        const startsWithBrace = base.startsWith('{');
        const endsWithBrace = base.endsWith('}');
        if (needsSeparator(prev) && !startsWithBrace) insertion = '-' + insertion;
        if (needsSeparator(nextCh) && !endsWithBrace) insertion = insertion + '-';
      }

      const nextText = cur.slice(0, start) + insertion + cur.slice(end);
      if (focused) {
        queueMicrotask(() => {
          ta.focus();
          const pos = start + insertion.length;
          ta.setSelectionRange(pos, pos);
        });
      }
      return { ...s, inputText: nextText, hasRendered: true };
    });
  }

  async function onDownload(format: 'png' | 'jpg') {
    if (!renderRef.current) return;
    const safe = (state.inputText || 'render').replace(/[^a-z0-9]+/gi, '_').slice(0, 24);
    try {
      await downloadImage(renderRef.current, format, `nubian_moon_${safe}`);
    } catch (err) {
      console.error('export failed', err);
      alert('Image export failed. See console.');
    }
  }

  const show = state.hasRendered && state.inputText.trim().length > 0;
  const family = state.scriptFamily;

  let text = '';
  let groups: Group[] = [];
  let cuneiTokens: CuneiformToken[] = [];
  let pipeline: PipelineStep[] = [];

  if (show) {
    if (family === 'hieroglyphs') {
      if (state.mode === 'mdc') {
        groups = renderMdC(state.inputText);
        pipeline = tracePipelineFromGroups(groups);
      } else {
        text = renderLiteralOrPhonetic(state.inputText, state.mode);
        pipeline = traceLiteralOrPhonetic(state.inputText, state.mode);
      }
    } else if (family === 'old-persian') {
      const segs = opSegments(state.inputText);
      text = segmentsToString(segs);
      pipeline = opTrace(segs);
    } else if (family === 'ugaritic') {
      const segs = ugSegments(state.inputText);
      text = segmentsToString(segs);
      pipeline = ugTrace(segs);
    } else {
      cuneiTokens = renderCuneiform(state.inputText, dialectFor(family));
      pipeline = traceCuneiform(cuneiTokens);
    }
  }

  const paletteVisible = true;
  const displayFontFamily = fontFamilyFor(family, state.style.fontFamily);
  const pipelineFontFamily = displayFontFamily;
  const inputForPanel = state.hasRendered ? state.inputText : '';

  return (
    <div className="app">
      <Banner />
      <main className="layout">
        <div className="left-col">
          <Controls
            ref={textareaRef}
            state={state}
            onChange={update}
            onRender={doRender}
            fonts={fonts}
            onSelectFont={onSelectFont}
            onLoadFont={onLoadFont}
            onAddCustomFont={onAddCustomFont}
          />
          {paletteVisible && (
            <div className="palette-panel">
              <SignPalette scriptFamily={family} onInsert={onInsertCode} />
            </div>
          )}
        </div>
        <section className="stage">
          <div className="render-area">
            <RenderPanel
              ref={renderRef}
              scriptFamily={family}
              mode={state.mode}
              text={text}
              groups={groups}
              cuneiTokens={cuneiTokens}
              cartouche={state.cartouche}
              layout={state.layout}
              style={{ ...state.style, fontFamily: displayFontFamily }}
              inputText={inputForPanel}
            />
          </div>
          <div className="download-row">
            <button onClick={() => onDownload('png')} disabled={!show}>
              Download PNG
            </button>
            <button onClick={() => onDownload('jpg')} disabled={!show}>
              Download JPG
            </button>
            <span className="dl-note">max 800px wide</span>
          </div>
          {state.showPipeline && show && (
            <PipelinePanel
              steps={pipeline}
              scriptFamily={family}
              mode={state.mode}
              inputText={state.inputText}
              fontFamily={pipelineFontFamily}
            />
          )}
        </section>
      </main>
    </div>
  );
}
