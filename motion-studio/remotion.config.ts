import { Config } from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// Chromium fourni par l'environnement (évite un téléchargement) ; ignoré s'il n'existe pas.
const dir = '/opt/pw-browsers';
if (fs.existsSync(dir)) {
  const c = fs.readdirSync(dir).filter((d) => d.startsWith('chromium_headless_shell-')).map((d) => `${dir}/${d}/chrome-linux/headless_shell`)[0];
  if (c && fs.existsSync(c)) Config.setBrowserExecutable(c);
}
