import type {AttackDirection, PitchCrop, PitchPoint, PitchRect, TacticalArrow, TacticalKitZone, TacticalPlayer, TacticalZone} from '../types';

export const PITCH_LENGTH = 100;
export const PITCH_WIDTH = 62;

export const FULL_PITCH_CROP: PitchCrop = {x: 0, y: 0, width: 1, height: 1};
export const DETAIL_PITCH_CROP: PitchCrop = {x: 0.42, y: 0.08, width: 0.56, height: 0.84};

export const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export const isNormalizedPoint = (point: unknown): point is PitchPoint => {
  if (!point || typeof point !== 'object') return false;
  const candidate = point as Partial<PitchPoint>;
  return typeof candidate.x === 'number' && typeof candidate.y === 'number' && Number.isFinite(candidate.x) && Number.isFinite(candidate.y) && candidate.x >= 0 && candidate.x <= 1 && candidate.y >= 0 && candidate.y <= 1;
};

export const clampPoint = (point: PitchPoint): PitchPoint => ({x: clamp01(point.x), y: clamp01(point.y)});

/** Converts the original 0..100 TacticalPitch input to the kit's 0..1 space. */
export const fromLegacyPercent = (point: PitchPoint): PitchPoint => ({x: point.x > 1 ? point.x / 100 : point.x, y: point.y > 1 ? point.y / 100 : point.y});

export const resolvePoint = (point?: PitchPoint): PitchPoint => {
  if (!point) return {x: 0.5, y: 0.5};
  return clampPoint(fromLegacyPercent(point));
};

export const orientPoint = (point: PitchPoint, direction: AttackDirection = 'left-to-right'): PitchPoint => {
  const normalized = resolvePoint(point);
  return direction === 'right-to-left' ? {x: 1 - normalized.x, y: normalized.y} : normalized;
};

export const orientRect = (rect: PitchRect, direction: AttackDirection = 'left-to-right'): PitchRect => {
  const normalized = {
    x: clamp01(rect.x),
    y: clamp01(rect.y),
    width: clamp01(rect.width),
    height: clamp01(rect.height),
  };
  return direction === 'right-to-left'
    ? {...normalized, x: 1 - normalized.x - normalized.width}
    : normalized;
};

export const mapPointToCrop = (point: PitchPoint, crop: PitchCrop = FULL_PITCH_CROP, direction: AttackDirection = 'left-to-right'): PitchPoint => {
  const oriented = orientPoint(point, direction);
  const orientedCrop = orientRect(crop, direction);
  return {
    x: (oriented.x - orientedCrop.x) / Math.max(0.0001, orientedCrop.width),
    y: (oriented.y - orientedCrop.y) / Math.max(0.0001, orientedCrop.height),
  };
};

export const mapRectToCrop = (rect: PitchRect, crop: PitchCrop = FULL_PITCH_CROP, direction: AttackDirection = 'left-to-right'): PitchRect => {
  const oriented = orientRect(rect, direction);
  const orientedCrop = orientRect(crop, direction);
  return {
    x: (oriented.x - orientedCrop.x) / Math.max(0.0001, orientedCrop.width),
    y: (oriented.y - orientedCrop.y) / Math.max(0.0001, orientedCrop.height),
    width: oriented.width / Math.max(0.0001, orientedCrop.width),
    height: oriented.height / Math.max(0.0001, orientedCrop.height),
  };
};

export const pitchPointToSvg = (point: PitchPoint, crop: PitchCrop = FULL_PITCH_CROP, direction: AttackDirection = 'left-to-right'): [number, number] => {
  const mapped = mapPointToCrop(point, crop, direction);
  return [mapped.x * PITCH_LENGTH, mapped.y * PITCH_WIDTH];
};

export const pitchRectToSvg = (rect: PitchRect, crop: PitchCrop = FULL_PITCH_CROP, direction: AttackDirection = 'left-to-right') => {
  const mapped = mapRectToCrop(rect, crop, direction);
  return {x: mapped.x * PITCH_LENGTH, y: mapped.y * PITCH_WIDTH, width: mapped.width * PITCH_LENGTH, height: mapped.height * PITCH_WIDTH};
};

export const playerPoint = (player: TacticalPlayer): PitchPoint =>
  resolvePoint(player.position ?? (player.x !== undefined && player.y !== undefined ? {x: player.x, y: player.y} : undefined));

export const zoneRect = (zone: TacticalZone | TacticalKitZone): PitchRect => {
  if ('rect' in zone) return resolveRect(zone.rect);
  const legacy = {x: zone.x, y: zone.y, width: zone.width, height: zone.height};
  const scale = legacy.x > 1 || legacy.y > 1 || legacy.width > 1 || legacy.height > 1 ? 100 : 1;
  return resolveRect({x: legacy.x / scale, y: legacy.y / scale, width: legacy.width / scale, height: legacy.height / scale});
};

export const resolveRect = (rect: PitchRect): PitchRect => ({
  x: clamp01(rect.x),
  y: clamp01(rect.y),
  width: clamp01(rect.width),
  height: clamp01(rect.height),
});

export const arrowPoints = (arrow: TacticalArrow): {from: PitchPoint; to: PitchPoint} => {
  const toPoint = (value: [number, number] | PitchPoint): PitchPoint => Array.isArray(value) ? {x: value[0], y: value[1]} : value;
  return {from: resolvePoint(toPoint(arrow.from)), to: resolvePoint(toPoint(arrow.to))};
};

export const cropToViewBox = (crop: PitchCrop): string => `${crop.x * PITCH_LENGTH} ${crop.y * PITCH_WIDTH} ${crop.width * PITCH_LENGTH} ${crop.height * PITCH_WIDTH}`;
