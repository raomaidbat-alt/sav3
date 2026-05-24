/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakSlider, TweakColor */
const { useState, useEffect, useMemo, useRef } = React;

// ---- Tweak defaults (persisted on disk via host) ----
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showTags": true,
  "compactRows": false,
  "palette": "paper",
  "bodySize": 15
} /*EDITMODE-END*/;

const PALETTES = {
  cream: { bg: '#F2F1D3', ink: '#671612', muted: '#671612aa', faint: '#67161233', accent: '#101C18', soft: '#AFAD7D' },
  paper: { bg: '#F8F4E8', ink: '#101C18', muted: '#101C18aa', faint: '#101C1822', accent: '#671612', soft: '#AFAD7D' },
  dark: { bg: '#101C18', ink: '#F2F1D3', muted: '#F2F1D3bb', faint: '#F2F1D344', accent: '#AFAD7D', soft: '#671612' }
};

// ---- Helpers ----
const fmtPrice = (v) => {
  if (v == null || v === '' || v === undefined) return '';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  // round nicely; if has fractional small show one decimal
  if (Math.abs(n - Math.round(n)) < 0.5) return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
  return n.toFixed(1).replace('.', ',');
};

// Make letter-spaced display like "B U L L E S" — used in section heads
const spaceOut = (s) => s.toUpperCase().split('').join(' ');

// ---- Brand mark ----
function BrandMark({ color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div style={{
        fontFamily: '"Caveat", "Molli Writes", cursive',
        fontSize: 64,
        lineHeight: 1,
        color,
        letterSpacing: '-0.01em',
        display: 'flex', alignItems: 'center', gap: 14
      }}>
        <span></span>
        <ChickenMark color={color} size={48} />
        <span></span>
      </div>
    </div>);

}

function ChickenMark({ color, size = 48 }) {
  // Simple minimal chicken silhouette as placeholder for actual logo file
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* sparkle dots */}
      <circle cx="14" cy="10" r="0.9" fill={color} />
      <circle cx="19" cy="6" r="1.2" fill={color} />
      <circle cx="25" cy="11" r="0.8" fill={color} />
      <circle cx="22" cy="15" r="0.6" fill={color} />
      {/* body */}
      <path d="M18 30 C 14 26, 14 22, 19 21 C 24 19, 30 22, 32 26 L 46 26 C 50 26, 52 28, 50 31 L 42 36 C 40 40, 36 42, 32 42 L 30 46 L 34 50 L 26 50 L 27 44 L 22 44 L 23 50 L 16 50 L 18 42 C 14 40, 14 34, 18 30 Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* beak */}
      <path d="M32 24 L 36 22 L 33 26 Z" fill={color} />
      {/* eye */}
      <circle cx="29" cy="25" r="0.9" fill={color} />
      {/* comb */}
      <path d="M27 19 C 28 17, 30 17, 30 19" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>);

}

// ---- Rule (the dotted leader between name and price) ----
function Leader({ style, kind }) {
  if (kind === 'none') return <span style={{ flex: 1 }} />;
  return (
    <span aria-hidden style={{
      flex: 1,
      alignSelf: 'end',
      marginBottom: 6,
      marginLeft: 10,
      marginRight: 10,
      borderBottom: kind === 'solid' ? `1px solid ${style.faint}` : `1px dotted ${style.faint}`,
      height: 1,
      minWidth: 20
    }} />);

}

// ---- Wine row ----
function WineRow({ w, p, tweaks }) {
  const { showTags, compactRows, bodySize } = tweaks;
  const rowPad = compactRows ? '6px 0' : '11px 0';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '64px minmax(0, 1fr) 110px',
      gap: 24,
      alignItems: 'baseline',
      padding: rowPad,
      borderTop: `0.5px solid ${p.faint}`,
      fontFamily: '"Cousine", "Courier New", monospace',
      fontSize: bodySize,
      lineHeight: 1.4,
      color: p.ink
    }}>
      {/* year */}
      <div style={{ color: p.muted, fontVariantNumeric: 'tabular-nums' }}>{w.year || ''}</div>

      {/* name + producer (stacked) */}
      <div style={{ minWidth: 0 }}>
        <div style={{ whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {w.name}
          {showTags && [w.tag, w.tag2].filter(Boolean).map((t, i) => {
            const isFormat = /demi|magnum|jeroboam|bottles|коравин|0,375|3l/i.test(t);
            return (
              <span key={i} style={{
                marginLeft: 8, padding: '1px 6px',
                fontSize: bodySize - 3,
                border: `0.5px solid ${isFormat ? p.accent : p.soft}`,
                color: isFormat ? p.accent : p.soft,
                borderRadius: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                verticalAlign: 'middle',
                whiteSpace: 'nowrap'
              }}>{t}</span>
            );
          })}
        </div>
        <div style={{ color: p.muted, fontSize: bodySize - 1, marginTop: 2 }}>
          {w.producer}
        </div>
      </div>

      {/* sale price */}
      <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
        {fmtPrice(w.priceBokal)}
      </div>
    </div>);

}

// ---- Column header ----
function ColumnHeader({ p, tweaks, priceLabel }) {
  const { bodySize } = tweaks;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '64px minmax(0, 1fr) 110px',
      gap: 24,
      padding: '6px 0 8px',
      fontFamily: '"Cousine", monospace',
      fontSize: bodySize - 3,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: p.muted
    }}>
      <div>Год</div>
      <div>Наименование / Производитель</div>
      <div style={{ textAlign: 'right' }}>{priceLabel} ₽</div>
    </div>);

}

