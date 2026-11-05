import React from 'react';
import { Img, staticFile } from 'remotion';
import { COLORS } from '../config';
import { Cursor, CursorKF } from './Cursor';

export type State = { src: string; at: number };
export type Cam = { x: number; y: number; z: number };

const CAP_W = 1440, CAP_H = 810;

/**
 * Fenêtre de navigateur affichant de VRAIES captures de l'application.
 * - `states` : captures successives (fondu enchaîné à partir de l'image `at`)
 * - `cam`    : caméra virtuelle (point de focus en px de capture + zoom)
 * - `cursor` : curseur animé (suit la caméra)
 */
export const UIWindow: React.FC<{
  f: number; states: State[]; width: number; cam?: Cam; cursor?: CursorKF[]; fade?: number;
  tilt?: { x: number; y: number }; chrome?: boolean; style?: React.CSSProperties; radius?: number; label?: string;
}> = ({ f, states, width, cam = { x: CAP_W / 2, y: CAP_H / 2, z: 1 }, cursor = [], fade = 8, tilt, chrome = true, style, radius = 18, label = 'École 221' }) => {
  const k = width / CAP_W;
  const h = width * (CAP_H / CAP_W);
  const bar = chrome ? 34 : 0;
  const scale = k * cam.z;
  // la caméra reste dans la capture (jamais de zone vide)
  const vw = CAP_W / cam.z, vh = CAP_H / cam.z;
  const cx = vw >= CAP_W ? CAP_W / 2 : Math.min(Math.max(cam.x, vw / 2), CAP_W - vw / 2);
  const cy = vh >= CAP_H ? CAP_H / 2 : Math.min(Math.max(cam.y, vh / 2), CAP_H - vh / 2);
  const tx = width / 2 - cx * scale;
  const ty = h / 2 - cy * scale;
  return (
    <div style={{ width, height: h + bar, borderRadius: radius, overflow: 'hidden', background: '#fff', boxShadow: '0 50px 100px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.1)', transform: tilt ? `perspective(2400px) rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)` : undefined, ...style }}>
      {chrome && (
        <div style={{ height: bar, background: '#ececef', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, borderBottom: '1px solid #d9d9de' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />)}
          <div style={{ marginLeft: 18, height: 20, width: 260, borderRadius: 10, background: '#fff', color: COLORS.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>{label}</div>
        </div>
      )}
      <div style={{ position: 'relative', width, height: h, overflow: 'hidden', background: '#fff' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: CAP_W, height: CAP_H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${scale})`, willChange: 'transform' }}>
          {states.map((s, i) => {
            const o = i === 0 ? 1 : Math.min(1, Math.max(0, (f - s.at) / fade));
            return o <= 0 ? null : <Img key={s.src + i} src={staticFile(`captures/${s.src}.png`)} style={{ position: 'absolute', left: 0, top: 0, width: CAP_W, height: CAP_H, opacity: o }} />;
          })}
          <Cursor f={f} kfs={cursor} />
        </div>
      </div>
    </div>
  );
};
