import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { CAPTURES, SEC, TEXT, WIN_W } from '../config';
import { Backdrop } from '../components/Backdrop';
import { UIWindow, State } from '../components/UIWindow';
import { CursorKF } from '../components/Cursor';
import { ShowcaseFrame } from './shared';
import { kf } from '../lib/motion';

const DUR = SEC(5);

type Cfg = { list: string; addKey: string; saveKey: string; states: State[]; field: { x: number; y: number }; extra?: boolean };

/** Une séquence = liste → clic sur « Ajouter » → tiroir → saisie → enregistrement → notification (tout est réel). */
const generic = (p: string, addKey: string, saveKey: string, extra?: string): Cfg => ({
  list: `gest-${p}-liste`, addKey, saveKey, field: { x: 1180, y: 330 },
  states: [
    { src: `gest-${p}-liste`, at: 0 }, { src: `gest-${p}-drawer`, at: 33 }, { src: `gest-${p}-rempli`, at: 66 },
    ...(extra ? [{ src: extra, at: 88 }] : []), { src: `gest-${p}-ok`, at: 114 },
  ],
});
const CFG: Cfg[] = [
  { list: 'sec-etudiants', addKey: 'sec-etu-add', saveKey: 'sec-etu-save', field: { x: 1064, y: 334 }, states: [
    { src: 'sec-etudiants', at: 0 }, { src: 'sec-etudiant-drawer', at: 33 }, { src: 'sec-etudiant-drawer-rempli', at: 60 },
    { src: 'sec-etudiant-drawer-erreurs', at: 85 }, { src: 'sec-etudiant-drawer-corrige', at: 105 }, { src: 'sec-etudiant-ajoute', at: 130 } ] },
  generic('classe', 'g-classe-add', 'g-classe-save'),
  generic('niveau', 'g-niveau-add', 'g-niveau-save'),
  generic('formateur', 'g-formateur-add', 'g-formateur-save', 'gest-formateur-matieres'),
  generic('filiere', 'g-filiere-add', 'g-filiere-save'),
  generic('matiere', 'g-matiere-add', 'g-matiere-save'),
  { list: 'gest-modif-liste', addKey: 'g-modif-edit', saveKey: 'g-modif-save', field: { x: 1100, y: 640 }, states: [
    { src: 'gest-modif-liste', at: 0 }, { src: 'gest-modif-drawer', at: 33 }, { src: 'gest-modif-rempli', at: 66 }, { src: 'gest-modif-ok', at: 114 } ] },
];

const Seg: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const c = CFG[i], T = TEXT.management[i];
  const add = CAPTURES[c.addKey], save = CAPTURES[c.saveKey];
  const first = i === 0;
  const fSave = first ? 120 : 108, fSave1 = 82;
  const cam = kf(f, [
    { f: 0, x: 720, y: 405, z: 1.0 }, { f: 22, x: Math.max(add.x - 260, 540), y: add.y + 120, z: 1.35 }, { f: 40, x: 1130, y: 400, z: 1.35 },
    { f: 72, x: 1130, y: 460, z: 1.5 }, { f: fSave - 6, x: 1150, y: 640, z: 1.6 }, { f: (first ? 132 : 118), x: 1180, y: 110, z: 1.8 }, { f: 150, x: 1180, y: 110, z: 1.8 },
  ]);
  const cursor: CursorKF[] = first
    ? [{ f: 8, x: add.x - 220, y: add.y + 140 }, { f: 30, x: add.x, y: add.y, click: true }, { f: 62, x: c.field.x, y: c.field.y, click: true },
       { f: fSave1, x: save.x, y: save.y, click: true }, { f: 98, x: c.field.x, y: c.field.y + 14, click: true }, { f: fSave, x: save.x, y: save.y, click: true }, { f: 142, x: 1000, y: 300 }]
    : [{ f: 8, x: add.x - 220, y: add.y + 140 }, { f: 30, x: add.x, y: add.y, click: true }, { f: 52, x: c.field.x, y: c.field.y, click: true },
       { f: fSave, x: save.x, y: save.y, click: true }, { f: 140, x: 1000, y: 300 }];
  return (
    <ShowcaseFrame f={f} dur={DUR} kicker={T.kicker} title={T.title} note={T.note}>
      <UIWindow f={f} width={WIN_W} cam={cam} fade={9} states={c.states} cursor={cursor} />
    </ShowcaseFrame>
  );
};

/** SCÈNE 5 — GESTION (48–83 s) : ajouts (étudiant, classe, niveau, formateur, filière, matière) et modification. */
export const ManagementShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    {CFG.map((_, i) => <Sequence key={i} from={i * DUR} durationInFrames={DUR}><Seg i={i} /></Sequence>)}
  </AbsoluteFill>
);
