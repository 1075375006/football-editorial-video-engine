import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {TacticalArrow, TacticalPlayer, TacticalZone} from '../types';
import {lineDrawProgress, tacticalBuildProgress} from '../motion/presets';
import {FEE_COLORS} from '../motion/tokens';

export const TacticalPitch: React.FC<{players: TacticalPlayer[]; zones?: TacticalZone[]; arrows?: TacticalArrow[]; start?: number; muted?: boolean}> = ({players, zones = [], arrows = [], start = 0, muted = false}) => {
  const frame = useCurrentFrame();
  const build = tacticalBuildProgress(frame, start);
  const line = lineDrawProgress(frame, start + 24);
  const field = muted ? '#6D7567' : '#3E6B4A';
  return <div style={{position: 'absolute', inset: '16% 7% 11%', border: `3px solid ${FEE_COLORS.paper}`, background: field, opacity: muted ? 0.4 : 1, transform: 'skewY(-2deg)', zIndex: 3}}>
    <svg viewBox="0 0 100 62" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <rect x="0" y="0" width="100" height="62" fill="none" stroke={FEE_COLORS.paper} strokeWidth="0.7" />
      <line x1="50" y1="0" x2="50" y2="62" stroke={FEE_COLORS.paper} strokeWidth="0.55" />
      <circle cx="50" cy="31" r="9" fill="none" stroke={FEE_COLORS.paper} strokeWidth="0.55" />
      <rect x="0" y="17" width="14" height="28" fill="none" stroke={FEE_COLORS.paper} strokeWidth="0.55" />
      <rect x="86" y="17" width="14" height="28" fill="none" stroke={FEE_COLORS.paper} strokeWidth="0.55" />
      {zones.map((zone) => <g key={zone.id} opacity={Math.min(1, build * 1.35)}><rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill={zone.tone === 'warning' ? FEE_COLORS.warning : zone.tone === 'teamB' ? FEE_COLORS.teamB : zone.tone === 'teamA' ? FEE_COLORS.teamA : FEE_COLORS.accent} opacity="0.7" /><text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2} textAnchor="middle" fontSize="2.6" fill={FEE_COLORS.ink} fontFamily="Arial Black, Arial, sans-serif">{zone.label}</text></g>)}
      {arrows.map((arrow) => <g key={arrow.id} opacity={line}><line x1={arrow.from[0]} y1={arrow.from[1]} x2={arrow.from[0] + (arrow.to[0] - arrow.from[0]) * line} y2={arrow.from[1] + (arrow.to[1] - arrow.from[1]) * line} stroke={FEE_COLORS.accent} strokeWidth="1.2" markerEnd="url(#pitch-arrow)" /><text x={arrow.to[0]} y={arrow.to[1] - 2} textAnchor="middle" fill={FEE_COLORS.accent} fontSize="2.6" fontFamily="Arial Black, Arial, sans-serif">{arrow.label}</text></g>)}
      <defs><marker id="pitch-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill={FEE_COLORS.accent} /></marker></defs>
    </svg>
    {players.map((player, index) => <div key={player.id} style={{position: 'absolute', left: `${player.x}%`, top: `${player.y}%`, translate: '-50% -50%', opacity: Math.min(1, Math.max(0, build * players.length - index * 0.12)), textAlign: 'center'}}><div style={{width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', background: player.team === 'A' ? FEE_COLORS.teamA : FEE_COLORS.teamB, color: FEE_COLORS.white, border: `3px solid ${FEE_COLORS.paper}`, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 17}}>{player.label}</div>{player.role ? <div style={{fontSize: 13, color: FEE_COLORS.white, marginTop: 4, whiteSpace: 'nowrap'}}>{player.role}</div> : null}</div>)}
  </div>;
};
