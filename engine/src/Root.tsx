import React from 'react';
import {Composition, Folder, useCurrentFrame} from 'remotion';
import {demoSceneDocument} from './demoData';
import {SceneRenderer} from './scenes/SceneRenderer';
import {validateSceneDocument} from './schema';
import type {SceneSpec} from './types';

const sceneForFrame = (frame: number, scenes: SceneSpec[]): SceneSpec => scenes.find((scene) => frame >= scene.startFrame && frame < scene.startFrame + scene.durationInFrames) ?? scenes[scenes.length - 1];

const DemoComposition: React.FC = () => {
  const document = demoSceneDocument;
  const check = validateSceneDocument(document);
  if (!check.valid) throw new Error(check.errors.join('\n'));
  return <SceneTimeline scenes={document.scenes} />;
};

const SceneTimeline: React.FC<{scenes: SceneSpec[]}> = ({scenes}) => {
  const frame = useCurrentFrame();
  return <SceneRenderer scene={sceneForFrame(frame, scenes)} />;
};

export const Root: React.FC = () => <>
  <Folder name="FEE">
    <Composition id="FEE-60s-Demo" component={DemoComposition} durationInFrames={1800} fps={30} width={1920} height={1080} />
  </Folder>
</>;
