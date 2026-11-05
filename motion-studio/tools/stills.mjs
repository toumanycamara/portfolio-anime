// Aperçu rapide : rend quelques images du film complet. Usage : node tools/stills.mjs 30 150 400 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), onProgress: () => {} });
const comp = await selectComposition({ serveUrl, id: 'Publicite', browserExecutable });
fs.mkdirSync('out/stills', { recursive: true });
for (const frame of frames) {
  const out = `out/stills/f${String(frame).padStart(4, '0')}.png`;
  await renderStill({ composition: comp, serveUrl, output: out, frame, browserExecutable, imageFormat: 'png' });
  console.log('✓', out);
}
