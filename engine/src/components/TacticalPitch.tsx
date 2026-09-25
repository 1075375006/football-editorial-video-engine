import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {
  AttackDirection,
  PitchCrop,
  PitchPoint,
  TacticalAnnotation,
  TacticalArrow,
  TacticalBall,
  TacticalKitPlayer,
  TacticalKitZone,
  TacticalMove,
  TacticalPerspective,
  TacticalPlayer,
  TacticalTheme,
  TacticalZone,
} from '../types';
import {lineDrawProgress, tacticalBuildProgress} from '../motion/presets';
import {FEE_COLORS} from '../motion/tokens';
import {positionForPlayer, trailPath, tacticalProgress} from '../tactical/motion';
import {
  DETAIL_PITCH_CROP,
  FULL_PITCH_CROP,
  PITCH_LENGTH,
  PITCH_WIDTH,
  mapPointToCrop,
  orientPoint,
  orientRect,
  playerPoint,
  resolvePoint,
  zoneRect,
} from '../tactical/geometry';

type PitchPlayer = TacticalPlayer | TacticalKitPlayer;
type PitchZone = TacticalZone | TacticalKitZone;

export interface TacticalPitchProps {
  players: PitchPlayer[];
  movements?: TacticalMove[];
  zones?: PitchZone[];
  arrows?: TacticalArrow[];
  annotations?: TacticalAnnotation[];
  ball?: TacticalBall;
  perspective?: TacticalPerspective;
  theme?: TacticalTheme;
  attackDirection?: AttackDirection;
  crop?: PitchCrop;
  focusPlayerIds?: string[];
  focusZoneId?: string;
  showPlayerLabels?: boolean;
  start?: number;
  /** Composition frame at which the current scene starts. */
  frameOffset?: number;
  muted?: boolean;
}

interface ThemeTokens {
  field: string;
  line: string;
  text: string;
  markerA: string;
  markerB: string;
  markerNeutral: string;
  accent: string;
  zoneOpacity: number;
  texture: string;
}

const THEMES: Record<TacticalTheme, ThemeTokens> = {
  'editorial-green': {
    field: '#3E6B4A',
    line: FEE_COLORS.paper,
    text: FEE_COLORS.white,
    markerA: FEE_COLORS.teamA,
    markerB: FEE_COLORS.teamB,
    markerNeutral: FEE_COLORS.ink,
    accent: FEE_COLORS.accent,
    zoneOpacity: 0.7,
    texture: 'repeating-linear-gradient(104deg, rgba(255,255,255,.035) 0 2px, transparent 2px 9px)',
  },
  'paper-tactical': {
    field: '#D7C7A5',
    line: FEE_COLORS.ink,
    text: FEE_COLORS.ink,
    markerA: FEE_COLORS.teamA,
    markerB: FEE_COLORS.teamB,
    markerNeutral: FEE_COLORS.muted,
    accent: FEE_COLORS.out,
    zoneOpacity: 0.55,
    texture: 'repeating-linear-gradient(0deg, rgba(31,30,27,.035) 0 1px, transparent 1px 5px)',
  },
  'mono-focus': {
    field: '#64655F',
    line: '#F4F0E5',
    text: '#F4F0E5',
    markerA: '#D9D5C8',
    markerB: '#9F9D96',
    markerNeutral: '#4B4C49',
    accent: FEE_COLORS.accent,
    zoneOpacity: 0.86,
    texture: 'repeating-linear-gradient(135deg, rgba(255,255,255,.028) 0 2px, transparent 2px 8px)',
  },
};

const toneColor = (tone: TacticalZone['tone'] | TacticalAnnotation['tone'] | TacticalArrow['tone'] | undefined, theme: ThemeTokens): string => {
  if (tone === 'warning') return FEE_COLORS.warning;
  if (tone === 'teamA') return FEE_COLORS.teamA;
  if (tone === 'teamB') return FEE_COLORS.teamB;
  return theme.accent;
};

const normalizedPlayer = (player: PitchPlayer): TacticalKitPlayer => {
  if ('position' in player && player.position) {
    return {
      id: player.id,
      label: player.label,
      position: resolvePoint(player.position),
      team: player.team,
      role: player.role,
      name: player.name,
      emphasis: player.emphasis,
      buildOrder: player.buildOrder,
    } as TacticalKitPlayer;
  }
  const legacy = player as TacticalPlayer;
  return {
    id: legacy.id,
    label: legacy.label,
    position: playerPoint(legacy),
    team: legacy.team,
    role: legacy.role,
    name: legacy.name,
    emphasis: legacy.emphasis,
    buildOrder: legacy.buildOrder,
  };
};

