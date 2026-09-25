export const SCENE_PATTERNS = [
  'HOOK-01',
  'HOOK-02',
  'CTX-01',
  'STAKES-01',
  'TEAM-01',
  'FORM-01',
  'PLAYER-01',
  'DUEL-01',
  'TACT-01',
  'TACT-02',
  'TACT-03',
  'DATA-01',
  'HIST-01',
  'OUT-01',
] as const;

export type ScenePattern = (typeof SCENE_PATTERNS)[number];

export const MOTION_PRESETS = [
  'M01 editorial-slam',
  'M02 cutout-reveal',
  'M03 stagger-stack',
  'M04 graphic-wipe',
  'M05 focus-push',
  'M06 number-punch',
  'M07 tactical-build',
  'M08 line-draw',
  'M09 parallax-drift',
] as const;

export type MotionPreset = (typeof MOTION_PRESETS)[number];
export type AnnotationType = 'arrow' | 'circle' | 'zone' | 'line' | 'label';

export type Layer = 'L0 Environment' | 'L1 Subject' | 'L2 Information' | 'L3 Annotation';

export interface SceneSubject {
  id: string;
  assetId?: string;
  generationPrompt?: string;
  label?: string;
  team?: 'A' | 'B' | 'neutral';
  side?: 'left' | 'right' | 'center';
}

export interface SceneAnnotation {
  type: AnnotationType;
  target?: string;
  label?: string;
  from?: [number, number];
  to?: [number, number];
}

export interface SceneSpec {
  id: string;
  pattern: ScenePattern;
  startFrame: number;
  durationInFrames: number;
  narration: string;
  environment?: {
    assetId?: string;
    generationPrompt?: string;
  };
  subjects?: SceneSubject[];
  information: {
    headline?: string;
    body?: string;
    stats?: Record<string, string | number>;
  };
  annotations?: SceneAnnotation[];
  motionPreset: MotionPreset[];
  evidence?: EvidenceSpec;
}

export interface SceneDocument {
  schemaVersion: '0.1';
  fps: number;
  width: number;
  height: number;
  scenes: SceneSpec[];
}

export type EvidenceMotif =
  | 'contrast'
  | 'trend-strip'
  | 'delta'
  | 'availability'
  | 'history-timeline'
  | 'spatial-impact';

export interface EvidenceSpec {
  motif: EvidenceMotif;
  claim: string;
  metric?: {
    key: string;
    label: string;
    unit?: string;
    format: 'integer' | 'decimal-1' | 'percent' | 'text';
  };
  subjects?: string[];
  values?: Record<string, number | string>;
  period: {
    label: string;
    from?: string;
    to?: string;
  };
  scope?: {
    competition?: string;
    venue?: 'home' | 'away' | 'all';
    sampleSize?: number;
    denominator?: string;
  };
  source: {
    provider: string;
    asOf: string;
  };
  emphasis?: string;
}

export interface TacticalPlayer {
  id: string;
  label: string;
  x: number;
  y: number;
  team: 'A' | 'B';
  role?: string;
}

export interface TacticalZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  tone?: 'accent' | 'warning' | 'teamA' | 'teamB';
}

export interface TacticalArrow {
  id: string;
  from: [number, number];
  to: [number, number];
  label?: string;
}

export interface AssetRequest {
  type: 'ENV-STADIUM' | 'ENV-CITY' | 'ENV-HISTORY' | 'SUB-PLAYER' | 'SUB-COACH' | 'SUB-TROPHY' | 'SUB-STADIUM';
  subject: string;
  pose?: string;
  orientation?: string;
  treatment?: string;
  notes?: string;
}

export type NarrativeRole = 'HOOK' | 'CONTEXT' | 'EVIDENCE' | 'EXPLANATION' | 'SYNTHESIS';
