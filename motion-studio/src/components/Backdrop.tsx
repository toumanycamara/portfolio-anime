import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, WIDTH, HEIGHT } from '../config';

/** Fond animé : encre + halo rouge qui dérive + grille discrète. */
export const Backdrop: React.FC<{ variant?: 'dark' | 'light' | 'red'; glow?: number }> = ({ variant = 'dark', glow = 1 }) => {
  const f = useCurrentFrame();
  const x1 = 28 + Math.sin(f / 70) * 8, y1 = 30 + Math.cos(f / 90) * 8;
  const x2 = 78 + Math.cos(f / 80) * 7, y2 = 74 + Math.sin(f / 60) * 7;
  if (variant === 'light') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(900px 600px at ${x1}% ${y1}%, #ffffff, ${COLORS.page})` }} />
    );
  }
  if (variant === 'red') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(1100px 800px at ${x2}% ${y2}%, ${COLORS.primary}, ${COLORS.primaryDark})` }} />
    );
  }
  return (
    <div style={{ position: 'absolute', inset: 0, width: WIDTH, height: HEIGHT, background: COLORS.ink, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(760px 520px at ${x1}% ${y1}%, rgba(225,29,42,${0.34 * glow}), transparent 70%), radial-gradient(820px 560px at ${x2}% ${y2}%, rgba(143,17,25,${0.4 * glow}), transparent 72%)` }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)', backgroundSize: '96px 96px', backgroundPosition: `${(f * 0.4) % 96}px ${(f * 0.2) % 96}px` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)' }} />
    </div>
  );
};
