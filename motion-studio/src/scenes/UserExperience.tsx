import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { CAPTURES, SEC, TEXT, at, scenes } from '../config';
import { Backdrop } from '../components/Backdrop';
import { UIWindow } from '../components/UIWindow';
import { ShowcaseFrame } from './shared';
import { kf } from '../lib/motion';

const O = scenes.experience[0] - 48; // décalage par rapport au minutage d'origine (les repères sonores suivent timeline.json)
const S = 48 + O;
const A_DUR = SEC(7), B_DUR = SEC(5), C_DUR = SEC(3);

/** Le formateur saisit une note (erreur corrigée, enregistrement, notification). */
const Saisie: React.FC = () => {
  const f = useCurrentFrame();
  const save = CAPTURES['for-notes-save'];
  const fSave = at(53.4 + O, S), fOk = at(53.7 + O, S);
  const cam = kf(f, [
    { f: 0, x: 900, y: 330, z: 1.3 }, { f: 40, x: 1035, y: 330, z: 1.6 }, { f: 92, x: 1035, y: 440, z: 1.9 }, { f: 100, x: 1035, y: 462, z: 2.0 },
    { f: 126, x: 1035, y: 440, z: 1.7 }, { f: fSave - 4, x: 1150, y: 250, z: 1.6 }, { f: fOk + 12, x: 1150, y: 120, z: 1.8 }, { f: 205, x: 1150, y: 120, z: 1.8 },
  ]);
  return (
    <ShowcaseFrame f={f} dur={A_DUR} kicker={TEXT.experience.kicker} title={TEXT.experience.s1}>
      <UIWindow f={f} width={1320} cam={cam} fade={9}
        states={[
          { src: 'for-notes-vide', at: 0 }, { src: 'for-notes-saisies', at: 62 }, { src: 'for-notes-erreur', at: at(51.3 + O, S) },
          { src: 'for-notes-saisies', at: at(52.4 + O, S) + 6 }, { src: 'for-notes-enregistrees', at: fOk },
        ]}
        cursor={[
          { f: 22, x: 1160, y: 250 }, { f: at(49.4 + O, S), x: 1035, y: 302, click: true }, { f: at(51.0 + O, S), x: 1035, y: 464 },
          { f: at(51.9 + O, S), x: 1035, y: 464, click: true }, { f: fSave, x: save.x, y: save.y, click: true }, { f: fOk + 24, x: 1200, y: 420 },
        ]} />
    </ShowcaseFrame>
  );
};

/** L'étudiant consulte : moyenne pondérée, mention, classement, relevé. */
const Consultation: React.FC = () => {
  const f = useCurrentFrame();
  const dl = CAPTURES['etu-notes-dl'];
  const fClick = at(58.5 + O, 55 + O);
  const cam = kf(f, [
    { f: 0, x: 720, y: 405, z: 1.0 }, { f: at(57.0 + O, 55 + O) - 10, x: 850, y: 200, z: 1.25 }, { f: fClick - 14, x: 850, y: 230, z: 1.25 },
    { f: fClick, x: 1100, y: 300, z: 1.7 }, { f: 150, x: 1100, y: 300, z: 1.75 },
  ]);
  return (
    <ShowcaseFrame f={f} dur={B_DUR} kicker={TEXT.experience.kicker} title={TEXT.experience.s2} note={TEXT.experience.note2}>
      <UIWindow f={f} width={1320} cam={cam} fade={8} states={[{ src: 'etu-notes', at: 0 }]}
        cursor={[{ f: 40, x: 1000, y: 640 }, { f: fClick, x: dl.x, y: dl.y, click: true }, { f: fClick + 22, x: 1250, y: 500 }]} />
    </ShowcaseFrame>
  );
};

/** Secrétaire : suppression → « Annuler ». */
const Annuler: React.FC = () => {
  const f = useCurrentFrame();
  const del = CAPTURES['sec-niv-del'], conf = CAPTURES['sec-niv-confirm'], undo = CAPTURES['sec-niv-undo'];
  const fDel = at(60.8 + O, 60 + O), fConf = at(61.6 + O, 60 + O), fUndo = at(62.5 + O, 60 + O);
  const cam = kf(f, [
    { f: 0, x: 720, y: 405, z: 1.05 }, { f: fDel, x: 560, y: 450, z: 1.5 }, { f: fConf, x: 760, y: 470, z: 1.6 }, { f: fUndo - 8, x: 1250, y: 140, z: 1.8 }, { f: 90, x: 1250, y: 140, z: 1.8 },
  ]);
  return (
    <ShowcaseFrame f={f} dur={C_DUR} kicker={TEXT.experience.kicker} title={TEXT.experience.s3}>
      <UIWindow f={f} width={1320} cam={cam} fade={5}
        states={[{ src: 'sec-niveau-ajoute', at: 0 }, { src: 'sec-niveau-modale', at: fDel + 2 }, { src: 'sec-niveau-supprime-annuler', at: fConf + 3 }, { src: 'sec-niveau-restaure', at: fUndo + 3 }]}
        cursor={[{ f: 4, x: 800, y: 300 }, { f: fDel, x: del.x, y: del.y, click: true }, { f: fConf, x: conf.x, y: conf.y, click: true }, { f: fUndo, x: undo.x, y: undo.y, click: true }]} />
    </ShowcaseFrame>
  );
};

/** SCÈNE 5 — EXPÉRIENCE UTILISATEUR (48–63 s) : de la saisie d'une note au résultat. */
export const UserExperience: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Sequence from={0} durationInFrames={A_DUR}><Saisie /></Sequence>
    <Sequence from={A_DUR} durationInFrames={B_DUR}><Consultation /></Sequence>
    <Sequence from={A_DUR + B_DUR} durationInFrames={C_DUR}><Annuler /></Sequence>
  </AbsoluteFill>
);
