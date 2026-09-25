import {Easing, interpolate} from 'remotion';
import type {PitchPoint, TacticalKitPlayer, TacticalMove, TacticalPlayer} from '../types';
import {clampPoint, playerPoint, resolvePoint} from './geometry';

const tacticalEase = Easing.bezier(0.16, 1, 0.3, 1);

export const tacticalProgress = (frame: number, startFrame: number, durationInFrames: number): number =>
  interpolate(frame, [startFrame, startFrame + Math.max(1, durationInFrames)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: tacticalEase});

export const moveProgress = (frame: number, move: TacticalMove): number => tacticalProgress(frame, move.startFrame, move.durationInFrames);

export const interpolatePoint = (from: PitchPoint, to: PitchPoint, progress: number): PitchPoint => ({
  x: from.x + (to.x - from.x) * progress,
  y: from.y + (to.y - from.y) * progress,
});

export const positionAtMove = (frame: number, move: TacticalMove): PitchPoint =>
  clampPoint(interpolatePoint(resolvePoint(move.from), resolvePoint(move.to), moveProgress(frame, move)));

export interface TacticalPlayerState {
  point: PitchPoint;
  activeMove?: TacticalMove;
  moveProgress: number;
}

const playerIdOf = (player: TacticalPlayer | TacticalKitPlayer): string => player.id;
const pointOf = (player: TacticalPlayer | TacticalKitPlayer): PitchPoint => 'position' in player ? resolvePoint(player.position) : playerPoint(player);

/**
 * Resolve all moves for a player in timeline order. A later action starts
 * from the previous action's destination, while the explicit `from` remains
 * the source drawn in the evidence plan.
 */
export const positionForPlayer = (frame: number, player: TacticalPlayer | TacticalKitPlayer, movements: TacticalMove[] = []): TacticalPlayerState => {
  const moves = movements.filter((move) => move.playerId === playerIdOf(player)).sort((a, b) => a.startFrame - b.startFrame);
  let point = pointOf(player);
  let activeMove: TacticalMove | undefined;
  let progress = 0;
  for (const move of moves) {
    if (frame < move.startFrame) break;
    if (frame <= move.startFrame + move.durationInFrames) {
      activeMove = move;
      progress = moveProgress(frame, move);
      point = positionAtMove(frame, move);
      break;
    }
    point = resolvePoint(move.to);
  }
  return {point, activeMove, moveProgress: progress};
};

export const trailPath = (frame: number, move: TacticalMove, samples = 8): PitchPoint[] => {
  const progress = moveProgress(frame, move);
  const count = Math.max(2, samples);
  return Array.from({length: count}, (_, index) => {
    const sample = progress * (index / (count - 1));
    return interpolatePoint(resolvePoint(move.from), resolvePoint(move.to), sample);
  });
};

