import { useState, type ChangeEvent, type Ref } from 'react';
import type { AppState, FontOption, LayoutDirection, RenderMode, ScriptFamily, StyleConfig } from '../types';
import { PRESETS, PRESET_NAMES } from '../lib/presets';
import {
  defaultLayout,
  isLayoutAllowed,
  isCartoucheAllowed,
  isFontSelectorAllowed,
  layoutLabel,
  layoutHistoricalNote,
} from '../lib/scriptConstraints';
import InfoIcon from './InfoIcon';

const ALL_LAYOUTS: LayoutDirection[] = [
  'horizontal-ltr',
  'horizontal-rtl',
  'vertical-rl',
  'vertical-lr',
  'archaic-sumerian',
];

const TEXT_LIMIT = 50;
const CARTOUCHE_LIMIT = 24;
const MDC_LIMIT = 200;
const MDC_CARTOUCHE_LIMIT = 80;
const CUNEIFORM_LIMIT = 300;
const CUNEIFORM_CARTOUCHE_LIMIT = 120;

const SCRIPT_FAMILY_OPTIONS: Array<{ value: ScriptFamily; label: string }> = [
  { value: 'hieroglyphs', label: 'Egyptian Hieroglyphs' },
  { value: 'sumerian', label: 'Cuneiform - Sumerian' },
  { value: 'akkadian', label: 'Cuneiform - Akkadian' },
  { value: 'hittite', label: 'Cuneiform - Hittite' },
  { value: 'elamite', label: 'Cuneiform - Elamite' },
  { value: 'old-persian', label: 'Old Persian cuneiform' },
  { value: 'ugaritic', label: 'Ugaritic alphabet' },
];

// React 19 accepts `ref` as a plain prop. forwardRef is deprecated.
interface Props {
  state: AppState;
  onChange: (next: Partial<AppState>) => void;
  onRender: () => void;
  fonts: FontOption[];
  onSelectFont: (family: string) => void;
  onLoadFont: (font: FontOption) => Promise<void>;
  onAddCustomFont: (family: string, url: string) => Promise<void>;
  ref?: Ref<HTMLTextAreaElement>;
}

