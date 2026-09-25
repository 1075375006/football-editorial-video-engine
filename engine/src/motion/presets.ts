import {Easing, interpolate} from 'remotion';
import {MOTION_TOKENS, clamp01} from './tokens';

const editorialEase = Easing.bezier(0.16, 1, 0.3, 1);

export const progress = (frame: number, start: number, duration: number, easing = editorialEase): number =>
  interpolate(frame, [start, start + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const editorialSlam = (frame: number, start = 0) => {
  const p = progress(frame, start, MOTION_TOKENS.editorialSlam.duration);
  return {opacity: p, scale: MOTION_TOKENS.editorialSlam.fromScale + p * (1 - MOTION_TOKENS.editorialSlam.fromScale), translate: `0px ${((1 - p) * MOTION_TOKENS.editorialSlam.rise).toFixed(2)}px`};
};

export const cutoutReveal = (frame: number, start = 0) => {
  const p = progress(frame, start, MOTION_TOKENS.cutoutReveal.duration);
  return {opacity: p, clipPath: `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`};
};

export const staggerStack = (frame: number, index: number, start = 0) => editorialSlam(frame, start + index * MOTION_TOKENS.staggerStack.offset);

export const numberPunch = (frame: number, start = 0) => {
  const p = progress(frame, start, MOTION_TOKENS.numberPunch.duration);
  return {opacity: p, scale: 0.88 + 0.12 * p};
};

export const focusPush = (frame: number, start = 0) => {
  const p = progress(frame, start, MOTION_TOKENS.focusPush.duration);
  return {scale: MOTION_TOKENS.focusPush.fromScale + p * (MOTION_TOKENS.focusPush.toScale - MOTION_TOKENS.focusPush.fromScale)};
};

export const tacticalBuildProgress = (frame: number, start = 0): number => clamp01(progress(frame, start, MOTION_TOKENS.tacticalBuild.duration));

export const lineDrawProgress = (frame: number, start = 0): number => clamp01(progress(frame, start, MOTION_TOKENS.lineDraw.duration));

export const parallaxOffset = (frame: number, sceneStart: number, sceneDuration: number, kind: 'environment' | 'subject'): number => {
  const p = progress(frame, sceneStart, sceneDuration, Easing.linear);
  return p * (kind === 'environment' ? MOTION_TOKENS.parallaxDrift.environmentX : MOTION_TOKENS.parallaxDrift.subjectX);
};
