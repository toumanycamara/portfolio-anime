import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONT, TEXT } from '../config';
import { Backdrop } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Rise } from '../components/Text';
import { E, prog } from '../lib/motion';

/** SCÈNE 8 — OUTRO (85–90 s) : blason, nom et signature. */
export const ClosingScene: React.FC = () => {
  const f = useCurrentFrame();
  const logoP = prog(f, 14, 46, E.back);
  const boom = prog(f, 90, 96, E.out) * (1 - prog(f, 96, 124, E.out));
  const fade = prog(f, 134, 149, E.inOut);
  return (
    <AbsoluteFill>
      <Backdrop variant="light" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', width: 520 + i * 190 + boom * 120, height: 520 + i * 190 + boom * 120, borderRadius: '50%', border: `2px solid rgba(225,29,42,${(0.28 - i * 0.07) * Math.min(1, logoP * 2)})`, transform: 'translateY(-90px)' }} />
        ))}
        <div style={{ transform: `translateY(-90px) scale(${(0.6 + logoP * 0.4) * (1 + boom * 0.05)})`, opacity: Math.min(1, logoP * 1.5), background: '#fff', borderRadius: 44, padding: '40px 64px', boxShadow: '0 50px 100px rgba(143,17,25,.25), 0 0 0 1px rgba(0,0,0,.05)' }}>
          <Logo width={460} />
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 744, textAlign: 'center' }}>
        <Rise f={f} at={62} size={68} align="center" color={COLORS.ink}>{TEXT.outro.signature}</Rise>
        <div style={{ margin: '22px auto 0', height: 6, width: 260 * prog(f, 74, 98), background: COLORS.primary, borderRadius: 3 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', fontFamily: FONT, fontSize: 21, color: COLORS.muted, fontWeight: 500, opacity: prog(f, 96, 116) }}>{TEXT.outro.foot}</div>
      <AbsoluteFill style={{ background: COLORS.ink, opacity: fade }} />
    </AbsoluteFill>
  );
};
