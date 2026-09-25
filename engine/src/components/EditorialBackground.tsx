import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FEE_COLORS} from '../motion/tokens';
import {parallaxOffset} from '../motion/presets';

export const EditorialBackground: React.FC<{sceneStart?: number; sceneDuration?: number; tone?: 'paper' | 'dark' | 'field'; children?: React.ReactNode}> = ({sceneStart = 0, sceneDuration = 150, tone = 'paper', children}) => {
  const frame = useCurrentFrame();
  const x = parallaxOffset(frame, sceneStart, sceneDuration, 'environment');
  const backgroundColor = tone === 'dark' ? FEE_COLORS.ink : tone === 'field' ? '#3E6B4A' : FEE_COLORS.paper;
  return (
    <AbsoluteFill style={{backgroundColor, color: tone === 'dark' || tone === 'field' ? FEE_COLORS.white : FEE_COLORS.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateX(${x}px)`, opacity: tone === 'paper' ? 0.42 : 0.18, backgroundImage: tone === 'field' ? 'repeating-linear-gradient(0deg, transparent 0 54px, rgba(255,255,255,.14) 55px), repeating-linear-gradient(90deg, transparent 0 84px, rgba(255,255,255,.12) 85px)' : 'radial-gradient(circle at 20% 15%, rgba(255,255,255,.55) 0 1px, transparent 1.5px), repeating-linear-gradient(0deg, rgba(31,30,27,.06) 0 1px, transparent 1px 5px)', backgroundSize: 'auto, auto'}} />
      <AbsoluteFill style={{padding: 72}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
