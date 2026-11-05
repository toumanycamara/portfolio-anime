import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CAPTURES, COLORS, TEXT, at } from '../config';
import { Backdrop } from '../components/Backdrop';
import { Rise, Chip } from '../components/Text';
import { UIWindow } from '../components/UIWindow';
import { E, kf, prog } from '../lib/motion';

const S = 8; // début absolu (s)

/** SCÈNE 2 — RÉVÉLATION (8–18 s) : vraie connexion, puis le tableau de bord se dévoile. */
export const DashboardReveal: React.FC = () => {
  const f = useCurrentFrame();
  const email = CAPTURES['login-secretaire-email'], pwd = CAPTURES['login-secretaire-pwd'], sub = CAPTURES['login-secretaire-submit'];
  const fType0 = at(9.6, S), fType1 = at(10.6, S), fClick = at(10.9, S), fDash = at(11.35, S);
  const cam = kf(f, [
    { f: 0, x: 720, y: 405, z: 1.0 },
    { f: 20, x: 944, y: 440, z: 1.55 },
    { f: fClick + 4, x: 944, y: 470, z: 1.55 },
    { f: fDash + 14, x: 720, y: 405, z: 1.0 },
    { f: at(12.4, S), x: 720, y: 405, z: 1.0 },
    { f: at(13.2, S), x: 790, y: 420, z: 1.5 },
    { f: at(14.4, S), x: 790, y: 440, z: 1.5 },
    { f: at(15.0, S), x: 800, y: 640, z: 1.55 },
    { f: at(16.6, S), x: 800, y: 640, z: 1.55 },
    { f: at(17.4, S), x: 720, y: 405, z: 1.0 },
  ]);
  const tilt = (1 - prog(f, 0, 38, E.out));
  const flash = prog(f, fDash - 2, fDash + 3, E.out) * (1 - prog(f, fDash + 3, fDash + 16, E.out));
  const winY = 126 + (1 - prog(f, 0, 30, E.out)) * 70;
  return (
    <AbsoluteFill>
      <Backdrop />
      <div style={{ position: 'absolute', left: 180, top: 34, display: 'flex', gap: 22 }}>
        <Rise f={f} at={6} size={66}>{TEXT.reveal.l1}</Rise>
        <Rise f={f} at={14} size={66} color={COLORS.primary}>{TEXT.reveal.l2}</Rise>
      </div>
      <div style={{ position: 'absolute', left: 180, top: winY, opacity: prog(f, 0, 14) }}>
        <UIWindow
          f={f} width={1560} fade={10} cam={cam}
          tilt={{ x: 7 * tilt, y: -14 * tilt }}
          states={[
            { src: 'login-secretaire-vide', at: 0 },
            { src: 'login-secretaire-rempli', at: fType0 + 10 },
            { src: 'sec-dashboard', at: fDash },
          ]}
          cursor={[
            { f: 8, x: 1180, y: 640 },
            { f: at(9.0, S), x: email.x, y: email.y, click: true },
            { f: fType1 + 4, x: pwd.x + 60, y: pwd.y },
            { f: fClick, x: sub.x, y: sub.y, click: true },
            { f: fDash + 30, x: 1100, y: 130 },
          ]}
        />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 84, display: 'flex', justifyContent: 'center', gap: 26, opacity: 1 - prog(f, at(15.0, S) - 6, at(15.0, S)) }}>
        {TEXT.reveal.chips.map((c, i) => <Chip key={c} f={f} at={at(13.2, S) + i * 9}>{c}</Chip>)}
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: flash * 0.55 }} />
    </AbsoluteFill>
  );
};
