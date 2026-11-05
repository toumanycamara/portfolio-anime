import React from 'react';
import { COLORS } from '../config';
import { kf } from '../lib/motion';

export type CursorKF = { f: number; x: number; y: number; click?: boolean };

/** Curseur animé, dessiné dans l'espace de la capture (1440×810) : il suit donc la caméra. */
export const Cursor: React.FC<{ f: number; kfs: CursorKF[]; size?: number }> = ({ f, kfs, size = 30 }) => {
  if (!kfs.length || f < kfs[0].f - 6) return null;
  const p = kf(f, kfs);
  const appear = Math.min(1, Math.max(0, (f - (kfs[0].f - 6)) / 6));
  const clickKF = kfs.filter((k) => k.click).find((k) => f >= k.f && f <= k.f + 16);
  const press = kfs.filter((k) => k.click).some((k) => f >= k.f - 2 && f <= k.f + 3);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none', zIndex: 50 }}>
      {clickKF && (() => {
        const t = (f - clickKF.f) / 16;
        const r = 10 + t * 40;
        return <div style={{ position: 'absolute', left: clickKF.x - r, top: clickKF.y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `3px solid ${COLORS.primary}`, background: 'rgba(225,29,42,.18)', opacity: 1 - t }} />;
      })()}
      <svg width={size} height={size * 1.25} viewBox="0 0 24 30" style={{ position: 'absolute', left: p.x, top: p.y, opacity: appear, transform: `scale(${press ? 0.86 : 1})`, transformOrigin: '2px 2px', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.45))' }}>
        <path d="M2 2 L2 22 L7.4 17.4 L11 26 L14.4 24.5 L10.9 16.2 L18 16 Z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
