import React from 'react';
import {useCurrentFrame} from 'remotion';
import {editorialSlam} from '../motion/presets';
import {FEE_COLORS} from '../motion/tokens';

export const BigHeadline: React.FC<{children: React.ReactNode; size?: number; align?: 'left' | 'center' | 'right'; start?: number; color?: string; maxWidth?: number}> = ({children, size = 92, align = 'left', start = 0, color = FEE_COLORS.ink, maxWidth = 1100}) => {
  const frame = useCurrentFrame();
  const style = editorialSlam(frame, start);
  return <div style={{...style, maxWidth, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: size, lineHeight: 0.9, letterSpacing: -3, textTransform: 'uppercase', textAlign: align, color}}>{children}</div>;
};
