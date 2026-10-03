import { type CSSProperties, type Ref } from 'react';
import type { LayoutDirection, RenderMode, ScriptFamily, StyleConfig } from '../types';
import type { Group, Quadrat } from '../lib/mdc';
import type { CuneiformToken } from '../lib/cuneiform';

// React 19 accepts `ref` as a plain prop. forwardRef is deprecated.
interface Props {
  scriptFamily: ScriptFamily;
  mode: RenderMode;
  text: string;
  groups: Group[];
  cuneiTokens: CuneiformToken[];
  cartouche: boolean;
  layout: LayoutDirection;
  style: StyleConfig;
  ref?: Ref<HTMLDivElement>;
}

function layoutToCss(layout: LayoutDirection): CSSProperties {
  switch (layout) {
    case 'horizontal-ltr':
      return { writingMode: 'horizontal-tb', direction: 'ltr' };
    case 'horizontal-rtl':
      return { writingMode: 'horizontal-tb', direction: 'rtl' };
    case 'vertical-rl':
      return { writingMode: 'vertical-rl' };
    case 'vertical-lr':
      return { writingMode: 'vertical-lr' };
    case 'archaic-sumerian':
      return { writingMode: 'vertical-rl' };
  }
}

function Cartouche({
  vertical,
  color,
  strokeWidth,
  children,
}: {
  vertical: boolean;
  color: string;
  strokeWidth: number;
  children: React.ReactNode;
}) {
  const sw = Math.max(2, strokeWidth);
  return (
    <div className={`cartouche-wrap ${vertical ? 'vertical' : 'horizontal'}`}>
      <div
        className="cartouche-inner"
        style={{ borderColor: color, borderWidth: sw, borderStyle: 'solid' }}
      >
        {children}
      </div>
      <span
        className="cartouche-tie"
        style={{ background: color, ['--tie-thickness' as string]: `${sw}px` }}
      />
    </div>
  );
}

function QuadratView({
  quadrat,
  fontSize,
}: {
  quadrat: Quadrat;
  fontSize: number;
}) {
  const { cells, arrangement } = quadrat;
  if (cells.length === 0) return null;
  if (cells.length === 1) {
    return <span className="quadrat">{cells[0].sign}</span>;
  }
  if (arrangement === 'row') {
    return (
      <span className="quadrat quadrat-row" style={{ fontSize: fontSize * 0.75, lineHeight: 1 }}>
        {cells.map((c, i) => <span key={i} className="quadrat-cell">{c.sign}</span>)}
      </span>
    );
  }
  if (arrangement === 'column') {
    return (
      <span className="quadrat quadrat-col" style={{ fontSize: fontSize * 0.6, lineHeight: 1 }}>
        {cells.map((c, i) => <span key={i} className="quadrat-cell">{c.sign}</span>)}
      </span>
    );
  }
  if (arrangement === 'grid') {
    const padded = cells.length === 3 ? [...cells, { sign: '' }] : cells.slice(0, 4);
    return (
      <span className="quadrat quadrat-grid" style={{ fontSize: fontSize * 0.6, lineHeight: 1 }}>
        {padded.map((c, i) => <span key={i} className="quadrat-cell">{c.sign}</span>)}
      </span>
    );
  }
  if (cells.length === 2) {
    return (
      <span className="quadrat quadrat-row" style={{ fontSize: fontSize * 0.75, lineHeight: 1 }}>
        {cells.map((c, i) => <span key={i} className="quadrat-cell">{c.sign}</span>)}
      </span>
    );
  }
  const padded = cells.length === 3 ? [cells[0], cells[1], cells[2], { sign: '' }] : cells.slice(0, 4);
  return (
    <span className="quadrat quadrat-grid" style={{ fontSize: fontSize * 0.6, lineHeight: 1 }}>
      {padded.map((c, i) => <span key={i} className="quadrat-cell">{c.sign}</span>)}
    </span>
  );
}

export default function RenderPanel({
  scriptFamily,
  mode,
  text,
  groups,
  cuneiTokens,
  cartouche,
  layout,
  style,
  ref,
}: Props) {
  const isVertical = layout.startsWith('vertical') || layout === 'archaic-sumerian';
  const isArchaic = layout === 'archaic-sumerian';
  const isHiero = scriptFamily === 'hieroglyphs';
  const isCuneiform = ['sumerian', 'akkadian', 'hittite', 'elamite'].includes(scriptFamily);

  const hasContent = isHiero
    ? (mode === 'mdc' ? groups.length > 0 : text.length > 0)
    : isCuneiform
      ? cuneiTokens.length > 0
      : text.length > 0;

  const panelStyle: CSSProperties = {
    background: style.bgColor,
    padding: style.padding,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderStyle: 'solid',
  };

  const textStyle: CSSProperties = {
    color: style.textColor,
    fontSize: style.fontSize,
    letterSpacing: style.letterSpacing,
    fontFamily: `'${style.fontFamily}', serif`,
    textShadow: `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`,
    ...layoutToCss(layout),
  };

  let body: React.ReactNode;
  if (!hasContent) {
    body = (
      <div className="glyph-empty" style={{ color: style.textColor, opacity: 0.4 }}>
        Type something and press Render
      </div>
    );
  } else if (isHiero && mode === 'mdc') {
    body = (
      <div className="glyph-text glyph-mdc" style={textStyle}>
        {groups.map((g, i) => {
          if (g.type === 'space') return <span key={i} className="word-gap"> </span>;
          if (g.type === 'linebreak') return <br key={i} />;
          return <QuadratView key={i} quadrat={g.quadrat} fontSize={style.fontSize} />;
        })}
      </div>
    );
  } else if (isCuneiform) {
    body = (
      <div className={`glyph-text glyph-cunei${isArchaic ? ' glyph-archaic' : ''}`} style={textStyle}>
        {cuneiTokens.map((t, i) => {
          if (t.kind === 'space') {
            return <span key={i} className={`word-gap${isArchaic ? ' word-gap-archaic' : ''}`}> </span>;
          }
          const baseClass = t.kind === 'det' ? 'cunei-det' : 'cunei-sign';
          const className = isArchaic ? `${baseClass} archaic-glyph` : baseClass;
          return <span key={i} className={className}>{t.glyph}</span>;
        })}
      </div>
    );
  } else {
    body = <div className="glyph-text" style={textStyle}>{text}</div>;
  }

  return (
    <div className="render-panel" ref={ref} style={panelStyle}>
      {cartouche && hasContent ? (
        <Cartouche vertical={isVertical} color={style.textColor} strokeWidth={Math.max(3, style.borderWidth + 2)}>
          {body}
        </Cartouche>
      ) : (
        body
      )}
    </div>
  );
}
