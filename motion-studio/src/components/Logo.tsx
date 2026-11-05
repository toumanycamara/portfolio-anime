import React from 'react';
import { Img, staticFile } from 'remotion';

export const Logo: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img src={staticFile('logo-ecole221-hd.png')} style={{ width, height: 'auto', display: 'block', ...style }} />
);
