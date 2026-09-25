import {tacticalProgress} from '../tactical/motion';

export const zoneRevealProgress = (frame: number, startFrame: number, durationInFrames = 14): number => tacticalProgress(frame, startFrame, durationInFrames);

