import { Easing, interpolate } from 'remotion';

export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.45, 0.05, 0.25, 1),
  back: Easing.bezier(0.34, 1.45, 0.64, 1),
};

/** progression 0→1 entre les images a et b (avec amorti). */
export const prog = (f: number, a: number, b: number, ease: (t: number) => number = E.out) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

type KF = { f: number } & Record<string, number | boolean | undefined>;
/** interpolation par images-clés (toutes les clés numériques sauf f). */
export function kf<T extends KF>(f: number, frames: T[], ease: (t: number) => number = E.inOut): T {
  if (f <= frames[0].f) return frames[0];
  const last = frames[frames.length - 1];
  if (f >= last.f) return last;
  let i = 0;
  while (i < frames.length - 2 && f >= frames[i + 1].f) i++;
  const a = frames[i], b = frames[i + 1];
  const t = ease((f - a.f) / (b.f - a.f));
  const out: Record<string, number | boolean | undefined> = { ...a };
  for (const k of Object.keys(a)) {
    if (k === 'f') continue;
    const va = a[k], vb = b[k];
    if (typeof va === 'number' && typeof vb === 'number') out[k] = va + (vb - va) * t;
  }
  out.f = f;
  return out as T;
}
