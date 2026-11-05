import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, WIDTH, HEIGHT } from '../config';
import { E, prog } from '../lib/motion';

/** Transition « balayage rouge » centrée sur la coupe (frame `center`), durée totale 2×half. */
export const Wipe: React.FC<{ center: number; half?: number }> = ({ center, half = 9 }) => {
  const f = useCurrentFrame();
  if (f < center - half || f > center + half) return null;
  const cover = prog(f, center - half, center, E.inOut);
  const uncover = prog(f, center, center + half, E.inOut);
  const lead = -20 + cover * 140;            // bord d'attaque (%)
  const trail = -20 + uncover * 140;         // bord de fuite (%)
  return (
    <div style={{ position: 'absolute', inset: 0, width: WIDTH, height: HEIGHT, zIndex: 100, pointerEvents: 'none', background: COLORS.primary, clipPath: `polygon(${trail}% 0, ${lead}% 0, ${lead - 18}% 100%, ${trail - 18}% 100%)` }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(100deg, ${COLORS.primaryDark}, ${COLORS.primary} 60%)` }} />
    </div>
  );
};
