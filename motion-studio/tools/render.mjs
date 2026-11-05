// Export MP4 : 1920×1080, 30 fps, 125 s, H.264 + AAC stéréo.   node tools/render.mjs [sortie.mp4]
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const out = process.argv[2] || 'out/ecole221-publicite-125s.mp4';
const raw = 'out/_raw.mp4';
const dir = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell-'))[0];
const browserExecutable = dir ? `/opt/pw-browsers/${dir}/chrome-linux/headless_shell` : undefined;
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: 'Publicite', browserExecutable });
fs.mkdirSync(path.dirname(out), { recursive: true });
let last = -1;
await renderMedia({
  composition, serveUrl, outputLocation: raw, codec: 'h264', crf: 17, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '256k',
  browserExecutable, concurrency: Math.max(1, Math.min(os.cpus().length, 6)), imageFormat: 'jpeg', jpegQuality: 94,
  onProgress: ({ renderedFrames, progress }) => { const p = Math.floor(progress * 100); if (p !== last && p % 2 === 0) { last = p; console.log(`rendu ${p}% (${renderedFrames}/${composition.durationInFrames})`); } },
});
// Finalisation : plage de couleurs TV (yuv420p standard), 125,000 s exactement, loudness -16 LUFS / pic -1,5 dBTP.
import { execSync } from 'node:child_process';
execSync(`ffmpeg -v error -y -i ${raw} -t 125 -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 16 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -af "loudnorm=I=-16:TP=-1.5:LRA=9,apad=whole_dur=125,atrim=0:125" -c:a aac -b:a 256k -ar 48000 -movflags +faststart ${out}`, { stdio: 'inherit' });
fs.rmSync(raw, { force: true });
console.log('OK', out);