const rawSvgPoint = (point: PitchPoint, direction: AttackDirection): [number, number] => {
  const oriented = orientPoint(point, direction);
  return [oriented.x * PITCH_LENGTH, oriented.y * PITCH_WIDTH];
};

const rawSvgRect = (rect: {x: number; y: number; width: number; height: number}, direction: AttackDirection) => {
  const oriented = orientRect(rect, direction);
  return {x: oriented.x * PITCH_LENGTH, y: oriented.y * PITCH_WIDTH, width: oriented.width * PITCH_LENGTH, height: oriented.height * PITCH_WIDTH};
};

const linePath = (points: PitchPoint[], direction: AttackDirection): string => points.map((point, index) => {
  const [x, y] = rawSvgPoint(point, direction);
  return `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`;
}).join(' ');

const pointVisibleInCrop = (point: PitchPoint, crop: PitchCrop, direction: AttackDirection): boolean => {
  const mapped = mapPointToCrop(point, crop, direction);
  return mapped.x > -0.12 && mapped.x < 1.12 && mapped.y > -0.12 && mapped.y < 1.12;
};

/**
 * The reusable Tactical Pitch Kit. Geometry is always drawn as SVG; HTML
 * markers and labels are positioned from the same normalized coordinate map.
 * This makes a scene portable between aspect ratios, crops and attack sides.
 */
