import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONT, TEXT, WIDTH } from '../config';
import { Backdrop } from '../components/Backdrop';
import { Rise } from '../components/Text';
import { Logo } from '../components/Logo';
import { E, prog } from '../lib/motion';

/** SCÈNE 1 — INTRODUCTION (0–8 s) : accroche typographique puis révélation du blason. */
export const Introduction: React.FC = () => {
  const f = useCurrentFrame();
  const logoP = prog(f, 135, 168, E.back);
  const ring = prog(f, 135, 200, E.out);
  const sweep = prog(f, 150, 185, E.inOut);
  const tag = prog(f, 198, 222, E.out);
  return (
    <AbsoluteFill>
      <Backdrop glow={1 + logoP * 0.4} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: WIDTH, textAlign: 'center' }}>
          <Rise f={f} at={15} exit={117} size={200} align="center">{TEXT.intro.l1}</Rise>
          <Rise f={f} at={60} exit={121} size={200} align="center" color={COLORS.primary} style={{ marginTop: 6 }}>{TEXT.intro.l2}</Rise>
        </div>
      </AbsoluteFill>

      {/* anneaux décoratifs */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', width: 620 + i * 220 + ring * 80, height: 620 + i * 220 + ring * 80, borderRadius: '50%', border: `2px solid rgba(225,29,42,${(0.5 - i * 0.2) * Math.min(1, ring * 2) * (1 - ring * 0.5)})` }} />
        ))}
        <div style={{ transform: `scale(${0.55 + logoP * 0.45}) rotate(${(1 - logoP) * -6}deg)`, opacity: Math.min(1, logoP * 1.6), background: '#fff', borderRadius: 44, padding: '44px 70px', boxShadow: '0 60px 120px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.1)', position: 'relative', overflow: 'hidden' }}>
          <Logo width={520} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, width: 160, left: `${-30 + sweep * 150}%`, background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.85), transparent)', transform: 'skewX(-18deg)' }} />
        </div>
      </AbsoluteFill>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 118, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: '0.6em', color: '#fff', opacity: tag, transform: `translateY(${(1 - tag) * 20}px)` }}>
        {TEXT.intro.tag}
        <div style={{ margin: '22px auto 0', height: 4, width: 220 * tag, background: COLORS.primary, borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};
