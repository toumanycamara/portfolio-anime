import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { COLORS, FONT, FPS, SEC, TEXT } from '../config';
import { Backdrop } from '../components/Backdrop';
import { Rise } from '../components/Text';
import { UIWindow } from '../components/UIWindow';
import { E, kf, prog } from '../lib/motion';

type Role = { shots: [string, string]; cam: [number, number, number, number, number, number] };
// cam = [x0,y0,z0, x1,y1,z1]
const ROLES: Role[] = [
  { shots: ['etu-edt', 'etu-notes'], cam: [720, 405, 1.0, 720, 330, 1.5] },
  { shots: ['for-dashboard', 'for-classes'], cam: [720, 360, 1.5, 720, 430, 1.1] },
  { shots: ['sec-classes', 'sec-formateurs'], cam: [720, 470, 1.3, 760, 420, 1.1] },
];

const Segment: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const r = ROLES[i], t = TEXT.explore.roles[i];
  const enter = prog(f, 0, 22, E.out), exit = prog(f, 138, 150, E.inOut);
  const cam = kf(f, [
    { f: 0, x: r.cam[0], y: r.cam[1], z: r.cam[2] },
    { f: 70, x: r.cam[3], y: r.cam[4], z: r.cam[5] },
    { f: 150, x: r.cam[3], y: r.cam[4], z: r.cam[5] * 1.03 },
  ], E.soft);
  const ghost = prog(f, 0, 24, E.out);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateX(${-exit * 90}px)` }}>
      <div style={{ position: 'absolute', left: 90, top: 20, fontFamily: FONT, fontWeight: 900, fontSize: 300, letterSpacing: '-0.06em', color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,.1)', transform: `translateX(${(1 - ghost) * -60}px)`, opacity: ghost, right: 0, textAlign: 'right' }}>{t.n}</div>
      <div style={{ position: 'absolute', left: 220, top: 24, display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ opacity: enter, transform: `translateX(${(1 - enter) * -30}px)`, background: COLORS.primary, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 20, letterSpacing: '0.3em', padding: '10px 18px', borderRadius: 999 }}>{t.n} / 03</div>
        <Rise f={f} at={4} size={80} exit={134}>{t.name}</Rise>
      </div>
      <div style={{ position: 'absolute', left: 222, top: 128, fontFamily: FONT, fontSize: 28, color: 'rgba(255,255,255,.78)', fontWeight: 500, opacity: prog(f, 18, 34), transform: `translateY(${(1 - prog(f, 18, 34)) * 14}px)` }}>{t.line}</div>
      <div style={{ position: 'absolute', left: 220, top: 180, transform: `translateX(${(1 - enter) * 220}px)`, opacity: Math.min(1, enter * 2) }}>
        <UIWindow f={f} width={1480} cam={cam} tilt={{ x: 1.5, y: -3 + enter * 1 }} fade={10}
          states={[{ src: r.shots[0], at: 0 }, { src: r.shots[1], at: 78 }]} />
      </div>
    </AbsoluteFill>
  );
};

/** SCÈNE 3 — EXPLORATION (18–33 s) : trois profils, trois espaces. */
export const InterfaceNavigation: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    {[0, 1, 2].map((i) => (
      <Sequence key={i} from={i * SEC(5)} durationInFrames={SEC(5)}><Segment i={i} /></Sequence>
    ))}
  </AbsoluteFill>
);
