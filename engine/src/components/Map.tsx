import React from 'react';
import {useCurrentFrame} from 'remotion';
import {lineDrawProgress} from '../motion/presets';
import {FEE_COLORS} from '../motion/tokens';

export const Map: React.FC<{place: string; start?: number}> = ({place, start = 0}) => {
  const frame = useCurrentFrame();
  const p = lineDrawProgress(frame, start);
  return <div style={{position: 'absolute', inset: '16% 8% 14%', overflow: 'hidden', background: 'linear-gradient(130deg, rgba(47,93,140,.25), transparent 45%), repeating-linear-gradient(35deg, transparent 0 42px, rgba(31,30,27,.15) 43px 45px)', border: `2px solid ${FEE_COLORS.ink}`, transform: 'rotate(-2deg)'}}><svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}><path d="M10 52 C 26 38, 34 40, 45 28 S 75 18, 90 7" fill="none" stroke={FEE_COLORS.teamA} strokeWidth="1.5" strokeDasharray={`${p * 100} 100`} /><circle cx="90" cy="7" r="3" fill={FEE_COLORS.accent} /><text x="66" y="17" fontSize="5" fill={FEE_COLORS.ink} fontFamily="Arial Black, Arial, sans-serif">{place}</text></svg></div>;
};
