import {MOTION_PRESETS, SCENE_PATTERNS, type EvidenceSpec, type SceneDocument, type SceneSpec} from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export const validateEvidence = (evidence: unknown, path = 'evidence'): string[] => {
  const errors: string[] = [];
  if (!isRecord(evidence)) return [`${path} must be an object`];
  if (!isNonEmptyString(evidence.claim)) errors.push(`${path}.claim is required`);
  if (!isNonEmptyString(evidence.motif)) errors.push(`${path}.motif is required`);
  if (!isRecord(evidence.period) || !isNonEmptyString(evidence.period.label)) errors.push(`${path}.period.label is required`);
  if (!isRecord(evidence.source) || !isNonEmptyString(evidence.source.provider)) errors.push(`${path}.source.provider is required`);
  if (!isRecord(evidence.source) || !isNonEmptyString(evidence.source.asOf)) errors.push(`${path}.source.asOf is required`);
  if (isRecord(evidence.metric)) {
    if (!isNonEmptyString(evidence.metric.key)) errors.push(`${path}.metric.key is required`);
    if (!isNonEmptyString(evidence.metric.label)) errors.push(`${path}.metric.label is required`);
    if (!['integer', 'decimal-1', 'percent', 'text'].includes(String(evidence.metric.format))) {
      errors.push(`${path}.metric.format is invalid`);
    }
  }
  if (isRecord(evidence.scope) && evidence.scope.sampleSize !== undefined && (typeof evidence.scope.sampleSize !== 'number' || !Number.isInteger(evidence.scope.sampleSize) || evidence.scope.sampleSize < 1)) {
    errors.push(`${path}.scope.sampleSize must be a positive integer`);
  }
  return errors;
};

export const validateScene = (scene: unknown, index = 0): string[] => {
  const path = `scenes[${index}]`;
  const errors: string[] = [];
  if (!isRecord(scene)) return [`${path} must be an object`];
  if (!isNonEmptyString(scene.id)) errors.push(`${path}.id is required`);
  if (!SCENE_PATTERNS.includes(scene.pattern as (typeof SCENE_PATTERNS)[number])) errors.push(`${path}.pattern is not a supported Scene Pattern`);
  if (!Number.isInteger(scene.startFrame) || Number(scene.startFrame) < 0) errors.push(`${path}.startFrame must be a non-negative integer`);
  if (!Number.isInteger(scene.durationInFrames) || Number(scene.durationInFrames) <= 0) errors.push(`${path}.durationInFrames must be a positive integer`);
  if (!isNonEmptyString(scene.narration)) errors.push(`${path}.narration is required`);
  if (!isRecord(scene.information)) errors.push(`${path}.information is required`);
  if (!Array.isArray(scene.motionPreset) || scene.motionPreset.length === 0) errors.push(`${path}.motionPreset must contain at least one preset`);
  for (const [motionIndex, preset] of (Array.isArray(scene.motionPreset) ? scene.motionPreset : []).entries()) {
    if (!MOTION_PRESETS.includes(preset as (typeof MOTION_PRESETS)[number])) errors.push(`${path}.motionPreset[${motionIndex}] is not whitelisted`);
  }
  if (scene.evidence !== undefined) errors.push(...validateEvidence(scene.evidence, `${path}.evidence`));
  return errors;
};

export const validateSceneDocument = (document: unknown): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isRecord(document)) return {valid: false, errors: ['document must be an object'], warnings};
  if (document.schemaVersion !== '0.1') errors.push('schemaVersion must be "0.1"');
  if (!Number.isInteger(document.fps) || Number(document.fps) < 1) errors.push('fps must be a positive integer');
  if (!Number.isInteger(document.width) || !Number.isInteger(document.height) || Number(document.width) < 1 || Number(document.height) < 1) {
    errors.push('width and height must be positive integers');
  }
  if (!Array.isArray(document.scenes) || document.scenes.length === 0) errors.push('scenes must be a non-empty array');
  const scenes = Array.isArray(document.scenes) ? document.scenes : [];
  scenes.forEach((scene, index) => errors.push(...validateScene(scene, index)));
  const normalized = scenes
    .filter((scene): scene is Record<string, unknown> => isRecord(scene))
    .map((scene) => ({start: Number(scene.startFrame), end: Number(scene.startFrame) + Number(scene.durationInFrames)}))
    .sort((a, b) => a.start - b.start);
  for (let i = 1; i < normalized.length; i += 1) {
    if (normalized[i].start < normalized[i - 1].end) errors.push(`scenes overlap between sorted entries ${i - 1} and ${i}`);
  }
  if (normalized.length > 0 && normalized[0].start !== 0) warnings.push('first scene does not start at frame 0');
  return {valid: errors.length === 0, errors, warnings};
};

export const assertSceneDocument = (document: unknown): asserts document is SceneDocument => {
  const result = validateSceneDocument(document);
  if (!result.valid) throw new Error(result.errors.join('\n'));
};

export const assertScene = (scene: unknown): asserts scene is SceneSpec => {
  const errors = validateScene(scene);
  if (errors.length > 0) throw new Error(errors.join('\n'));
};