// ---- Subsection ----
function SubSection({ sub, p, tweaks }) {
  if (!sub.wines.length) return null;
  const hasName = !!sub.name;
  return (
    <div style={{ marginTop: hasName ? 42 : 24 }}>
      {hasName &&
      <div style={{
        fontFamily: '"Viaoda Libre", serif',
        fontStyle: 'italic',
        fontSize: 22,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: p.ink,
        marginBottom: 4
      }}>
          {spaceOut(sub.name)}
        </div>
      }
      <div>
        {sub.wines.map((w, i) => <WineRow key={i} w={w} p={p} tweaks={tweaks} />)}
      </div>
    </div>);

}

// ---- Top-level section ----
function TopSection({ section, p, tweaks, idx }) {
  return (
    <section data-screen-label={`${String(idx + 1).padStart(2, '0')} ${section.name}`} style={{ marginTop: idx === 0 ? 0 : 92, breakInside: 'avoid' }}>
      {/* Big section title */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        borderBottom: `1px solid ${p.ink}`,
        paddingBottom: 14,
        marginBottom: 18
      }}>
        <div style={{
          fontFamily: '"Viaoda Libre", serif',
          fontStyle: 'italic',
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: '0.05em',
          color: p.ink
        }}>{section.name}</div>
        <div style={{
          fontFamily: '"Cousine", monospace',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: p.muted
        }}>
          {section.subs.reduce((a, s) => a + s.wines.length, 0)} позиций
        </div>
      </div>
      <ColumnHeader p={p} tweaks={tweaks} priceLabel={section.name === 'By the glass' ? 'Бокал' : 'Бутылка'} />
      {section.subs.map((sub, i) => <SubSection key={i} sub={sub} p={p} tweaks={tweaks} />)}
    </section>);

}

// ---- Hero / cover ----
function Cover({ p }) {
  return (
    <header data-screen-label="00 Обложка" style={{
      paddingTop: 80,
      paddingBottom: 80,
      borderBottom: `1px solid ${p.ink}`,
      textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30
    }}>
      <div style={{
        fontFamily: '"Cousine", monospace',
        fontSize: 11,
        letterSpacing: '0.36em',
        textTransform: 'uppercase',
        color: p.muted
      }}>cheers chicken · est. — · moscow</div>

      <BrandMark color={p.ink} />

      <div style={{
        fontFamily: '"Viaoda Libre", serif',
        fontStyle: 'italic',
        fontSize: 96,
        lineHeight: 1,
        letterSpacing: '0.22em',
        color: p.ink,
        marginTop: 10
      }}>{spaceOut('Винная карта')}</div>

      <div style={{
        fontFamily: '"Cousine", monospace',
        fontSize: 12,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: p.muted,
        maxWidth: 480, lineHeight: 1.7,
        marginTop: 8
      }}>
        курица и шампанское · france · germany · austria · italy · spain · russia · &amp; more
      </div>

      <div style={{
        fontFamily: '"Cousine", monospace',
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: p.muted,
        marginTop: 30
      }}>
        Vol. 01 / 2026
      </div>
    </header>);

}

// ---- Footer ----
function Footer({ p }) {
  return (
    <footer style={{
      marginTop: 100, paddingTop: 40, paddingBottom: 60,
      borderTop: `1px solid ${p.ink}`,
      display: 'flex', justifyContent: 'space-between',
      fontFamily: '"Cousine", monospace',
      fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: p.muted
    }}>
      <span>cheers chicken</span>
      <span>винная карта · vol. 01 · 2026</span>
      <span>цены указаны в ₽</span>
    </footer>);

}

// ---- App ----
function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  const p = PALETTES[t.palette] || PALETTES.cream;
  const data = window.WINE_DATA;

  // Apply background on body
  useEffect(() => {
    document.body.style.background = p.bg;
    document.body.style.color = p.ink;
  }, [p]);

  return (
    <div style={{
      maxWidth: 980,
      margin: '0 auto',
      padding: '0 60px 80px',
      background: p.bg,
      color: p.ink,
      minHeight: '100vh'
    }}>
      <Cover p={p} />
      <main>
        {data.map((s, i) =>
        <TopSection key={i} section={s} p={p} tweaks={t} idx={i} />
        )}
      </main>
      <Footer p={p} />

      <TweaksPanel title="Tweaks · Винная карта">
        <TweakSection label="Отображение" />
        <TweakToggle label="Теги (Cidre / Rose / Magnum)" value={t.showTags} onChange={(v) => setT('showTags', v)} />
        <TweakSection label="Плотность" />
        <TweakToggle label="Компактные строки" value={t.compactRows} onChange={(v) => setT('compactRows', v)} />
        <TweakSlider label="Размер тела" min={11} max={16} step={1} value={t.bodySize} unit="px" onChange={(v) => setT('bodySize', v)} />
        <TweakSection label="Палитра" />
        <TweakRadio
          label="Тема"
          value={t.palette}
          onChange={(v) => setT('palette', v)}
          options={[
          { label: 'Cream', value: 'cream' },
          { label: 'Paper', value: 'paper' },
          { label: 'Dark', value: 'dark' }]
          } />
        
      </TweaksPanel>
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);