import React from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FONT, SEC, TEXT } from '../config';
import { Backdrop } from '../components/Backdrop';
import { Rise } from '../components/Text';
import { E, prog } from '../lib/motion';

/** Recadrages de VRAIES captures (x, y, largeur, hauteur en px de capture 1440×810). */
const CROPS: Record<string, { src: string; x: number; y: number; w: number; h: number }> = {
  roles: { src: 'login-secretaire-rempli', x: 750, y: 232, w: 390, h: 122 },
  matricule: { src: 'sec-etudiant-drawer-erreurs', x: 940, y: 222, w: 490, h: 100 },
  erreur: { src: 'sec-etudiant-drawer-erreurs', x: 940, y: 360, w: 490, h: 110 },
  releve: { src: 'etu-notes', x: 1170, y: 290, w: 250, h: 58 },
};

const Crop: React.FC<{ id: string; width: number }> = ({ id, width }) => {
  const c = CROPS[id]; const k = width / c.w; const h = c.h * k;
  return (
    <div style={{ width, height: h, overflow: 'hidden', borderRadius: 22, background: '#fff', boxShadow: '0 40px 90px rgba(0,0,0,.4)', position: 'relative' }}>
      <Img src={staticFile(`captures/${c.src}.png`)} style={{ position: 'absolute', left: -c.x * k, top: -c.y * k, width: 1440 * k, height: 810 * k }} />
    </div>
  );
};

const Item: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const v = TEXT.value[i];
  const p = prog(f, 0, 22, E.out), exit = prog(f, 64, 75, E.inOut);
  const [l1, l2] = v.big.split('\n');
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateX(${-exit * 80}px)` }}>
      <div style={{ position: 'absolute', left: 120, top: 330 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: '0.4em', color: '#fff', opacity: 0.8, marginBottom: 24 }}>0{i + 1} / 04</div>
        <Rise f={f} at={2} size={94}>{l1}</Rise>
        <Rise f={f} at={9} size={94} color={COLORS.ink}>{l2}</Rise>
        <div style={{ marginTop: 30, height: 8, width: 360 * p, background: '#fff', borderRadius: 4 }} />
      </div>
      <div style={{ position: 'absolute', right: 110, top: 410, transform: `translateX(${(1 - p) * 140}px) scale(${0.94 + p * 0.06})`, opacity: Math.min(1, p * 1.6) }}>
        <Crop id={v.crop} width={640} />
      </div>
    </AbsoluteFill>
  );
};

/** SCÈNE 7 — VALEUR AJOUTÉE (75–85 s) : quatre bénéfices réels, chacun prouvé par un extrait d'écran. */
export const ValueProps: React.FC = () => (
  <AbsoluteFill>
    <Backdrop variant="red" />
    {[0, 1, 2, 3].map((i) => (
      <Sequence key={i} from={i * SEC(2.5)} durationInFrames={SEC(2.5)}><Item i={i} /></Sequence>
    ))}
  </AbsoluteFill>
);
