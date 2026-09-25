import type {AssetRequest} from './types';

export const ASSET_NEGATIVE_PROMPT = 'NO TEXT, NO NUMBERS, NO SCORE, NO DATE, NO LOGOS, NO CRESTS, NO UI, NO INFOGRAPHIC, NO WATERMARK, NO GENERATED LABELS';

const treatmentByType: Record<AssetRequest['type'], string> = {
  'ENV-STADIUM': 'editorial stadium environment, quiet negative space for typography',
  'ENV-CITY': 'editorial city environment with paper print texture, quiet negative space',
  'ENV-HISTORY': 'editorial historical atmosphere, archival paper texture, no factual details',
  'SUB-PLAYER': 'editorial cutout portrait of a football player, strong silhouette, isolated subject',
  'SUB-COACH': 'editorial cutout portrait of a football coach, strong silhouette, isolated subject',
  'SUB-TROPHY': 'editorial cutout trophy object, strong silhouette, isolated subject',
  'SUB-STADIUM': 'editorial stadium cutout, strong silhouette, isolated subject',
};

export const compileAssetPrompt = (request: AssetRequest): string => {
  const subject = request.subject.trim();
  if (!subject) throw new Error('AssetRequest.subject is required');
  const treatment = request.treatment?.trim() || treatmentByType[request.type];
  const pose = request.pose ? `pose: ${request.pose}` : '';
  const orientation = request.orientation ? `orientation: ${request.orientation}` : '';
  const notes = request.notes ? `additional art direction: ${request.notes}` : '';
  return [
    'Football Editorial Explainer asset.',
    `type: ${request.type}`,
    `subject: ${subject}`,
    treatment,
    pose,
    orientation,
    'cream paper base, muted ink, one restrained accent, print/halftone texture, natural proportions, large negative space',
    notes,
    ASSET_NEGATIVE_PROMPT,
  ].filter(Boolean).join('\n');
};
