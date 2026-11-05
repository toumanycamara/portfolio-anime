import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { SEC, TEXT, WIN_W } from '../config';
import { Backdrop } from '../components/Backdrop';
import { UIWindow } from '../components/UIWindow';
import { ShowcaseFrame } from './shared';
import { StatisticsAnimation } from './StatisticsAnimation';
import { kf } from '../lib/motion';

const DUR = SEC(5);

const Appel: React.FC = () => {
  const f = useCurrentFrame();
  const T = TEXT.features.appel;
  const cam = kf(f, [
    { f: 0, x: 780, y: 330, z: 1.25 }, { f: 34, x: 812, y: 437, z: 1.75 }, { f: 62, x: 790, y: 460, z: 1.45 },
    { f: 80, x: 600, y: 745, z: 1.9 }, { f: 150, x: 600, y: 745, z: 1.95 },
  ]);
  return (
    <ShowcaseFrame f={f} dur={DUR} kicker={T.kicker} title={T.title} note={T.note}>
      <UIWindow f={f} width={WIN_W} cam={cam} fade={8}
        states={[{ src: 'for-presences', at: 0 }, { src: 'for-presences-modifiees', at: 46 }, { src: 'for-presences-bas', at: 82 }]}
        cursor={[{ f: 14, x: 1150, y: 300 }, { f: 42, x: 812, y: 437, click: true }, { f: 72, x: 1000, y: 540 }]} />
    </ShowcaseFrame>
  );
};

const Notes: React.FC = () => {
  const f = useCurrentFrame();
  const T = TEXT.features.notes;
  const cam = kf(f, [
    { f: 0, x: 1035, y: 330, z: 1.5 }, { f: 40, x: 1035, y: 440, z: 1.7 }, { f: 52, x: 1035, y: 462, z: 2.0 },
    { f: 84, x: 1035, y: 420, z: 1.5 }, { f: 100, x: 780, y: 745, z: 1.8 }, { f: 150, x: 780, y: 745, z: 1.85 },
  ]);
  return (
    <ShowcaseFrame f={f} dur={DUR} kicker={T.kicker} title={T.title} note={T.note}>
      <UIWindow f={f} width={WIN_W} cam={cam} fade={7}
        states={[{ src: 'for-notes-vide', at: 0 }, { src: 'for-notes-saisies', at: 18 }, { src: 'for-notes-erreur', at: 48 }, { src: 'for-notes-saisies', at: 86 }, { src: 'for-notes-bas', at: 102 }]}
        cursor={[{ f: 8, x: 1150, y: 250 }, { f: 20, x: 1035, y: 302, click: true }, { f: 44, x: 1035, y: 464, click: true }, { f: 82, x: 1035, y: 464, click: true }, { f: 110, x: 1180, y: 600 }]} />
    </ShowcaseFrame>
  );
};

const Stats: React.FC = () => {
  const f = useCurrentFrame();
  const T = TEXT.features.stats;
  return (
    <ShowcaseFrame f={f} dur={DUR} kicker={T.kicker} title={T.title}>
      <div style={{ marginLeft: -10, marginTop: 20 }}><StatisticsAnimation f={f} /></div>
    </ShowcaseFrame>
  );
};

/** SCÈNE 4 — FONCTIONNALITÉS (33–48 s) : présences, notes, statistiques. */
export const FeatureShowcase: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Sequence from={0} durationInFrames={DUR}><Appel /></Sequence>
    <Sequence from={DUR} durationInFrames={DUR}><Notes /></Sequence>
    <Sequence from={DUR * 2} durationInFrames={DUR}><Stats /></Sequence>
  </AbsoluteFill>
);
