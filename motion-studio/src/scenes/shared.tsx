import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, FONT, WIDTH } from '../config';
import { Kicker, Rise } from '../components/Text';
import { E, prog } from '../lib/motion';

/** Gabarit commun : kicker + titre + note en haut à gauche, contenu en bas. Sortie douce sur les 12 dernières images. */
export const ShowcaseFrame: React.FC<{ f: number; dur: number; kicker: string; title: string; note?: string; children: React.ReactNode }> = ({ f, dur, kicker, title, note, children }) => {
  const exit = prog(f, dur - 12, dur - 1, E.inOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-exit * 40}px)` }}>
      <div style={{ position: 'absolute', left: 200, top: 26 }}><Kicker f={f} at={2}>{kicker}</Kicker></div>
      <div style={{ position: 'absolute', left: 200, top: 62 }}><Rise f={f} at={6} size={60}>{title}</Rise></div>
      {note && (
        <div style={{ position: 'absolute', left: 202, top: 132, fontFamily: FONT, fontSize: 26, fontWeight: 500, color: 'rgba(255,255,255,.75)', opacity: prog(f, 16, 32), transform: `translateY(${(1 - prog(f, 16, 32)) * 14}px)` }}>{note}</div>
      )}
      <div style={{ position: 'absolute', left: (WIDTH - 1520) / 2, top: 170, opacity: prog(f, 0, 14), transform: `translateY(${(1 - prog(f, 0, 24, E.out)) * 80}px)` }}>{children}</div>
      <div style={{ position: 'absolute', right: 200, top: 40, width: 12, height: 12, borderRadius: 6, background: COLORS.primary }} />
    </AbsoluteFill>
  );
};
