import React from 'react';
import { COLORS, FONT } from '../config';
import { E, prog } from '../lib/motion';

/** Ligne de typographie cinétique : monte depuis un masque, sort vers le haut. */
export const Rise: React.FC<{
  f: number; at: number; exit?: number; children: React.ReactNode; size?: number; color?: string; weight?: number;
  align?: 'left' | 'center'; spacing?: string; style?: React.CSSProperties; dur?: number;
}> = ({ f, at, exit, children, size = 120, color = '#fff', weight = 800, align = 'left', spacing = '-0.035em', style, dur = 18 }) => {
  const p = prog(f, at, at + dur, E.out);
  const q = exit !== undefined ? prog(f, exit, exit + 14, E.inOut) : 0;
  const y = (1 - p) * 112 - q * 112;
  return (
    <div style={{ overflow: 'hidden', paddingBottom: size * 0.12, marginBottom: -size * 0.12, textAlign: align, ...style }}>
      <div style={{ transform: `translateY(${y}%)`, fontFamily: FONT, fontSize: size, fontWeight: weight, color, letterSpacing: spacing, lineHeight: 1.04, whiteSpace: 'pre' }}>{children}</div>
    </div>
  );
};

export const Kicker: React.FC<{ f: number; at: number; children: React.ReactNode; color?: string }> = ({ f, at, children, color = COLORS.primary }) => {
  const p = prog(f, at, at + 14);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: p, transform: `translateX(${(1 - p) * -24}px)`, fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: '0.32em', textTransform: 'uppercase', color }}>
      <span style={{ width: 52 * p, height: 4, background: color, borderRadius: 2 }} />
      {children}
    </div>
  );
};

/** Pastille d'information qui apparaît avec un léger rebond. */
export const Chip: React.FC<{ f: number; at: number; children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ f, at, children, dark, style }) => {
  const p = prog(f, at, at + 16, E.back);
  return (
    <div style={{ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + p * 0.1})`, background: dark ? COLORS.ink : '#fff', color: dark ? '#fff' : COLORS.ink, fontFamily: FONT, fontWeight: 700, fontSize: 30, padding: '16px 28px', borderRadius: 18, boxShadow: '0 22px 50px rgba(0,0,0,.35)', display: 'inline-flex', alignItems: 'center', gap: 14, ...style }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: COLORS.primary, boxShadow: '0 0 0 6px rgba(225,29,42,.2)' }} />
      {children}
    </div>
  );
};
