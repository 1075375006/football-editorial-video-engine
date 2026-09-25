import {tacticalProgress} from '../tactical/motion';

/** 0 before the focus transition, 1 once non-focused players are dimmed. */
export const freezeFocusProgress = (frame: number, startFrame: number, durationInFrames = 18): number => tacticalProgress(frame, startFrame, durationInFrames);

