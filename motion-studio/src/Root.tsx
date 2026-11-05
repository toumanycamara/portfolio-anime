import React from 'react';
import { Composition } from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH, sceneDur } from './config';
import { Main, SCENES } from './Main';

/** `Publicite` = film complet (90 s). Chaque scène a aussi sa composition pour être prévisualisée seule. */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Publicite" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {SCENES.map(({ key, id, C }) => (
      <Composition key={id} id={id} component={C} durationInFrames={sceneDur(key)} fps={FPS} width={WIDTH} height={HEIGHT} />
    ))}
  </>
);
