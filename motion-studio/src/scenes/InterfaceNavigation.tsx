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
  { shots: ['etu-edt', 'etu-dashboard'], cam: [720, 400, 1.15, 720, 600, 1.5] },
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
      <div style={{ position: 'absolute', left: 90, top: 30, fontFamily: FONT, fontWeight: 900, fontSize: 420, letterSpacing: '-0.06em', color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,.12)', transform: `translateX(${(1 - ghost) * -60}px)`, opacity: ghost }}>{t.n}</div>
      <div style={{ position: 'absolute', left: 110, top: 400 }}>
        <div style={{ opacity: enter, transform: `translateX(${(1 - enter) * -30}px)`, display: 'inline-block', background: COLORS.primary, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: '0.3em', padding: '10px 20px', borderRadius: 999, marginBottom: 26 }}>{t.n} / 03</div>
        <Rise f={f} at={4} size={98} exit={134}>{t.name}</Rise>
        <div style={{ marginTop: 26, width: 470, fontFamily: FONT, fontSize: 32, lineHeight: 1.35, color: 'rgba(255,255,255,.78)', fontWeight: 500, opacity: prog(f, 18, 34), transform: `translateY(${(1 - prog(f, 18, 34)) * 18}px)` }}>{t.line}</div>
      </div>
      <div style={{ position: 'absolute', left: 700, top: 190, transform: `translateX(${(1 - enter) * 260}px)`, opacity: Math.min(1, enter * 2) }}>
        <UIWindow f={f} width={1190} cam={cam} tilt={{ x: 3, y: -7 + enter * 2 }} fade={10}
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
