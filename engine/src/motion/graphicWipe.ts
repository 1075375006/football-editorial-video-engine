import {interpolate} from 'remotion';
import {MOTION_TOKENS} from './tokens';

export const graphicWipeProgress = (frame: number, start = 0): number =>
  interpolate(frame, [start, start + MOTION_TOKENS.graphicWipe.duration], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
