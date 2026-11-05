// Export MP4 : 1920×1080, 30 fps, 90 s, H.264 + AAC stéréo.   node tools/render.mjs [sortie.mp4]
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const out = process.argv[2] || 'out/ecole221-publicite-90s.mp4';
const dir = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell-'))[0];
const browserExecutable = dir ? `/opt/pw-browsers/${dir}/chrome-linux/headless_shell` : undefined;
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: 'Publicite', browserExecutable });
fs.mkdirSync(path.dirname(out), { recursive: true });
let last = -1;
await renderMedia({
  composition, serveUrl, outputLocation: out, codec: 'h264', crf: 17, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '256k',
  browserExecutable, concurrency: Math.max(1, Math.min(os.cpus().length, 6)), imageFormat: 'jpeg', jpegQuality: 94,
  onProgress: ({ renderedFrames, progress }) => { const p = Math.floor(progress * 100); if (p !== last && p % 2 === 0) { last = p; console.log(`rendu ${p}% (${renderedFrames}/${composition.durationInFrames})`); } },
});
console.log('OK', out);
