import React from 'react';
import {useCurrentFrame} from 'remotion';
import {numberPunch} from '../motion/presets';
import {FEE_COLORS} from '../motion/tokens';

export const StatCard: React.FC<{label: string; value: string | number; detail?: string; tone?: 'A' | 'B' | 'accent' | 'muted'; start?: number}> = ({label, value, detail, tone = 'muted', start = 0}) => {
  const frame = useCurrentFrame();
  const style = numberPunch(frame, start);
  const color = tone === 'A' ? FEE_COLORS.teamA : tone === 'B' ? FEE_COLORS.teamB : tone === 'accent' ? FEE_COLORS.accent : FEE_COLORS.muted;
  return <div style={{...style, minWidth: 200, borderTop: `4px solid ${color}`, paddingTop: 14}}><div style={{fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: FEE_COLORS.muted}}>{label}</div><div style={{fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 64, lineHeight: 0.95, color: FEE_COLORS.ink}}>{value}</div>{detail ? <div style={{fontSize: 17, marginTop: 8, color: FEE_COLORS.muted}}>{detail}</div> : null}</div>;
};
