import React from 'react';
import { COLORS, FONT, STATS } from '../config';
import { E, prog } from '../lib/motion';

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 30px 70px rgba(0,0,0,.4)', fontFamily: FONT, color: COLORS.ink, ...style }}>{children}</div>
);

/** Indicateurs animés, recomposés avec les VRAIS chiffres de la base de démonstration (même mise en page que « Statistiques »). */
export const StatisticsAnimation: React.FC<{ f: number }> = ({ f }) => {
  const maxF = Math.max(...STATS.parFiliere.map((x) => x[1]));
  const maxN = Math.max(...STATS.parNiveau.map((x) => x[1]));
  return (
    <div style={{ width: 1500 }}>
      <div style={{ display: 'flex', gap: 20 }}>
        {STATS.cards.map((c, i) => {
          const p = prog(f, 14 + i * 6, 14 + i * 6 + 46, E.out);
          const pop = prog(f, 10 + i * 6, 26 + i * 6, E.back);
          return (
            <Card key={c.label} style={{ flex: 1, padding: '22px 24px', opacity: Math.min(1, pop * 2), transform: `translateY(${(1 - pop) * 40}px)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: COLORS.muted, textTransform: 'uppercase' }}>{c.pct ?? c.label}</span>
                <span style={{ width: 38, height: 38, borderRadius: 19, background: COLORS.rose, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 14, height: 14, borderRadius: 4, background: COLORS.primary }} /></span>
              </div>
              <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 12, lineHeight: 1 }}>{Math.round(c.value * p)}</div>
              <div style={{ fontSize: 20, color: COLORS.muted, marginTop: 6, fontWeight: 500 }}>{c.label}</div>
            </Card>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
        <Card style={{ flex: 1, padding: '28px 34px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 22 }}>Étudiants par filière</div>
          {STATS.parFiliere.map(([n, v], i) => {
            const p = prog(f, 56 + i * 7, 56 + i * 7 + 34, E.out);
            return (
              <div key={n} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 600, marginBottom: 8 }}><span>{n}</span><span>{Math.round(v * p)} <span style={{ color: COLORS.muted, fontWeight: 400, fontSize: 17 }}>étudiants</span></span></div>
                <div style={{ height: 14, borderRadius: 7, background: '#f3f4f6', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(v / maxF) * 100 * p}%`, background: COLORS.primary, borderRadius: 7 }} /></div>
              </div>
            );
          })}
        </Card>
        <Card style={{ flex: 1, padding: '28px 34px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 14 }}>Étudiants par niveau</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, height: 290 }}>
            {STATS.parNiveau.map(([n, v], i) => {
              const p = prog(f, 62 + i * 7, 62 + i * 7 + 36, E.out);
              return (
                <div key={n} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, opacity: p }}>{Math.round(v * p)}</div>
                  <div style={{ width: '100%', height: 200, background: '#f3f4f6', borderRadius: 12, position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${(v / maxN) * 100 * p}%`, background: COLORS.primary, borderRadius: 12 }} />
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12 }}>{n}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
