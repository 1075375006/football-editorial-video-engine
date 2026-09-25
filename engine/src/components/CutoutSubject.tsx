import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {cutoutReveal, parallaxOffset} from '../motion/presets';
import {FEE_COLORS} from '../motion/tokens';

export const CutoutSubject: React.FC<{
  name: string;
  team?: 'A' | 'B' | 'neutral';
  side?: 'left' | 'right' | 'center';
  assetUrl?: string;
  sceneStart?: number;
  sceneDuration?: number;
  revealStart?: number;
}> = ({name, team = 'neutral', side = 'center', assetUrl, sceneStart = 0, sceneDuration = 150, revealStart = 0}) => {
  const frame = useCurrentFrame();
  const reveal = cutoutReveal(frame, revealStart);
  const x = parallaxOffset(frame, sceneStart, sceneDuration, 'subject');
  const accent = team === 'A' ? FEE_COLORS.teamA : team === 'B' ? FEE_COLORS.teamB : FEE_COLORS.accent;
  const horizontal = side === 'left' ? '18%' : side === 'right' ? '72%' : '50%';
  return (
    <div style={{position: 'absolute', left: horizontal, bottom: '8%', width: 360, height: 650, translate: `calc(-50% + ${x}px) 0`, opacity: reveal.opacity, clipPath: reveal.clipPath, zIndex: 2}}>
      {assetUrl ? <Img src={assetUrl} style={{width: '100%', height: '100%', objectFit: 'contain'}} /> : (
        <div style={{position: 'relative', width: '100%', height: '100%', filter: 'drop-shadow(18px 18px 0 rgba(31,30,27,.12))'}}>
          <div style={{position: 'absolute', top: 28, left: 116, width: 118, height: 118, borderRadius: '50%', background: accent, border: `9px solid ${FEE_COLORS.ink}`}} />
          <div style={{position: 'absolute', top: 142, left: 72, width: 210, height: 340, background: accent, clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)', border: `9px solid ${FEE_COLORS.ink}`}} />
          <div style={{position: 'absolute', top: 450, left: 85, width: 72, height: 180, background: FEE_COLORS.ink, transform: 'rotate(7deg)'}} />
          <div style={{position: 'absolute', top: 450, left: 205, width: 72, height: 180, background: FEE_COLORS.ink, transform: 'rotate(-7deg)'}} />
          <div style={{position: 'absolute', left: 36, bottom: 0, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 23, letterSpacing: 1, color: FEE_COLORS.ink, background: FEE_COLORS.paper, padding: '8px 12px', transform: 'rotate(-4deg)'}}>{name}</div>
        </div>
      )}
    </div>
  );
};
