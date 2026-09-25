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
  tactical?: TacticalSceneSpec;
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
  /** Normalized pitch position (0..1). x/y are kept as a legacy adapter. */
  position?: PitchPoint;
  x?: number;
  y?: number;
  team: 'A' | 'B';
  role?: string;
  name?: string;
  emphasis?: 'primary' | 'secondary' | 'muted';
  buildOrder?: number;
}

export interface TacticalZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  tone?: 'accent' | 'warning' | 'teamA' | 'teamB';
  opacity?: number;
  startFrame?: number;
  endFrame?: number;
  focus?: boolean;
}

export interface TacticalArrow {
  id: string;
  from: [number, number] | PitchPoint;
  to: [number, number] | PitchPoint;
  label?: string;
  startFrame?: number;
  durationInFrames?: number;
  tone?: 'accent' | 'warning' | 'teamA' | 'teamB';
  dashed?: boolean;
}

/** A stable, normalized point on the pitch. */
export interface PitchPoint {
  x: number;
  y: number;
}

export interface PitchRect extends PitchPoint {
  width: number;
  height: number;
}

export type TacticalPerspective = 'top' | 'isometric' | 'detail';
export type TacticalTheme = 'editorial-green' | 'paper-tactical' | 'mono-focus';
export type AttackDirection = 'left-to-right' | 'right-to-left';

export type TacticalAction =
  | 'inside-run'
  | 'overlap'
  | 'cover'
  | 'drop'
  | 'press'
  | 'rotate'
  | 'switch';

/** A named football action that can be interpolated deterministically. */
export interface TacticalMove {
  id: string;
  playerId: string;
  action: TacticalAction;
  from: PitchPoint;
  to: PitchPoint;
  startFrame: number;
  durationInFrames: number;
  showTrail?: boolean;
  annotation?: string;
}

export interface TacticalKitPlayer {
  id: string;
  label: string;
  position: PitchPoint;
  team: 'A' | 'B' | 'neutral';
  role?: string;
  name?: string;
  emphasis?: 'primary' | 'secondary' | 'muted';
  buildOrder?: number;
}

export interface TacticalKitZone {
  id: string;
  rect: PitchRect;
  label?: string;
  tone?: 'accent' | 'warning' | 'teamA' | 'teamB';
  opacity?: number;
  startFrame?: number;
  endFrame?: number;
  focus?: boolean;
}

export interface TacticalAnnotation {
  id: string;
  type: 'label' | 'circle' | 'line' | 'callout';
  label?: string;
  point?: PitchPoint;
  from?: PitchPoint;
  to?: PitchPoint;
  targetId?: string;
  startFrame?: number;
  durationInFrames?: number;
  tone?: 'accent' | 'warning' | 'teamA' | 'teamB';
}

export interface TacticalBall {
  position: PitchPoint;
  label?: string;
  team?: 'A' | 'B' | 'neutral';
}

export interface PitchCrop extends PitchRect {}

export interface TacticalSceneSpec {
  perspective?: TacticalPerspective;
  theme?: TacticalTheme;
  attackDirection?: AttackDirection;
  crop?: PitchCrop;
  players?: Array<TacticalPlayer | TacticalKitPlayer>;
  movements?: TacticalMove[];
  zones?: Array<TacticalZone | TacticalKitZone>;
  arrows?: TacticalArrow[];
  annotations?: TacticalAnnotation[];
  ball?: TacticalBall;
  focusPlayerIds?: string[];
  focusZoneId?: string;
  muted?: boolean;
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
