import { useState, type ChangeEvent } from 'react';
import type { AppState, FontOption, LayoutDirection, RenderMode, StyleConfig } from '../types';
import { PRESETS, PRESET_NAMES } from '../lib/presets';
import InfoIcon from './InfoIcon';

const TEXT_LIMIT = 50;
const CARTOUCHE_LIMIT = 24;

interface Props {
  state: AppState;
  onChange: (next: Partial<AppState>) => void;
  onRender: () => void;
  fonts: FontOption[];
  onSelectFont: (family: string) => void;
  onLoadFont: (font: FontOption) => Promise<void>;
  onAddCustomFont: (family: string, url: string) => Promise<void>;
}

export default function Controls({
  state,
  onChange,
  onRender,
  fonts,
  onSelectFont,
  onLoadFont,
  onAddCustomFont,
}: Props) {
  const limit = state.cartouche ? CARTOUCHE_LIMIT : TEXT_LIMIT;
  const remaining = limit - state.inputText.length;

  const [showAddFont, setShowAddFont] = useState(false);
  const [newFontFamily, setNewFontFamily] = useState('');
  const [newFontUrl, setNewFontUrl] = useState('');
  const [fontStatus, setFontStatus] = useState<string>('');

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

  // Composite value so duplicate families with different sources stay distinct.
  const fontDropdownValue = (() => {
    const match = fonts.find((f) => f.family === state.style.fontFamily && f.loaded);
    return match ? match.family + '|' + match.label : '';
  })();

  return (
    <aside className="controls">
      <section className="control-group">
        <h3>Text</h3>
        <textarea
          className="text-input"
          value={state.inputText}
          onChange={onInput}
          maxLength={limit}
          placeholder="Type a name or short phrase..."
          rows={3}
        />
        <div className="counter">
          {state.inputText.length}/{limit} {remaining < 10 ? '(near limit)' : ''}
        </div>
        <button className="render-btn" onClick={onRender} disabled={!state.inputText.trim()}>
          Hieroglyphize
        </button>
      </section>

      <section className="control-group">
        <div className="group-head">
          <h3>Mode</h3>
          <InfoIcon label="About modes">
            <strong>Literal</strong>: each English letter maps to one hieroglyph (a hieroglyphic alphabet game).<br />
            <strong>Phonetic</strong>: digraphs like SH, KH, TH are detected before single letters.<br />
            <strong>MdC</strong>: a Manuel de Codage inspired pipeline that runs English &gt; Egyptological transliteration &gt; Gardiner sign codes &gt; Unicode hieroglyphs. Egyptian had no /l/ sound, so 'l' is rendered as 'r'.<br /><br />
            In MdC mode you can break a word into syllables with the pipe character. Example: <code>cle|o|pat|ra</code>. Each pipe-separated chunk becomes one visually grouped quadrat.
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
        <label className="switch">
          <input
            type="checkbox"
            checked={state.cartouche}
            onChange={(e) => {
              const next = e.target.checked;
              const clipped = next ? state.inputText.slice(0, CARTOUCHE_LIMIT) : state.inputText;
              onChange({ cartouche: next, inputText: clipped });
            }}
          />
          <span>Cartouche (max {CARTOUCHE_LIMIT} chars)</span>
        </label>
      </section>

      <section className="control-group">
        <h3>Layout</h3>
        <select
          className="select"
          value={state.layout}
          onChange={(e) => onChange({ layout: e.target.value as LayoutDirection })}
        >
          <option value="horizontal-ltr">Horizontal, left to right</option>
          <option value="horizontal-rtl">Horizontal, right to left</option>
          <option value="vertical-rl">Vertical columns, right to left</option>
          <option value="vertical-lr">Vertical columns, left to right</option>
        </select>
      </section>

      <section className="control-group">
        <div className="group-head">
          <h3>Font</h3>
          <InfoIcon label="About fonts">
            The default font is bundled with the app and works offline.<br />
            Additional fonts are loaded from the network on demand.<br /><br />
            To add your own: pick "Add custom font", give it a family name (anything), and paste a URL to a font file (.woff2, .woff, .ttf, .otf).<br /><br />
            Open hieroglyph fonts you can try: search for <em>Aegyptus</em> or <em>NewGardiner</em> and use a direct file URL.
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
          <input
            type="color"
            value={state.style.bgColor}
            onChange={(e) => setStyle({ bgColor: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Text color</span>
          <input
            type="color"
            value={state.style.textColor}
            onChange={(e) => setStyle({ textColor: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Size {state.style.fontSize}px</span>
          <input
            type="range"
            min={24}
            max={144}
            value={state.style.fontSize}
            onChange={(e) => setStyle({ fontSize: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Spacing {state.style.letterSpacing}px</span>
          <input
            type="range"
            min={0}
            max={32}
            value={state.style.letterSpacing}
            onChange={(e) => setStyle({ letterSpacing: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Padding {state.style.padding}px</span>
          <input
            type="range"
            min={8}
            max={96}
            value={state.style.padding}
            onChange={(e) => setStyle({ padding: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Glow {state.style.shadowBlur}px</span>
          <input
            type="range"
            min={0}
            max={40}
            value={state.style.shadowBlur}
            onChange={(e) => setStyle({ shadowBlur: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Glow color</span>
          <input
            type="color"
            value={state.style.shadowColor}
            onChange={(e) => setStyle({ shadowColor: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Border {state.style.borderWidth}px</span>
          <input
            type="range"
            min={0}
            max={12}
            value={state.style.borderWidth}
            onChange={(e) => setStyle({ borderWidth: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Border color</span>
          <input
            type="color"
            value={state.style.borderColor}
            onChange={(e) => setStyle({ borderColor: e.target.value })}
          />
        </label>
      </section>
    </aside>
  );
}