import { useMemo, useState } from 'react';
import type { PipelineStep, RenderMode, ScriptFamily } from '../types';

interface Props {
  steps: PipelineStep[];
  scriptFamily: ScriptFamily;
  mode: RenderMode;
  inputText: string;
  fontFamily: string;
}

// Translation Pipeline panel. Shows how the input was decomposed into
// signs, one row per step. Roles are shown as colored badges so common
// categories (uniliteral, biliteral, triliteral, determinative, logogram,
// syllabic, etc.) stand out at a glance.
export default function PipelinePanel({ steps, scriptFamily, mode, inputText, fontFamily }: Props) {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const nonSpace = useMemo(() => steps.filter(s => s.role !== 'space' && s.role !== 'linebreak'), [steps]);

  const summary = describePipelineSummary(scriptFamily, mode, steps);

  return (
    <section className="pipeline-panel">
      <header className="pipeline-head">
        <div>
          <h3>Translation pipeline</h3>
          <div className="pipeline-sub">
            <code className="pipeline-input">{inputText}</code>
            <span className="pipeline-arrow">-&gt;</span>
            <span className="pipeline-count">{nonSpace.length} sign{nonSpace.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div className="pipeline-actions">
          <button type="button" className="link-btn" onClick={() => setExpanded(v => !v)}>
            {expanded ? 'compact' : 'detailed'}
          </button>
          <button type="button" className="link-btn" onClick={() => setOpen(v => !v)}>
            {open ? 'hide' : 'show'}
          </button>
        </div>
      </header>
      {open && (
        <>
          <div className="pipeline-desc">{summary}</div>
          {expanded ? (
            <div className="pipeline-table">
              <div className="pipeline-row pipeline-row-header">
                <div className="col-idx">#</div>
                <div className="col-input">Input</div>
                <div className="col-glyph">Glyph</div>
                <div className="col-role">Role</div>
                <div className="col-detail">Detail</div>
              </div>
              {steps.map((s, i) => (
                <div key={i} className={`pipeline-row role-${cssRole(s.role)}`}>
                  <div className="col-idx">{i + 1}</div>
                  <div className="col-input"><code>{displayInput(s.input)}</code></div>
                  <div className="col-glyph" style={{ fontFamily: `'${fontFamily}', serif` }}>{s.glyph || '-'}</div>
                  <div className="col-role"><span className={`role-badge role-${cssRole(s.role)}`}>{s.role}</span></div>
                  <div className="col-detail">{s.detail ?? ''}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pipeline-compact">
              {steps.map((s, i) => {
                if (s.role === 'space') return <span key={i} className="pipeline-word-gap"> </span>;
                if (s.role === 'linebreak') return <span key={i} className="pipeline-break">/</span>;
                return (
                  <span key={i} className={`pipeline-chip role-${cssRole(s.role)}`}>
                    <span className="chip-in"><code>{displayInput(s.input)}</code></span>
                    <span className="chip-arrow">-&gt;</span>
                    <span className="chip-glyph" style={{ fontFamily: `'${fontFamily}', serif` }}>{s.glyph || '?'}</span>
                  </span>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function displayInput(s: string): string {
  if (s === ' ') return 'space';
  if (s === '') return '(none)';
  return s;
}

function cssRole(r: string): string {
  return r.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

// One-line summary of what the pipeline did for the current context.
function describePipelineSummary(family: ScriptFamily, mode: RenderMode, steps: PipelineStep[]): string {
  const roleCounts: Record<string, number> = {};
  for (const s of steps) {
    if (s.role === 'space' || s.role === 'linebreak') continue;
    roleCounts[s.role] = (roleCounts[s.role] ?? 0) + 1;
  }
  const parts = Object.entries(roleCounts).map(([k, v]) => `${v} ${k}`).sort();
  if (family === 'hieroglyphs') {
    if (mode === 'literal') return 'Literal: one uniliteral proxy per English letter. ' + parts.join(', ');
    if (mode === 'phonetic') return 'Phonetic: digraphs matched before single letters. ' + parts.join(', ');
    return 'MdC: English -> transliteration -> greedy tri/bi/uni matcher, determinatives appended per word. ' + parts.join(', ');
  }
  if (family === 'old-persian') {
    return 'Old Persian: CV syllabic splitter (or dashed ATF if operators present). ' + parts.join(', ');
  }
  if (family === 'ugaritic') {
    return 'Ugaritic: consonantal mapping (abjad, vowels dropped). ' + parts.join(', ');
  }
  return 'Cuneiform: logogram dictionary + CV/VC/CVC syllabic splitter, or ATF if operators present. ' + parts.join(', ');
}
