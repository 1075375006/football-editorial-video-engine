import React from 'react';
import {useCurrentFrame} from 'remotion';
import {lineDrawProgress} from '../motion/presets';
import {FEE_COLORS} from '../motion/tokens';

export const Annotation: React.FC<{type: 'arrow' | 'circle' | 'line' | 'label'; from?: [number, number]; to?: [number, number]; label?: string; start?: number; color?: string}> = ({type, from = [20, 50], to = [80, 40], label, start = 0, color = FEE_COLORS.accent}) => {
  const frame = useCurrentFrame();
  const p = lineDrawProgress(frame, start);
  const [x1, y1] = from;
  const [x2, y2] = to;
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 5}}>
    <defs><marker id="fee-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill={color} /></marker></defs>
    {type === 'circle' ? <circle cx={x1} cy={y1} r={Math.max(0, 13 * p)} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" /> : null}
    {type === 'line' || type === 'arrow' ? <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth="1.5" markerEnd={type === 'arrow' ? 'url(#fee-arrow)' : undefined} /> : null}
    {type === 'label' && label ? <foreignObject x={x1} y={y1} width="40" height="12"><div style={{fontFamily: 'Arial, sans-serif', fontSize: 4, color, background: FEE_COLORS.ink, padding: 2}}>{label}</div></foreignObject> : null}
    {type !== 'label' && label ? <text x={x2} y={y2 - 2} fill={color} fontSize="4" fontFamily="Arial Black, Arial, sans-serif">{label}</text> : null}
  </svg>;
};
