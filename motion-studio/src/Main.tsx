import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { AUDIO, SceneKey, TOTAL_FRAMES, sceneDur, sceneFrom } from './config';
import { Introduction } from './scenes/Introduction';
import { DashboardReveal } from './scenes/DashboardReveal';
import { InterfaceNavigation } from './scenes/InterfaceNavigation';
import { FeatureShowcase } from './scenes/FeatureShowcase';
import { UserExperience } from './scenes/UserExperience';
import { ResponsiveShowcase } from './scenes/ResponsiveShowcase';
import { ValueProps } from './scenes/ValueProps';
import { ClosingScene } from './scenes/ClosingScene';
import { Wipe } from './components/Wipe';

export const SCENES: { key: SceneKey; id: string; C: React.FC }[] = [
  { key: 'intro', id: 'S1-Introduction', C: Introduction },
  { key: 'reveal', id: 'S2-DashboardReveal', C: DashboardReveal },
  { key: 'explore', id: 'S3-InterfaceNavigation', C: InterfaceNavigation },
  { key: 'features', id: 'S4-FeatureShowcase', C: FeatureShowcase },
  { key: 'experience', id: 'S5-UserExperience', C: UserExperience },
  { key: 'responsive', id: 'S6-ResponsiveShowcase', C: ResponsiveShowcase },
  { key: 'value', id: 'S7-ValueProps', C: ValueProps },
  { key: 'outro', id: 'S8-ClosingScene', C: ClosingScene },
];

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: '#141414' }}>
    {SCENES.map(({ key, C }) => (
      <Sequence key={key} from={sceneFrom(key)} durationInFrames={sceneDur(key)}><C /></Sequence>
    ))}
    {SCENES.slice(1).map(({ key }) => <Wipe key={key} center={sceneFrom(key)} />)}
    <Audio src={staticFile(AUDIO.soundtrack)} volume={AUDIO.volume} />
  </AbsoluteFill>
);
export { TOTAL_FRAMES };
