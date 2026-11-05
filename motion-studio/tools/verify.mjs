// Contrôle qualité : durée, résolution, fréquence, codecs, audio, loudness + planche contact.
//   node tools/verify.mjs [fichier.mp4]
import { execSync } from 'node:child_process';
const file = process.argv[2] || 'out/ecole221-publicite-125s.mp4';
const j = JSON.parse(execSync(`ffprobe -v error -show_streams -show_format -of json "${file}"`).toString());
const v = j.streams.find((s) => s.codec_type === 'video'), a = j.streams.find((s) => s.codec_type === 'audio');
const [n, d] = v.r_frame_rate.split('/').map(Number);
const dur = parseFloat(j.format.duration);
const checks = [
  ['Durée = 125 s (±0,05)', Math.abs(dur - 125) <= 0.05, `${dur.toFixed(3)} s`],
  ['Résolution 1920×1080', v.width === 1920 && v.height === 1080, `${v.width}×${v.height}`],
  ['Fréquence 30 fps', n / d === 30, `${n / d} fps`],
  ['Vidéo H.264', v.codec_name === 'h264', `${v.codec_name} ${v.pix_fmt}`],
  ['Audio stéréo', a && a.channels === 2, a ? `${a.codec_name} ${a.channels} canaux ${a.sample_rate} Hz` : 'absent'],
  ['Ratio 16:9', v.width / v.height === 16 / 9, (v.width / v.height).toFixed(4)],
];
for (const [name, ok, val] of checks) console.log(`${ok ? '✔' : '✘'} ${name} — ${val}`);
const loud = execSync(`ffmpeg -hide_banner -nostats -i "${file}" -af ebur128=peak=true -f null - 2>&1 | tail -14`).toString();
const m = (re) => (loud.match(re) || [])[1];
console.log(`ℹ Loudness : ${m(/I:\s+(-?[\d.]+) LUFS/)} LUFS intégrés, pic réel ${m(/Peak:\s+(-?[\d.]+) dBFS/)} dBFS, LRA ${m(/LRA:\s+([\d.]+) LU/)} LU`);
execSync(`ffmpeg -v error -y -i "${file}" -vf "fps=1/5,scale=480:-1,tile=6x3" -frames:v 1 out/qc-contact.jpg`);
console.log('ℹ Planche contact : out/qc-contact.jpg');
if (checks.some((c) => !c[1])) process.exit(1);
