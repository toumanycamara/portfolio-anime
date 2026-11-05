import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONT } from '../config';
import { Kicker, Rise } from '../components/Text';
import { E, prog } from '../lib/motion';

/** Gabarit commun : kicker + titre + note en haut à gauche, contenu en bas. Sortie douce sur les 12 dernières images. */
export const ShowcaseFrame: React.FC<{ f: number; dur: number; kicker: string; title: string; note?: string; children: React.ReactNode }> = ({ f, dur, kicker, title, note, children }) => {
  const exit = prog(f, dur - 12, dur - 1, E.inOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 40}px)` }}>
      <div style={{ position: 'absolute', left: 110, top: 62 }}><Kicker f={f} at={2}>{kicker}</Kicker></div>
      <div style={{ position: 'absolute', left: 110, top: 112 }}><Rise f={f} at={6} size={74}>{title}</Rise></div>
      {note && (
        <div style={{ position: 'absolute', left: 112, top: 208, fontFamily: FONT, fontSize: 30, fontWeight: 500, color: 'rgba(255,255,255,.75)', opacity: prog(f, 16, 32), transform: `translateY(${(1 - prog(f, 16, 32)) * 14}px)` }}>{note}</div>
      )}
      <div style={{ position: 'absolute', left: 300, top: 262, opacity: prog(f, 0, 14), transform: `translateY(${(1 - prog(f, 0, 24, E.out)) * 80}px)` }}>{children}</div>
      <div style={{ position: 'absolute', right: 110, top: 74, width: 12, height: 12, borderRadius: 6, background: COLORS.primary }} />
    </AbsoluteFill>
  );
};
