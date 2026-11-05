import React from 'react';
import { Img, staticFile } from 'remotion';
import { COLORS } from '../config';
import { State } from './UIWindow';

/** Smartphone affichant de vraies captures mobiles (390×844). */
export const PhoneFrame: React.FC<{ f: number; states: State[]; width?: number; tap?: { f: number; x: number; y: number }[]; fade?: number; style?: React.CSSProperties }> = ({ f, states, width = 390, tap = [], fade = 8, style }) => {
  const s = width / 390;
  const H = 844 * s;
  return (
    <div style={{ width: width + 28, height: H + 28, borderRadius: 64, background: '#0b0b0d', padding: 14, boxShadow: '0 60px 110px rgba(0,0,0,.55), inset 0 0 0 2px #2a2a30', position: 'relative', ...style }}>
      <div style={{ position: 'relative', width, height: H, borderRadius: 50, overflow: 'hidden', background: '#fff' }}>
        {states.map((st, i) => {
          const o = i === 0 ? 1 : Math.min(1, Math.max(0, (f - st.at) / fade));
          return o <= 0 ? null : <Img key={st.src + i} src={staticFile(`captures/${st.src}.png`)} style={{ position: 'absolute', inset: 0, width, height: H, opacity: o }} />;
        })}
        {tap.map((t, i) => {
          const d = f - t.f; if (d < 0 || d > 18) return null;
          const r = 14 + d * 3.4;
          return <div key={i} style={{ position: 'absolute', left: t.x * s - r, top: t.y * s - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'rgba(225,29,42,.35)', border: `3px solid ${COLORS.primary}`, opacity: 1 - d / 18 }} />;
        })}
      </div>
      <div style={{ position: 'absolute', top: 24, left: '50%', width: 110, height: 28, marginLeft: -55, borderRadius: 16, background: '#000' }} />
    </div>
  );
};