export default function Controls({
  state,
  onChange,
  onRender,
  fonts,
  onSelectFont,
  onLoadFont,
  onAddCustomFont,
  ref: textareaRef,
}: Props) {
  const limit = computeLimit(state.scriptFamily, state.mode, state.cartouche);
  const remaining = limit - state.inputText.length;

  const [showAddFont, setShowAddFont] = useState(false);
  const [newFontFamily, setNewFontFamily] = useState('');
  const [newFontUrl, setNewFontUrl] = useState('');
  const [fontStatus, setFontStatus] = useState<string>('');

  const isHiero = state.scriptFamily === 'hieroglyphs';
  const isCuneiform = ['sumerian', 'akkadian', 'hittite', 'elamite'].includes(state.scriptFamily);
  const isOP = state.scriptFamily === 'old-persian';
  const isUG = state.scriptFamily === 'ugaritic';

  function setStyle(patch: Partial<StyleConfig>) {
    onChange({ style: { ...state.style, ...patch }, preset: 'Custom' });
  }

  function pickPreset(name: string) {
    if (name === 'Custom') {
      onChange({ preset: 'Custom' });
      return;
    }
    const p = PRESETS[name];
    if (!p) return;
    onChange({ preset: name, style: { ...p, fontFamily: state.style.fontFamily } });
  }

  function onInput(e: ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value.slice(0, limit);
    onChange({ inputText: v });
  }

  function onScriptFamilyChange(next: ScriptFamily) {
    const patch: Partial<AppState> = { scriptFamily: next, hasRendered: false };
    if (!isLayoutAllowed(next, state.layout)) {
      patch.layout = defaultLayout(next);
    }
    if (state.cartouche && !isCartoucheAllowed(next)) {
      patch.cartouche = false;
    }
    onChange(patch);
  }

  async function handleFontChange(family: string) {
    const f = fonts.find((x) => x.family + '|' + x.label === family);
    if (!f) return;
    if (!f.loaded) {
      setFontStatus(`Loading ${f.label}...`);
      try {
        await onLoadFont(f);
        setFontStatus('');
      } catch (err) {
        setFontStatus(`Failed: ${String(err)}`);
        return;
      }
    }
    onSelectFont(f.family);
  }

  async function handleAddFont() {
    if (!newFontFamily.trim() || !newFontUrl.trim()) {
      setFontStatus('Provide both family name and URL');
      return;
    }
    setFontStatus(`Loading ${newFontFamily}...`);
    try {
      await onAddCustomFont(newFontFamily.trim(), newFontUrl.trim());
      setFontStatus('');
      setNewFontFamily('');
      setNewFontUrl('');
      setShowAddFont(false);
    } catch (err) {
      setFontStatus(`Failed: ${String(err)}`);
    }
  }

  const fontDropdownValue = (() => {
    const match = fonts.find((f) => f.family === state.style.fontFamily && f.loaded);
    return match ? match.family + '|' + match.label : '';
  })();

  const placeholder = isHiero
    ? (state.mode === 'mdc' ? 'English, or MdC like S29-N35:X1' : 'Type a name or short phrase...')
    : isCuneiform
      ? 'English (best-effort), or ATF like lugal or {d}en-lil2'
      : isOP
        ? 'English or dashed ATF like da-a-ra-ya-va-u-sha'
        : 'English (best-effort Ugaritic transliteration)';

  return (
    <aside className="controls">
      <section className="control-group">
        <div className="group-head">
          <h3>Script</h3>
          <InfoIcon label="About script families">
            The script selector controls both the sign inventory and the pipeline that turns your input into glyphs.<br /><br />
            <strong>Hieroglyphs:</strong> literal, phonetic, or MdC modes.<br />
            <strong>Sumerian / Akkadian / Hittite / Elamite:</strong> share the same cuneiform Unicode block; each has its own conventions. English is split into syllables; raw ATF (Oracc-style: <code>lugal</code>, <code>{'{d}'}en-lil2</code>) auto-detected.<br />
            <strong>Old Persian:</strong> Darius-era cuneiform. Semi-alphabetic, ~36 signs.<br />
            <strong>Ugaritic:</strong> a cuneiform alphabet (abjad), 30 consonants.
          </InfoIcon>
        </div>
        <select
          className="select"
          value={state.scriptFamily}
          onChange={(e) => onScriptFamilyChange(e.target.value as ScriptFamily)}
        >
          {SCRIPT_FAMILY_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </section>

      <section className="control-group">
        <h3>Text</h3>
        <textarea
          ref={textareaRef}
          className="text-input"
          value={state.inputText}
          onChange={onInput}
          maxLength={limit}
          placeholder={placeholder}
          rows={3}
        />
        <div className="counter">
          {state.inputText.length}/{limit} {remaining < 10 ? '(near limit)' : ''}
        </div>
        <button className="render-btn" onClick={onRender} disabled={!state.inputText.trim()}>
          Render
        </button>
      </section>

      {isHiero && (
        <section className="control-group">
          <div className="group-head">
            <h3>Mode</h3>
            <InfoIcon label="About modes">
              <strong>Literal</strong>: each English letter maps to one hieroglyph.<br />
              <strong>Phonetic</strong>: digraphs like SH, KH, TH are detected before single letters.<br />
              <strong>MdC</strong>: comprehensive Manuel de Codage pipeline. English is greedily matched against triliterals, biliterals, then uniliterals. Determinatives auto-appended for common words.<br /><br />
              <strong>English input syntax:</strong><br />
              - <code>|</code> splits syllables into separate quadrats: <code>cle|o|pat|ra</code>.<br />
              - <code>&lt;CODE&gt;</code> drops a literal Gardiner sign: <code>my &lt;S34&gt; life</code>.<br /><br />
              <strong>Raw MdC input:</strong> if input contains any of <code>-</code> <code>:</code> <code>*</code> <code>!</code>, parsed as MdC.
            </InfoIcon>
          </div>
          <div className="seg-control">
            {(['literal', 'phonetic', 'mdc'] as RenderMode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={state.mode === m ? 'seg active' : 'seg'}
                onClick={() => onChange({ mode: m })}
              >
                {m === 'mdc' ? 'MdC' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </section>
      )}

      {(isCuneiform || isOP || isUG) && (
        <section className="control-group">
          <div className="group-head">
            <h3>Info</h3>
            <InfoIcon label="Cuneiform input">
              {isCuneiform && (
                <>
                  <strong>English mode</strong> tries logogram lookup (king -&gt; LUGAL) then falls back to CV/VC/CVC syllable splitting.<br /><br />
                  <strong>ATF mode</strong> triggers automatically if input contains <code>-</code>, <code>{'{'}</code>, <code>{'}'}</code>, or any uppercase.<br />
                  - Lowercase = syllabic (<code>lu-gal</code>).<br />
                  - UPPERCASE = logogram (<code>LUGAL</code>).<br />
                  - <code>{'{d}'}</code>, <code>{'{m}'}</code>, <code>{'{kur}'}</code> etc. = determinatives.<br />
                  - Example: <code>{'{d}'}en-lil2</code> for "the god Enlil".
                </>
              )}
              {isOP && (
                <>
                  Old Persian is CV-syllabic with ~36 signs. English is split into CV pairs. Ideograms like <code>AURAMAZDA</code>, <code>XSHAYATHIYA</code> (king) are supported. Use <code>-</code> or <code>.</code> to segment manually.
                </>
              )}
              {isUG && (
                <>
                  Ugaritic is an alphabet (abjad) with 30 consonantal signs. English letters map roughly; vowels are dropped in the traditional style. Use <code>-</code> in input to segment manually.
                </>
              )}
            </InfoIcon>
          </div>
          <div className="hint">
            {isCuneiform && 'Cuneiform: English or ATF auto-detected. Palette below.'}
            {isOP && 'Old Persian: English CV-splitter or dashed ATF.'}
            {isUG && 'Ugaritic: English letters map to consonantal signs.'}
          </div>
        </section>
      )}

      <section className="control-group">
        <label className={`switch ${!isCartoucheAllowed(state.scriptFamily) ? 'switch-disabled' : ''}`}>
          <input
            type="checkbox"
            checked={state.cartouche}
            disabled={!isCartoucheAllowed(state.scriptFamily)}
            onChange={(e) => {
              const next = e.target.checked;
              const newLimit = computeLimit(state.scriptFamily, state.mode, next);
              const clipped = state.inputText.slice(0, newLimit);
              onChange({ cartouche: next, inputText: clipped });
            }}
          />
          <span>
            Cartouche frame
            {!isCartoucheAllowed(state.scriptFamily) && (
              <span className="disabled-note"> (Egyptian only)</span>
            )}
          </span>
        </label>
        <label className="switch">
          <input
            type="checkbox"
            checked={state.showPipeline}
            onChange={(e) => onChange({ showPipeline: e.target.checked })}
          />
          <span>Show translation pipeline</span>
        </label>
      </section>

      <section className="control-group">
        <div className="group-head">
          <h3>Layout</h3>
          <InfoIcon label="About layout">
            {layoutHistoricalNote(state.scriptFamily)}
            <br /><br />
            Options greyed out for the current script are not historically
            attested and are disabled.
          </InfoIcon>
        </div>
        <select
          className="select"
          value={state.layout}
          onChange={(e) => onChange({ layout: e.target.value as LayoutDirection })}
        >
          {ALL_LAYOUTS.map((l) => {
            const ok = isLayoutAllowed(state.scriptFamily, l);
            return (
              <option key={l} value={l} disabled={!ok}>
                {layoutLabel(l)}{ok ? '' : ' (not attested)'}
              </option>
            );
          })}
        </select>
        {state.layout === 'archaic-sumerian' && (
          <div className="hint">
            Signs rotated 90 degrees counter-clockwise, columns top-to-bottom
            reading right-to-left. Approximates proto-cuneiform (Uruk period).
          </div>
        )}
      </section>

      {isFontSelectorAllowed(state.scriptFamily) && (
        <section className="control-group">
          <div className="group-head">
            <h3>Font</h3>
            <InfoIcon label="About fonts">
              The default font is bundled and works offline.<br />
              Additional fonts (Noto CDN, custom) can be loaded on demand.<br /><br />
              Cuneiform, Old Persian, and Ugaritic each use their own bundled Noto font; the font selector applies to hieroglyphs only.
            </InfoIcon>
          </div>
          <select
            className="select"
            value={fontDropdownValue}
            onChange={(e) => handleFontChange(e.target.value)}
          >
            {fonts.map((f) => (
              <option key={f.family + '|' + f.label} value={f.family + '|' + f.label}>
                {f.label}{f.loaded ? '' : ' (load on select)'}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowAddFont((v) => !v)}
          >
            {showAddFont ? 'Cancel' : '+ Add custom font'}
          </button>
          {showAddFont && (
            <div className="add-font">
              <input
                className="text-input"
                type="text"
                placeholder="Family name"
                value={newFontFamily}
                onChange={(e) => setNewFontFamily(e.target.value)}
              />
              <input
                className="text-input"
                type="url"
                placeholder="https://.../font.woff2"
                value={newFontUrl}
                onChange={(e) => setNewFontUrl(e.target.value)}
              />
              <button className="render-btn" onClick={handleAddFont}>Load font</button>
            </div>
          )}
          {fontStatus && <div className="font-status">{fontStatus}</div>}
        </section>
      )}

      <section className="control-group">
        <h3>Style</h3>
        <select
          className="select"
          value={state.preset}
          onChange={(e) => pickPreset(e.target.value)}
        >
          {PRESET_NAMES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
          <option value="Custom">Custom</option>
        </select>

        <label className="field">
          <span>Background</span>
          <input type="color" value={state.style.bgColor} onChange={(e) => setStyle({ bgColor: e.target.value })} />
        </label>
        <label className="field">
          <span>Text color</span>
          <input type="color" value={state.style.textColor} onChange={(e) => setStyle({ textColor: e.target.value })} />
        </label>
        <label className="field">
          <span>Size {state.style.fontSize}px</span>
          <input type="range" min={24} max={144} value={state.style.fontSize} onChange={(e) => setStyle({ fontSize: Number(e.target.value) })} />
        </label>
        <label className="field">
          <span>Spacing {state.style.letterSpacing}px</span>
          <input type="range" min={0} max={32} value={state.style.letterSpacing} onChange={(e) => setStyle({ letterSpacing: Number(e.target.value) })} />
        </label>
        <label className="field">
          <span>Padding {state.style.padding}px</span>
          <input type="range" min={8} max={96} value={state.style.padding} onChange={(e) => setStyle({ padding: Number(e.target.value) })} />
        </label>
        <label className="field">
          <span>Glow {state.style.shadowBlur}px</span>
          <input type="range" min={0} max={40} value={state.style.shadowBlur} onChange={(e) => setStyle({ shadowBlur: Number(e.target.value) })} />
        </label>
        <label className="field">
          <span>Glow color</span>
          <input type="color" value={state.style.shadowColor} onChange={(e) => setStyle({ shadowColor: e.target.value })} />
        </label>
        <label className="field">
          <span>Border {state.style.borderWidth}px</span>
          <input type="range" min={0} max={12} value={state.style.borderWidth} onChange={(e) => setStyle({ borderWidth: Number(e.target.value) })} />
        </label>
        <label className="field">
          <span>Border color</span>
          <input type="color" value={state.style.borderColor} onChange={(e) => setStyle({ borderColor: e.target.value })} />
        </label>
      </section>
    </aside>
  );
}

function computeLimit(family: ScriptFamily, mode: RenderMode, cartouche: boolean): number {
  const isCuneiform = ['sumerian', 'akkadian', 'hittite', 'elamite', 'old-persian', 'ugaritic'].includes(family);
  if (isCuneiform) {
    return cartouche ? CUNEIFORM_CARTOUCHE_LIMIT : CUNEIFORM_LIMIT;
  }
  if (mode === 'mdc') {
    return cartouche ? MDC_CARTOUCHE_LIMIT : MDC_LIMIT;
  }
  return cartouche ? CARTOUCHE_LIMIT : TEXT_LIMIT;
}
