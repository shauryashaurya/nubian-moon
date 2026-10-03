import { useState, useMemo } from 'react';
import type { ScriptFamily } from '../types';
import { PALETTE as HIERO_PALETTE, gardinerToUnicode } from '../lib/mdcSigns';
import { PALETTE as CUNEI_PALETTE } from '../lib/cuneiformSigns';
import { OP_PALETTE } from '../lib/oldPersianSigns';
import { UG_PALETTE } from '../lib/ugariticSigns';

interface Props {
  scriptFamily: ScriptFamily;
  onInsert: (code: string) => void;
}

interface UniversalEntry {
  key: string;
  glyph: string;
  label: string;
  fontFamily: string;
}

function paletteFor(family: ScriptFamily): Record<string, UniversalEntry[]> {
  if (family === 'hieroglyphs') {
    const out: Record<string, UniversalEntry[]> = {};
    for (const cat of Object.keys(HIERO_PALETTE)) {
      out[cat] = HIERO_PALETTE[cat].map(e => ({
        key: e.code,
        glyph: gardinerToUnicode(e.code) || '?',
        label: `${e.value} (${e.code})`,
        fontFamily: 'Noto Sans Egyptian Hieroglyphs',
      }));
    }
    return out;
  }
  if (family === 'old-persian') {
    const out: Record<string, UniversalEntry[]> = {};
    for (const cat of Object.keys(OP_PALETTE)) {
      out[cat] = OP_PALETTE[cat].map(e => ({
        key: e.key,
        glyph: e.glyph,
        label: e.label,
        fontFamily: 'Noto Sans Old Persian',
      }));
    }
    return out;
  }
  if (family === 'ugaritic') {
    const out: Record<string, UniversalEntry[]> = {};
    for (const cat of Object.keys(UG_PALETTE)) {
      out[cat] = UG_PALETTE[cat].map(e => ({
        key: e.key,
        glyph: e.glyph,
        label: e.label,
        fontFamily: 'Noto Sans Ugaritic',
      }));
    }
    return out;
  }
  const out: Record<string, UniversalEntry[]> = {};
  for (const cat of Object.keys(CUNEI_PALETTE)) {
    out[cat] = CUNEI_PALETTE[cat].map(e => ({
      key: e.key,
      glyph: e.glyph,
      label: e.label,
      fontFamily: 'Noto Sans Cuneiform',
    }));
  }
  return out;
}

export default function SignPalette({ scriptFamily, onInsert }: Props) {
  const [open, setOpen] = useState(true);
  const palette = useMemo(() => paletteFor(scriptFamily), [scriptFamily]);
  const categories = Object.keys(palette);
  const totalSigns = useMemo(
    () => categories.reduce((sum, c) => sum + palette[c].length, 0),
    [categories, palette]
  );

  const help = renderHelp(scriptFamily);

  return (
    <section className="control-group">
      <div className="group-head">
        <h3>Sign palette <span className="palette-count">({totalSigns} signs)</span></h3>
        <button type="button" className="link-btn" onClick={() => setOpen(v => !v)}>
          {open ? 'hide' : 'show'}
        </button>
      </div>
      {open && (
        <>
          <div className="palette-help">{help}</div>
          <div className="palette-scroll">
            {categories.map((cat) => (
              <Category
                key={cat}
                name={cat}
                entries={palette[cat]}
                onInsert={onInsert}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function renderHelp(family: ScriptFamily): React.ReactNode {
  if (family === 'hieroglyphs') {
    return (
      <>
        <p>Click any sign to insert its Gardiner code (<code>&lt;N35&gt;</code>) at the caret. Works in all three modes: literal, phonetic, and MdC.</p>
        <p>MdC-only operators: <code>-</code> sequence, <code>:</code> stack, <code>*</code> side by side, <code>!</code> line break; <code>|</code> splits syllables.</p>
      </>
    );
  }
  if (family === 'old-persian') {
    return (
      <>
        <p>Click a sign to insert its ATF value. Signs are CV syllabic (<code>da</code>, <code>ra</code>).</p>
        <p>Use <code>-</code> in input to segment manually. Ideograms like <code>AURAMAZDA</code> are single signs.</p>
      </>
    );
  }
  if (family === 'ugaritic') {
    return (
      <>
        <p>Click a letter to insert its ATF value. Ugaritic is an abjad (consonants only).</p>
        <p>Use <code>-</code> to segment manually. Multi-char letter keys like <code>sh</code>, <code>th</code> insert one sign.</p>
      </>
    );
  }
  return (
    <>
      <p>Click any sign to insert its ATF token. Lowercase = syllabic (<code>lu-gal</code>). UPPERCASE = logogram (<code>LUGAL</code>). <code>{'{d}'}</code> = determinative.</p>
      <p>ATF activates when the input contains <code>-</code>, <code>{'{'}{'}'}</code>, or uppercase. Otherwise the English mode splits into syllables.</p>
    </>
  );
}

function Category({
  name,
  entries,
  onInsert,
}: {
  name: string;
  entries: UniversalEntry[];
  onInsert: (code: string) => void;
}) {
  return (
    <details className="palette-cat" open>
      <summary>{name} <span className="palette-count">({entries.length})</span></summary>
      <div className="palette-grid">
        {entries.map((e) => (
          <button
            key={e.key + '|' + e.label}
            type="button"
            className="palette-sign"
            onClick={() => onInsert(e.key)}
            title={e.label}
          >
            <span className="palette-glyph" style={{ fontFamily: `'${e.fontFamily}', serif` }}>{e.glyph}</span>
            <span className="palette-label">{e.key}</span>
          </button>
        ))}
      </div>
    </details>
  );
}
