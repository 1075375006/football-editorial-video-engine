export const FEE_FPS = 30;

export const FEE_COLORS = {
  paper: '#F1E9D8',
  paperDark: '#E4D9C2',
  ink: '#1F1E1B',
  muted: '#827B6E',
  teamA: '#E4572E',
  teamB: '#2F5D8C',
  accent: '#E6B84A',
  warning: '#D6902F',
  out: '#B9473D',
  white: '#FFFDF7',
} as const;

export const MOTION_TOKENS = {
  editorialSlam: {duration: 12, fromScale: 0.92, rise: 20},
  cutoutReveal: {duration: 16},
  staggerStack: {offset: 7},
  graphicWipe: {duration: 10},
  focusPush: {duration: 24, fromScale: 1, toScale: 1.04},
  numberPunch: {duration: 10},
  tacticalBuild: {duration: 48},
  lineDraw: {duration: 18},
  parallaxDrift: {environmentX: -12, subjectX: -25},
} as const;

export const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
