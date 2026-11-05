import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONT, TEXT } from '../config';
import { Backdrop } from '../components/Backdrop';
import { Rise } from '../components/Text';
import { UIWindow } from '../components/UIWindow';
import { PhoneFrame } from '../components/PhoneFrame';
import { E, kf, prog } from '../lib/motion';

/** SCÈNE 6 — RESPONSIVE (63–75 s) : l'ordinateur se range, le smartphone prend le relais. */
export const ResponsiveShowcase: React.FC = () => {
  const f = useCurrentFrame();
  const shrink = prog(f, 22, 74, E.inOut);
  const w = 1300 + (780 - 1300) * shrink;
  const left = 310 + (110 - 310) * shrink, top = 230 + (500 - 230) * shrink;
  const phoneIn = prog(f, 56, 100, E.out);
  const exit = prog(f, 340, 359, E.inOut);
  const cam = kf(f, [{ f: 0, x: 720, y: 405, z: 1.0 }, { f: 120, x: 850, y: 250, z: 1.2 }, { f: 200, x: 720, y: 405, z: 1.0 }]);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      <Backdrop />
      <div style={{ position: 'absolute', left: 110, top: 70 }}>
        <Rise f={f} at={62} size={108}>{TEXT.responsive.l1}</Rise>
        <Rise f={f} at={72} size={108} color={COLORS.primary}>{TEXT.responsive.l2}</Rise>
        <div style={{ marginTop: 26, fontFamily: FONT, fontSize: 30, fontWeight: 500, color: 'rgba(255,255,255,.75)', opacity: prog(f, 96, 116), transform: `translateY(${(1 - prog(f, 96, 116)) * 14}px)` }}>{TEXT.responsive.note}</div>
      </div>
      <div style={{ position: 'absolute', left, top }}>
        <UIWindow f={f} width={w} cam={cam} states={[{ src: 'etu-notes', at: 0 }]} tilt={{ x: 2 * shrink, y: 6 * shrink }} />
      </div>
      <div style={{ position: 'absolute', left: 1171, top: 54 + (1 - phoneIn) * 1100, transform: `rotate(${(1 - phoneIn) * 8}deg)` }}>
        <PhoneFrame f={f} width={429}
          states={[{ src: 'mob-login', at: 0 }, { src: 'mob-dashboard', at: 94 }, { src: 'mob-menu', at: 124 }, { src: 'mob-notes', at: 214 }]}
          tap={[{ f: 120, x: 36, y: 44 }, { f: 210, x: 100, y: 238 }]} />
      </div>
    </AbsoluteFill>
  );
};