export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  players,
  movements = [],
  zones = [],
  arrows = [],
  annotations = [],
  ball,
  perspective = 'top',
  theme = 'editorial-green',
  attackDirection = 'left-to-right',
  crop,
  focusPlayerIds = [],
  focusZoneId,
  showPlayerLabels = false,
  start = 0,
  frameOffset = 0,
  muted = false,
}) => {
  const compositionFrame = useCurrentFrame();
  const frame = compositionFrame - frameOffset;
  const tokens = THEMES[theme];
  const effectiveCrop = crop ?? (perspective === 'detail' ? DETAIL_PITCH_CROP : FULL_PITCH_CROP);
  const orientedCrop = orientRect(effectiveCrop, attackDirection);
  const line = lineDrawProgress(frame, start + 36);
  const normalizedPlayers = players.map(normalizedPlayer).sort((a, b) => (a.buildOrder ?? 0) - (b.buildOrder ?? 0));
  const focused = focusPlayerIds.length > 0;
  const perspectiveTransform = perspective === 'isometric' ? 'perspective(900px) rotateX(11deg) rotateZ(-2deg)' : perspective === 'detail' ? 'scale(1.04)' : undefined;
  const focusFade = focused ? tacticalProgress(frame, start + 18, 18) : 0;
  const pitchOpacity = muted ? 0.38 : 1;
  const pitchFilter = muted ? 'grayscale(.72)' : focusFade > 0 ? `grayscale(${(focusFade * 0.72).toFixed(2)})` : undefined;

  const markerColor = (player: TacticalKitPlayer): string => player.team === 'A' ? tokens.markerA : player.team === 'B' ? tokens.markerB : tokens.markerNeutral;
  const mappedCss = (point: PitchPoint): React.CSSProperties => {
    const mapped = mapPointToCrop(point, effectiveCrop, attackDirection);
    return {left: `${mapped.x * 100}%`, top: `${mapped.y * 100}%`};
  };

  return <div style={{position: 'absolute', inset: '16% 7% 11%', border: `3px solid ${tokens.line}`, background: tokens.field, opacity: pitchOpacity, transform: perspectiveTransform, transformOrigin: '50% 50%', zIndex: 3, overflow: 'hidden', filter: pitchFilter}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: tokens.texture, pointerEvents: 'none', zIndex: 1}} />
    <svg viewBox={`${orientedCrop.x * PITCH_LENGTH} ${orientedCrop.y * PITCH_WIDTH} ${orientedCrop.width * PITCH_LENGTH} ${orientedCrop.height * PITCH_WIDTH}`} preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2}}>
      <defs>
        <marker id="tactical-pitch-arrow" markerWidth="5" markerHeight="5" refX="4.6" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 z" fill={tokens.accent} />
        </marker>
      </defs>
      <rect x="0" y="0" width={PITCH_LENGTH} height={PITCH_WIDTH} fill="none" stroke={tokens.line} strokeWidth="0.7" />
      <line x1="50" y1="0" x2="50" y2={PITCH_WIDTH} stroke={tokens.line} strokeWidth="0.55" />
      <circle cx="50" cy="31" r="9" fill="none" stroke={tokens.line} strokeWidth="0.55" />
      <circle cx="50" cy="31" r="0.8" fill={tokens.line} />
      <rect x="0" y="17" width="14" height="28" fill="none" stroke={tokens.line} strokeWidth="0.55" />
      <rect x="86" y="17" width="14" height="28" fill="none" stroke={tokens.line} strokeWidth="0.55" />
      <rect x="0" y="24" width="6" height="14" fill="none" stroke={tokens.line} strokeWidth="0.55" />
      <rect x="94" y="24" width="6" height="14" fill="none" stroke={tokens.line} strokeWidth="0.55" />
      <circle cx="11" cy="31" r="0.65" fill={tokens.line} />
      <circle cx="89" cy="31" r="0.65" fill={tokens.line} />
      <path d="M14 22 A9 9 0 0 1 14 40" fill="none" stroke={tokens.line} strokeWidth="0.55" />
      <path d="M86 22 A9 9 0 0 0 86 40" fill="none" stroke={tokens.line} strokeWidth="0.55" />
      <path d="M0 24 L-2 24 L-2 38 L0 38 M100 24 L102 24 L102 38 L100 38" fill="none" stroke={tokens.line} strokeWidth="0.65" />

      {zones.map((zone) => {
        const rect = zoneRect(zone);
        const svgRect = rawSvgRect(rect, attackDirection);
        const zoneStart = 'startFrame' in zone && zone.startFrame !== undefined ? zone.startFrame : start + 20;
        const zoneEnd = 'endFrame' in zone && zone.endFrame !== undefined ? zone.endFrame : Number.POSITIVE_INFINITY;
        const zoneReveal = tacticalProgress(frame, zoneStart, 14);
        const visible = frame >= zoneStart && frame <= zoneEnd;
        const isFocus = focusZoneId === zone.id || ('focus' in zone && zone.focus);
        return <g key={zone.id} opacity={visible ? zoneReveal : frame > zoneEnd ? 0 : 0}>
          <rect x={svgRect.x} y={svgRect.y} width={svgRect.width} height={svgRect.height} fill={toneColor(zone.tone, tokens)} opacity={(zone.opacity ?? tokens.zoneOpacity) * (isFocus ? 1 : focused ? 0.68 : 1)} />
          {zone.label ? <text x={svgRect.x + svgRect.width / 2} y={svgRect.y + svgRect.height / 2} textAnchor="middle" dominantBaseline="middle" fontSize="2.7" fill={tokens.text} fontFamily="Arial Black, Arial, sans-serif" letterSpacing="0.25">{zone.label}</text> : null}
        </g>;
      })}

      {movements.filter((move) => move.showTrail).map((move) => {
        const progress = moveProgressForDraw(frame, move);
        if (progress <= 0) return null;
        const points = trailPath(frame, move);
        const fullPath = linePath([resolvePoint(move.from), resolvePoint(move.to)], attackDirection);
        return <g key={`trail-${move.id}`} opacity={Math.min(1, progress * 1.2)}>
          <path d={fullPath} fill="none" stroke={tokens.accent} strokeWidth="1.05" strokeDasharray="2.2 1.4" opacity="0.62" />
          <path d={linePath(points, attackDirection)} fill="none" stroke={tokens.accent} strokeWidth="1.55" markerEnd="url(#tactical-pitch-arrow)" />
        </g>;
      })}

      {arrows.map((arrow) => {
        const arrowStart = arrow.startFrame ?? start + 36;
        const arrowProgress = tacticalProgress(frame, arrowStart, arrow.durationInFrames ?? 18);
        const from = Array.isArray(arrow.from) ? {x: arrow.from[0], y: arrow.from[1]} : arrow.from;
        const to = Array.isArray(arrow.to) ? {x: arrow.to[0], y: arrow.to[1]} : arrow.to;
        const [fromX, fromY] = rawSvgPoint(from, attackDirection);
        const [toX, toY] = rawSvgPoint(to, attackDirection);
        const endX = fromX + (toX - fromX) * arrowProgress;
        const endY = fromY + (toY - fromY) * arrowProgress;
        return <g key={arrow.id} opacity={arrowProgress * line}>
          <line x1={fromX} y1={fromY} x2={endX} y2={endY} stroke={toneColor(arrow.tone, tokens)} strokeWidth="1.15" strokeDasharray={arrow.dashed ? '2 1.5' : undefined} markerEnd="url(#tactical-pitch-arrow)" />
          {arrow.label ? <text x={endX} y={endY - 2} textAnchor="middle" fill={toneColor(arrow.tone, tokens)} fontSize="2.65" fontFamily="Arial Black, Arial, sans-serif">{arrow.label}</text> : null}
        </g>;
      })}

      {annotations.map((annotation) => {
        const annotationStart = annotation.startFrame ?? start + 44;
        const annotationProgress = tacticalProgress(frame, annotationStart, annotation.durationInFrames ?? 14);
        const color = toneColor(annotation.tone, tokens);
        if (annotation.type === 'circle' && annotation.point) {
          const [x, y] = rawSvgPoint(annotation.point, attackDirection);
          return <g key={annotation.id} opacity={annotationProgress}><circle cx={x} cy={y} r={5 + 3 * annotationProgress} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 1" />{annotation.label ? <text x={x} y={y - 7} textAnchor="middle" fill={color} fontSize="2.7" fontFamily="Arial Black, Arial, sans-serif">{annotation.label}</text> : null}</g>;
        }
        if (annotation.type === 'line' && annotation.from && annotation.to) {
          const [fromX, fromY] = rawSvgPoint(annotation.from, attackDirection);
          const [toX, toY] = rawSvgPoint(annotation.to, attackDirection);
          return <line key={annotation.id} x1={fromX} y1={fromY} x2={fromX + (toX - fromX) * annotationProgress} y2={fromY + (toY - fromY) * annotationProgress} stroke={color} strokeWidth="0.9" opacity={annotationProgress} />;
        }
        return null;
      })}
    </svg>

    {focusFade > 0 ? <div style={{position: 'absolute', inset: 0, background: 'rgba(24, 25, 22, .48)', opacity: focusFade, pointerEvents: 'none', zIndex: 4}} /> : null}

    {normalizedPlayers.map((player, index) => {
      const state = positionForPlayer(frame, player, movements);
      const reveal = tacticalBuildProgress(frame, start + (player.buildOrder ?? index) * 5);
      const isFocused = !focused || focusPlayerIds.includes(player.id);
      const emphasis = player.emphasis === 'primary' ? 1.15 : player.emphasis === 'muted' ? 0.84 : 1;
      const visibleInCrop = pointVisibleInCrop(state.point, effectiveCrop, attackDirection);
      if (!visibleInCrop && perspective === 'detail') return null;
      const focusOpacity = isFocused ? 1 : 1 - focusFade * 0.72;
      return <div key={player.id} style={{position: 'absolute', ...mappedCss(state.point), transform: 'translate(-50%, -50%)', opacity: reveal * focusOpacity * (muted ? 0.74 : 1), filter: isFocused ? undefined : `grayscale(${focusFade.toFixed(2)})`, zIndex: player.emphasis === 'primary' ? 8 : 6, textAlign: 'center', pointerEvents: 'none'}}>
        <div style={{width: 36 * emphasis, height: 36 * emphasis, borderRadius: '50%', display: 'grid', placeItems: 'center', background: markerColor(player), color: tokens.text, border: `3px solid ${tokens.line}`, fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 16 * emphasis, boxSizing: 'border-box'}}>{player.label}</div>
        {(showPlayerLabels || player.name || player.role) ? <div style={{fontSize: player.emphasis === 'primary' ? 15 : 12, color: tokens.text, marginTop: 4, whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif', textShadow: theme === 'editorial-green' ? '0 1px 1px rgba(0,0,0,.25)' : undefined}}>{player.name ?? player.role}</div> : null}
        {state.activeMove?.annotation && state.moveProgress > 0.35 ? <div style={{fontSize: 11, color: tokens.accent, marginTop: 2, whiteSpace: 'nowrap', fontFamily: 'Arial Black, Arial, sans-serif'}}>{state.activeMove.annotation}</div> : null}
      </div>;
    })}

    {ball ? <div style={{position: 'absolute', ...mappedCss(resolvePoint(ball.position)), transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: FEE_COLORS.white, border: `2px solid ${tokens.line}`, zIndex: 9, display: 'grid', placeItems: 'center', color: FEE_COLORS.ink, fontSize: 8}}>•</div> : null}
  </div>;
};

const moveProgressForDraw = (frame: number, move: TacticalMove): number => {
  const moveProgress = tacticalProgress(frame, move.startFrame, move.durationInFrames);
  const drawProgress = tacticalProgress(frame, move.startFrame + 18, 18);
  return Math.max(moveProgress, drawProgress);
};

/** Explicit alias for callers that want the kit name from the design doc. */
export const TacticalPitchKit = TacticalPitch;
